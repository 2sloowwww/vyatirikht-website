/* ══════════════════════════════════════════════════════
   VYATIRIKHT — journal.js
   The index page for blog.html: date-gating, category
   filtering, and the articles the news bot writes into
   Supabase (which have no static page of their own, so
   they open inline).
══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var list = document.getElementById('postList');
  if (!list) return;

  /* Posts publish at 07:00 IST unless data-time says otherwise.
     IST is UTC+5:30, so subtract 330 minutes to get the UTC instant. */
  function publishedAt(date, time) {
    var d = date.split('-');
    var t = (time || '07:00').split(':');
    return new Date(Date.UTC(+d[0], +d[1] - 1, +d[2]) + ((+t[0]) * 60 + (+t[1]) - 330) * 60000);
  }

  var state = 'all';

  function sortKey(row) {
    return row.getAttribute('data-publish') + 'T' + (row.getAttribute('data-time') || '07:00');
  }

  /* Newest first, whatever order rows arrived in. */
  function reorder() {
    [].slice.call(list.querySelectorAll('.post-row'))
      .sort(function (a, b) { return sortKey(a) < sortKey(b) ? 1 : -1; })
      .forEach(function (row) { list.appendChild(row); });
  }

  function render() {
    var now = new Date();
    list.querySelectorAll('[data-publish]').forEach(function (row) {
      var live = now >= publishedAt(row.getAttribute('data-publish'), row.getAttribute('data-time'));
      var match = state === 'all' || row.getAttribute('data-cat') === state;
      row.style.display = (live && match) ? '' : 'none';
    });
  }

  var filters = document.getElementById('filters');
  if (filters) {
    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      state = btn.getAttribute('data-cat');
      filters.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b === btn); });
      render();
    });
  }

  render();

  /* ── Articles written by the news bot ──────────────────
     Anything the bot has written since the static pages were generated
     lives only in the database, so there is no page to link to — those
     rows expand in place instead.

     Most of the table is NOT that, though: the archive was imported
     into `articles`, so ~74 rows are copies of posts that already have
     a page under blog/. Those must be skipped by slug, or every one of
     them is listed twice. The static page wins because it is a real
     URL — which is the entire reason those pages exist. The cost is
     that dashboard edits to an imported article do not show here until
     build-article-pages.js is re-run. */
  var sb = window.getSupabase ? window.getSupabase() : null;
  if (!sb) return;

  var haveStatic = {};
  list.querySelectorAll('a.post-row[href]').forEach(function (a) {
    haveStatic[a.getAttribute('href').replace(/^blog\//, '').replace(/\.html$/, '')] = true;
  });

  function trim(s, n) {
    s = String(s || '').replace(/\s+/g, ' ').trim();
    return s.length > n ? s.slice(0, n - 3).replace(/\s+\S*$/, '') + '…' : s;
  }

  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  /* The bot writes `body` from web-search results it does not control,
     so that column is untrusted markup. Parse with DOMParser rather than
     innerHTML: a DOMParser document has no browsing context, so images
     never load and scripts never run while we inspect it. Assigning to
     innerHTML first would fire `<img src=x onerror=…>` before we could
     strip it. */
  var ALLOWED_TAGS = { H3:1, H4:1, P:1, BR:1, STRONG:1, B:1, EM:1, I:1, UL:1, OL:1, LI:1, BLOCKQUOTE:1, CODE:1, A:1 };

  function sanitize(html) {
    var doc = new DOMParser().parseFromString(
      '<!doctype html><body>' + String(html == null ? '' : html) + '</body>', 'text/html');

    (function walk(node) {
      var child = node.firstChild;
      while (child) {
        var next = child.nextSibling;
        if (child.nodeType === 3) { child = next; continue; }      /* text is safe */
        if (child.nodeType !== 1) { child.remove(); child = next; continue; }

        if (!ALLOWED_TAGS[child.tagName]) {
          if (child.tagName === 'SCRIPT' || child.tagName === 'STYLE') {
            child.remove();                                        /* their text IS the payload */
          } else {
            /* Unwrap, so dropping a stray <div> does not swallow the
               paragraph inside it, and re-examine what was promoted. */
            var promoted = child.firstChild;
            while (child.firstChild) node.insertBefore(child.firstChild, child);
            child.remove();
            if (promoted) next = promoted;
          }
          child = next; continue;
        }

        Array.prototype.slice.call(child.attributes).forEach(function (a) {
          if (a.name.toLowerCase() !== 'href') { child.removeAttribute(a.name); return; }
          /* Entities are already decoded here, so &#106;avascript: fails
             this test like any other scheme. */
          if (!/^(https?:\/\/|mailto:|#|\/)/i.test((a.value || '').trim())) {
            child.removeAttribute(a.name);
          } else {
            child.setAttribute('rel', 'noopener nofollow');
            child.setAttribute('target', '_blank');
          }
        });
        walk(child);
        child = next;
      }
    })(doc.body);

    return doc.body.innerHTML;
  }

  function text(tag, cls, value) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    el.textContent = value;
    return el;
  }

  sb.from('articles').select('*').order('publish_at', { ascending: false }).then(function (res) {
    if (res.error || !res.data || !res.data.length) return;

    var added = 0;

    res.data.forEach(function (a) {
      if (a.status && a.status !== 'published') return;
      if (haveStatic[a.slug]) return;          /* already on the list, with a page */

      var ist = new Date(new Date(a.publish_at).getTime() + 330 * 60000);
      var date = ist.getUTCFullYear() + '-' +
                 String(ist.getUTCMonth() + 1).padStart(2, '0') + '-' +
                 String(ist.getUTCDate()).padStart(2, '0');
      var time = String(ist.getUTCHours()).padStart(2, '0') + ':' +
                 String(ist.getUTCMinutes()).padStart(2, '0');

      var row = document.createElement('div');
      row.className = 'post-row';
      row.setAttribute('data-publish', date);
      row.setAttribute('data-time', time);
      row.setAttribute('data-cat', a.category || '');

      row.appendChild(text('span', 'post-date',
        ist.getUTCDate() + ' ' + MONTHS[ist.getUTCMonth()] + ' ' + ist.getUTCFullYear()));

      var mid = document.createElement('span');
      mid.appendChild(text('span', 'post-title', a.title));
      mid.appendChild(text('span', 'post-excerpt', trim(a.excerpt, 108)));

      var body = document.createElement('div');
      body.className = 'post-body';
      body.innerHTML = sanitize(a.body);

      var more = text('button', 'post-more', 'Read');
      more.type = 'button';
      more.addEventListener('click', function () {
        var open = body.classList.toggle('open');
        more.textContent = open ? 'Close' : 'Read';
      });

      mid.appendChild(more);
      mid.appendChild(body);
      row.appendChild(mid);
      row.appendChild(text('span', 'post-cat', a.category || ''));

      list.appendChild(row);
      added++;
    });

    if (added) reorder();
    render();
  });
})();
