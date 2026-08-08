/* ══════════════════════════════════════════════════════
   SUPABASE CONFIG — fill in these two values
   ══════════════════════════════════════════════════════

   Values live in Supabase → Project Settings → API.

   ⚠ ONLY the publishable / anon key belongs here.
     Supabase names this key `sb_publishable_…` (formerly the
     "anon public" key). It is designed to ship in browser code
     and is safe here, because the database's row-level-security
     policies (see supabase-setup.sql) decide what it is actually
     allowed to do — read already-published articles, and nothing
     more until someone signs in.

     NEVER put the `sb_secret_…` key (formerly service_role) in
     this file. It bypasses every security rule, and this file is
     downloaded by every visitor to the site.
══════════════════════════════════════════════════════ */

window.SUPABASE_URL      = 'https://zzjjnhumerpcuvmyjwti.supabase.co';
window.SUPABASE_ANON_KEY = 'sb_publishable_4SbqTlztSGi0f3_hHuoBcA_w7h16Tdz';

/* ── Razorpay (donations) ──────────────────────────────
   Paste ONLY the Key ID here — it starts with `rzp_` and is meant to
   be public (Razorpay's own checkout needs it in the browser).

   ⚠ The Key SECRET must NEVER appear in this file or any other file
     the browser downloads. It lives only as a Supabase Edge Function
     secret (RAZORPAY_KEY_SECRET). Anyone holding the secret can issue
     refunds and read your payment history.
──────────────────────────────────────────────────────── */
window.RAZORPAY_KEY_ID = 'PASTE_YOUR_RAZORPAY_KEY_ID_HERE';

window.paymentsConfigured = function () {
  return !!(window.RAZORPAY_KEY_ID && window.RAZORPAY_KEY_ID.indexOf('PASTE_') !== 0);
};

/* Returns a ready Supabase client, or null if config is still
   unset / the library failed to load. Every page calls this and
   degrades gracefully rather than throwing. */
window.getSupabase = function () {
  if (!window.supabase || typeof window.supabase.createClient !== 'function') return null;
  if (!window.SUPABASE_URL || window.SUPABASE_URL.indexOf('PASTE_') === 0) return null;
  if (!window.SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY.indexOf('PASTE_') === 0) return null;
  if (!window.__sbClient) {
    window.__sbClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }
  return window.__sbClient;
};

/* True when the site owner hasn't connected Supabase yet — used to
   show helpful setup messages instead of silent failures. */
window.supabaseConfigured = function () {
  return !!window.getSupabase();
};
