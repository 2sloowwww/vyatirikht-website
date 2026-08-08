/* ══════════════════════════════════════════════════════
   THE VAULT — email-gated resource library
   ══════════════════════════════════════════════════════

   ⚠ READ THIS BEFORE TRUSTING THE GATE
   This is a SOFT gate — a conversion device, not security.
   The Drive URL below ships in this file, so anyone who opens
   devtools (or just reads the source) reaches the folder without
   giving an email. That is the normal trade-off for this pattern
   and it is a deliberate choice for free resources.

   Two consequences worth knowing while this is live:

   1. A Google Drive folder link is public to anyone holding it.
      Once it is out, it is out — it can be reshared, and the only
      way to revoke access is to change the link, which breaks it
      for everyone who already has it.

   2. Drive enforces a per-file download quota. A file that gets
      popular starts returning "can't download at this time" to
      everyone for roughly 24 hours, and there is no way to lift
      it on demand. Expect this if a pack takes off.

   The version that actually holds: files in private object storage
   (R2 or Supabase Storage), with an Edge Function checking the
   session and returning a short-lived signed URL. Worth doing when
   the traffic justifies it — not before.
   ══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Where the files live ─────────────────────────────
     Everything sits in one shared Google Drive folder, so every
     card opens the same place. The cards below are a manifest of
     what is inside — they are not separate downloads. Keep them
     honest: if a pack is not actually in the folder, take it off
     this list, or people will go looking for it. */
  var VAULT_URL = 'https://drive.google.com/drive/folders/1s-j8G9mwSNS5qZxidml2q2dz6IEssg07?usp=drive_link';

  /* ── The shelf ────────────────────────────────────────
     `ready: true`  → in the Drive folder now; the card links to it.
     `ready: false` → not there yet; renders as a dead "Coming soon"
                      card so nobody hands over an email chasing it.

     `n` is the file count on the card. Leave it null when you have
     not counted — the card then says "In the vault" instead of
     inventing a number.

     ⚠ Only the After Effects entries are marked ready, because those
     are the only files currently in the folder. Before promoting
     this page, check the four AE names below actually match what is
     in Drive — they are my best guess at how the pack splits up, not
     something I have seen. Rename or merge them freely. */
  var ITEMS = [
    { name: 'Titles & Lower Thirds',   kind: 'After Effects', fmt: '.aep', n: null, ready: true,
      desc: 'Name plates and caption builds for interviews and brand films. Editable text, no plugins needed.' },

    { name: 'Logo Stings & Reveals',   kind: 'After Effects', fmt: '.aep', n: null, ready: true,
      desc: 'Short brand animations for the top and tail of a film. Drop your logo into the placeholder comp.' },

    { name: 'Reel & Story Templates',  kind: 'After Effects', fmt: '.aep', n: null, ready: true,
      desc: 'Vertical 9:16 builds sized for Reels and Stories, with safe areas already marked.' },

    { name: 'Transitions & Overlays',  kind: 'After Effects', fmt: '.aep', n: null, ready: true,
      desc: 'Cuts, light leaks and grain passes I actually use, rather than the ones that date a video.' },

    /* ── Not in the folder yet ── */
    { name: 'Vyatirikht Signature LUTs', kind: 'LUT pack',  fmt: '.cube', n: null, ready: false,
      desc: 'The warm, low-contrast grade I use on brand films. Rec.709, log-ready.' },

    { name: 'Lightroom Presets',       kind: 'Lightroom',   fmt: '.xmp',  n: null, ready: false,
      desc: 'Product, portrait and night sets built on real client shoots.' },

    { name: 'Brand Deck Template',     kind: 'Keynote/PPT', fmt: '.key/.pptx', n: null, ready: false,
      desc: 'The deck structure I pitch with. Editorial layouts, no clip art.' },

    { name: 'Client Onboarding Kit',   kind: 'Docs',        fmt: '.docx', n: null, ready: false,
      desc: 'Contract, brief, usage-rights and invoice templates for creative work.' }
  ];

  var STORE  = 'vy-vault-unlocked';
  var grid   = document.getElementById('vaultGrid');
  var gate   = document.getElementById('gate');
  var head   = document.getElementById('vaultHead');
  var form   = document.getElementById('gateForm');
  var input  = document.getElementById('gateEmail');
  var btn    = document.getElementById('gateBtn');
  var msg    = document.getElementById('gateMsg');
  var relock = document.getElementById('vaultRelock');
  var countEl = document.getElementById('vaultCount');

  if (!grid || !form) return;

  /* Count only what is actually downloadable. Advertising 8 when 4 are
     real is the kind of small lie a visitor notices immediately. */
  var readyCount = ITEMS.filter(function (it) { return it.ready; }).length;
  if (countEl) countEl.textContent = readyCount;

  /* ── Render ─────────────────────────────────────────── */
  function card(it, i) {
    var el = document.createElement('article');
    el.className = 'v-card' + (it.ready ? '' : ' is-pending');
    el.style.setProperty('--i', i);

    /* Never print a fabricated file count. If n is unset, say something
       true instead. */
    var count = (typeof it.n === 'number' && it.n > 0)
      ? it.n + (it.n === 1 ? ' file' : ' files')
      : (it.ready ? 'In the vault' : 'Not yet added');
    el.innerHTML =
      '<div class="v-card-top">' +
        '<span class="v-kind">' + it.kind + '</span>' +
        '<span class="v-fmt">' + it.fmt + '</span>' +
      '</div>' +
      '<h3 class="v-name"></h3>' +
      '<p class="v-desc"></p>' +
      '<div class="v-foot">' +
        '<span class="v-count">' + count + '</span>' +
        (it.ready
          /* Cross-origin, so no `download` attribute — it is ignored
             off-origin and would only promise something the browser
             will not do. */
          ? '<a class="v-dl" href="' + VAULT_URL + '" target="_blank" rel="noopener noreferrer">' +
              '<span>Open in Drive</span>' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
              '<path d="M12 4v12M7 12l5 5 5-5M5 20h14"/></svg>' +
            '</a>'
          /* No href at all — a "Coming soon" card must not be clickable,
             or someone unlocks the vault and lands nowhere. */
          : '<span class="v-dl is-soon"><span>Coming soon</span></span>') +
      '</div>';
    /* textContent for anything author-supplied, so a stray < or &
       in a title can never become markup */
    el.querySelector('.v-name').textContent = it.name;
    el.querySelector('.v-desc').textContent = it.desc;
    return el;
  }

  ITEMS.forEach(function (it, i) { grid.appendChild(card(it, i)); });

  /* There is deliberately no file-availability check here.
     The old version HEAD-requested each link and marked failures as
     "Coming soon". That worked for same-origin files, but Drive is
     cross-origin and blocks the request, so every card would have
     flipped to "Coming soon" while the folder was perfectly fine.
     A cross-origin link cannot be probed from the browser — the only
     honest check is opening it yourself after changing the URL. */

  /* ── Lock state ─────────────────────────────────────── */
  function isUnlocked() {
    try { return localStorage.getItem(STORE) === '1'; } catch (e) { return false; }
  }

  function setUnlocked(on) {
    try { on ? localStorage.setItem(STORE, '1') : localStorage.removeItem(STORE); } catch (e) {}
    grid.classList.toggle('is-locked', !on);
    if (gate) gate.hidden = on;
    if (head) head.hidden = !on;
  }

  /* ── Submit ─────────────────────────────────────────── */
  function valid(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  function say(text, kind) {
    msg.textContent = text;
    msg.className = 'gate-msg' + (kind ? ' is-' + kind : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = (input.value || '').trim();

    if (!valid(email)) {
      say('That email does not look right — check it and try again.', 'err');
      input.focus();
      return;
    }

    btn.disabled = true;
    say('Opening…');

    var sb = null;
    try {
      if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
        sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
      }
    } catch (e) { sb = null; }

    /* No backend configured? Still unlock — the visitor kept their side
       of the bargain, and silently failing would just look broken. */
    if (!sb) {
      setUnlocked(true);
      say('');
      btn.disabled = false;
      return;
    }

    /* Plain INSERT, not upsert.
       Two reasons. First, `.upsert({...}, {onConflict:'email'})` could
       never work here: the unique index is on lower(email), an
       expression index, and ON CONFLICT (email) requires a unique index
       on the bare column. Postgres rejected it every time (42P10) and
       the catch below swallowed it — so the gate opened and the lead was
       silently thrown away. Second, upsert needs an UPDATE policy, and
       granting anon UPDATE on this table let anyone rewrite every row.
       A duplicate now simply means they have unlocked before. */
    sb.from('vault_leads')
      .insert({ email: email, source: 'vault' })
      .then(function (res) {
        btn.disabled = false;
        if (res && res.error && res.error.code !== '23505') {
          /* 23505 = already on the list, which is a success from the
             visitor's point of view. Anything else is a real failure,
             but blocking access over it punishes the wrong person. */
          console.warn('[vault] lead not stored:', res.error.message);
        }
        setUnlocked(true);
        say('');
      })
      .catch(function (err) {
        btn.disabled = false;
        console.warn('[vault] lead not stored:', err);
        setUnlocked(true);
        say('');
      });
  });

  if (relock) {
    relock.addEventListener('click', function () {
      setUnlocked(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  setUnlocked(isUnlocked());
})();
