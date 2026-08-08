// ══════════════════════════════════════════════════════
//  VYATIRIKHT — create a Razorpay order (Supabase Edge Function)
//
//  The browser asks for an order; this creates it server-side using
//  the Razorpay SECRET and returns only the order id. The secret
//  never leaves the server.
//
//  Deploy:
//    supabase functions deploy donate-create-order --no-verify-jwt
//
//  Secrets (Supabase → Edge Functions → Secrets):
//    RAZORPAY_KEY_ID      starts with rzp_  (also used publicly)
//    RAZORPAY_KEY_SECRET  ⚠ server-only — never put this in any .js file
//
//  This endpoint is intentionally public: anyone must be able to start
//  a donation. It cannot move money — it only reserves an order. The
//  amount is clamped here so a tampered client cannot create an order
//  outside the allowed range.
// ══════════════════════════════════════════════════════

const KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

const MIN_PAISE = 100;        // ₹1
const MAX_PAISE = 10000000;   // ₹1,00,000 — a sanity ceiling, raise if you like

const CORS = {
  "Access-Control-Allow-Origin": "*",
  // apikey + x-client-info are sent by the browser on every
  // Supabase call; omitting them here makes the preflight fail and the
  // real request is never sent (surfaces as a generic network error).
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info, x-bot-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  if (!KEY_ID || !KEY_SECRET) {
    return json({ error: "Payments are not configured yet." }, 503);
  }

  try {
    const body = await req.json().catch(() => ({}));

    // Never trust a client-supplied amount. Coerce, floor, clamp.
    let paise = Math.floor(Number(body.amount_paise));
    if (!Number.isFinite(paise)) return json({ error: "Invalid amount." }, 400);
    if (paise < MIN_PAISE || paise > MAX_PAISE) {
      return json({ error: `Amount must be between ₹${MIN_PAISE / 100} and ₹${MAX_PAISE / 100}.` }, 400);
    }

    const auth = btoa(`${KEY_ID}:${KEY_SECRET}`);
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        amount: paise,
        currency: "INR",
        receipt: `donation_${Date.now()}`,
        notes: { purpose: "Support the Vyatirikht news bot" },
      }),
    });

    if (!res.ok) {
      // Don't echo Razorpay's raw error to the browser — it can contain
      // account details. Log it server-side, return something generic.
      console.error("Razorpay order failed:", res.status, await res.text());
      return json({ error: "Could not start the payment. Please try again." }, 502);
    }

    const order = await res.json();
    return json({ ok: true, order_id: order.id, amount: order.amount, currency: order.currency, key_id: KEY_ID });

  } catch (err) {
    console.error("create-order error:", err);
    return json({ error: "Something went wrong starting the payment." }, 500);
  }
});
