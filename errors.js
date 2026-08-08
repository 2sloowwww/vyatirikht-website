/* ══════════════════════════════════════════════════════
   VYATIRIKHT — shared error handling

   One job: turn any failure — a thrown exception, a fetch
   Response, a Supabase/Postgres error, an Edge Function's JSON —
   into the same three things:

     code     a short stable identifier, e.g. VYT-AUTH-401
     message  what actually went wrong, in plain words
     detail   the raw underlying text, for us

   The rule this exists to enforce: NEVER show "unknown error".
   If we genuinely can't identify a failure we still show its
   status, its raw body, and a code — enough to act on.

   Load before any script that calls the network:
     <script src="errors.js"></script>
══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Postgres / PostgREST codes worth naming. The two "undefined"
     ones are the most common failure here by far — they mean a
     setup .sql file hasn't been run yet. */
  var PG = {
    '42501': { code: 'VYT-DB-RLS',      msg: 'The database refused that — your account may not have permission.' },
    '42P01': { code: 'VYT-DB-NOTABLE',  msg: 'A database table is missing. A setup .sql file has not been run yet.' },
    '42703': { code: 'VYT-DB-NOCOLUMN', msg: 'A database column is missing. A setup .sql file has not been run yet.' },
    '23505': { code: 'VYT-DB-DUPLICATE',msg: 'That already exists.' },
    '23503': { code: 'VYT-DB-LINK',     msg: 'That refers to something which no longer exists.' },
    '23514': { code: 'VYT-DB-CHECK',    msg: 'One of the values is not allowed by the database rules.' },
    'PGRST116': { code: 'VYT-DB-EMPTY', msg: 'Nothing found.' },
    'PGRST301': { code: 'VYT-AUTH-JWT', msg: 'Your session is not valid any more. Sign in again.' }
  };

  /* HTTP status → what it means for us specifically. `area` lets a
     caller say "this was the bot" so 404 can mean "not deployed". */
  function fromStatus(status, area) {
    switch (true) {
      case status === 401:
        /* On a function call a 401 is more often the Supabase gateway
           rejecting the request (missing/!wrong apikey header) than an
           expired login — the function itself never runs, so the body
           comes back empty. Say both, most likely first. */
        return area === 'function'
          ? { code: 'VYT-AUTH-401', msg: 'The function gateway rejected the call — check the apikey header and that the function is deployed. If that is fine, your session may have expired: sign in again.' }
          : { code: 'VYT-AUTH-401', msg: 'Your session has expired. Sign in again.' };
      case status === 403:
        return { code: 'VYT-AUTH-403', msg: 'Signed in, but not allowed to do that.' };
      case status === 404:
        return area === 'function'
          ? { code: 'VYT-FN-404', msg: 'That function is not deployed yet, or is deployed under a different name.' }
          : { code: 'VYT-HTTP-404', msg: 'Not found.' };
      case status === 408:
        return { code: 'VYT-NET-TIMEOUT', msg: 'The request took too long and was cut off.' };
      case status === 413:
        return { code: 'VYT-HTTP-413', msg: 'That was too large to send.' };
      case status === 429:
        return { code: 'VYT-RATE-429', msg: 'Too many requests in a row. Wait a moment and try again.' };
      case status === 546 || status === 504:
        return { code: 'VYT-FN-TIMEOUT', msg: 'The function ran too long and was stopped.' };
      case status >= 500:
        return { code: 'VYT-SRV-' + status, msg: 'The server failed while handling that.' };
      case status >= 400:
        return { code: 'VYT-HTTP-' + status, msg: 'The request was rejected.' };
      default:
        return { code: 'VYT-HTTP-' + status, msg: 'Unexpected response.' };
    }
  }

  /* Payloads disagree about where the message lives. Supabase's
     gateway uses `message`/`msg`; our functions use `error`;
     PostgREST uses `message` + `details` + `hint`; OAuth-style
     errors use `error_description`. Read all of them. */
  function textFrom(o) {
    if (o == null) return '';
    if (typeof o === 'string') return o;
    var keys = ['error', 'message', 'msg', 'error_description', 'details', 'detail', 'hint'];
    var parts = [];
    for (var i = 0; i < keys.length; i++) {
      var v = o[keys[i]];
      if (typeof v === 'string' && v && parts.indexOf(v) === -1) parts.push(v);
      /* our functions can nest: { error: { message } } */
      else if (v && typeof v === 'object') {
        var inner = textFrom(v);
        if (inner && parts.indexOf(inner) === -1) parts.push(inner);
      }
    }
    return parts.join(' — ');
  }

  /* Recognise a few failures by their text when no code is given. */
  function fromText(t) {
    var s = (t || '').toLowerCase();
    if (!s) return null;
    if (s.indexOf('anthropic_api_key') !== -1 || s.indexOf('api key') !== -1)
      return { code: 'VYT-BOT-NOKEY', msg: 'The ANTHROPIC_API_KEY secret is not set on the function.' };
    if (s.indexOf('credit') !== -1 || s.indexOf('insufficient') !== -1 || s.indexOf('quota') !== -1)
      return { code: 'VYT-BOT-CREDIT', msg: 'The Claude account is out of credit.' };
    if (s.indexOf('refusal') !== -1 || s.indexOf('declined') !== -1)
      return { code: 'VYT-BOT-REFUSED', msg: 'Claude declined this topic. Try rewording it.' };
    if (s.indexOf('overloaded') !== -1)
      return { code: 'VYT-BOT-BUSY', msg: 'Claude is overloaded right now. Try again shortly.' };
    if (s.indexOf('rate limit') !== -1 || s.indexOf('rate_limit') !== -1)
      return { code: 'VYT-RATE-429', msg: 'Rate limited. Wait a moment and try again.' };
    if (s.indexOf('json') !== -1 && s.indexOf('model output') !== -1)
      return { code: 'VYT-BOT-BADJSON', msg: 'Claude replied in an unexpected format. Running it again usually fixes this.' };
    return null;
  }

  /**
   * describe(input, opts) → { code, message, detail, status }
   *
   * input can be: an Error, a fetch Response, a Supabase error
   *   object, an Edge Function's parsed JSON body, or a string.
   * opts.area  'function' | 'db' | 'network' — sharpens the wording.
   * opts.status  HTTP status, when the body was already read.
   */
  function describe(input, opts) {
    opts = opts || {};
    var area = opts.area || '';
    var status = opts.status;

    /* 1. Offline / DNS / CORS — fetch rejects with a TypeError. */
    if (input instanceof TypeError ||
        (input && input.name === 'TypeError') ||
        (input && /failed to fetch|networkerror|load failed/i.test(input.message || ''))) {
      return {
        code: 'VYT-NET-OFFLINE',
        message: 'Could not reach the server. Check your connection.',
        detail: (input && input.message) || 'fetch failed',
        status: null
      };
    }

    /* 2. An aborted request. */
    if (input && (input.name === 'AbortError')) {
      return { code: 'VYT-NET-ABORT', message: 'That request was cancelled.', detail: 'aborted', status: null };
    }

    /* 3. A fetch Response handed to us directly. */
    if (typeof Response !== 'undefined' && input instanceof Response) {
      status = input.status;
      var s = fromStatus(status, area);
      return { code: s.code, message: s.msg, detail: 'HTTP ' + status + ' ' + (input.statusText || ''), status: status };
    }

    var raw = textFrom(input);

    /* 4. A Postgres / PostgREST error code. */
    var pgCode = input && (input.code || input.error_code);
    if (pgCode && PG[pgCode]) {
      return {
        code: PG[pgCode].code,
        message: PG[pgCode].msg,
        detail: raw || String(pgCode),
        status: status || null
      };
    }

    /* 5. Recognised by message text. */
    var byText = fromText(raw);
    if (byText) {
      return { code: byText.code, message: byText.msg, detail: raw, status: status || null };
    }

    /* 6. Known HTTP status, message unrecognised — still useful.
          A proxy or gateway failure often returns an HTML page; showing
          markup to a visitor looks broken, so keep it in `detail` and
          show the status wording instead. */
    if (typeof status === 'number') {
      var h = fromStatus(status, area);
      var looksLikeMarkup = /^\s*<(!doctype|html|head|body|\?xml)/i.test(raw);
      return {
        code: h.code,
        /* Prefer the server's own words — unless they're a web page. */
        message: (raw && !looksLikeMarkup) ? raw : h.msg,
        detail: raw ? ('HTTP ' + status + ' — ' + raw) : ('HTTP ' + status),
        status: status
      };
    }

    /* 7. Last resort — never "unknown error". Show what we have. */
    if (raw) {
      return { code: 'VYT-ERR', message: raw, detail: raw, status: null };
    }
    var dump = '';
    try { dump = JSON.stringify(input); } catch (e) { dump = String(input); }
    return {
      code: 'VYT-ERR-OPAQUE',
      message: 'Something failed and gave no reason. Details: ' + (dump || String(input)).slice(0, 300),
      detail: dump,
      status: null
    };
  }

  /**
   * Read a fetch Response and describe it in one step. Resolves to
   * { ok:true, data } on success or { ok:false, err } on failure —
   * handling the case where the body isn't JSON at all (an HTML
   * error page, an empty 502) without throwing.
   */
  function readResponse(res, opts) {
    opts = opts || {};
    return res.text().then(function (body) {
      var data = null;
      try { data = body ? JSON.parse(body) : null; } catch (e) { /* not JSON */ }

      if (res.ok && data && data.ok !== false) return { ok: true, data: data };

      /* Non-JSON body (HTML error page, plain text) — keep the text. */
      var payload = data !== null ? data : (body || '').slice(0, 300);
      return {
        ok: false,
        data: data,
        err: describe(payload, { status: res.status, area: opts.area || 'function' })
      };
    });
  }

  /** "Session expired. Sign in again. [VYT-AUTH-401]" */
  function format(err) {
    if (!err) return 'Something failed. [VYT-ERR]';
    return err.message + ' [' + err.code + ']';
  }

  window.VYT_ERR = {
    describe: describe,
    readResponse: readResponse,
    format: format,
    /** Describe + log the full detail to the console for us. */
    report: function (input, opts) {
      var e = describe(input, opts);
      try {
        console.error('[' + e.code + ']', e.message, '\n  detail:', e.detail, '\n  raw:', input);
      } catch (_) {}
      return e;
    }
  };
})();
