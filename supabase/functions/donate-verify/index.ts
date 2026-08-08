// ══════════════════════════════════════════════════════
//  VYATIRIKHT — verify a Razorpay payment (Supabase Edge Function)
//
//  ⚠ THIS IS THE SECURITY BOUNDARY OF THE WHOLE DONATION FLOW.
//
//  Razorpay hands the browser three values after payment. A browser
//  can fabricate all three. What it CANNOT fabricate is the signature,
//  because that is HMAC-SHA256(order_id|payment_id) keyed with your
//  secret — which only this server knows.
//
//  So: nothing is recorded until the signature verifies. A forged
//  "I paid!" call from a hostile client records nothing and returns 400.
//
//  Deploy:
//    supabase functions deploy donate-verify --no-verify-jwt
//
//  Secrets: RAZORPAY_KEY_SECRET (server-only)
//  SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.
// ══════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

/** Constant-time-ish comparison so we don't leak signature bytes via timing. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacHex(message: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!KEY_SECRET) return json({ error: "Payments are not configured yet." }, 503);

  try {
    const b = await req.json().catch(() => ({}));
    const orderId = String(b.razorpay_order_id ?? "");
    const paymentId = String(b.razorpay_payment_id ?? "");
    const signature = String(b.razorpay_signature ?? "");

    if (!orderId || !paymentId || !signature) {
      return json({ error: "Missing payment details." }, 400);
    }

    // ── The check that makes this trustworthy ──
    const expected = await hmacHex(`${orderId}|${paymentId}`, KEY_SECRET);
    if (!safeEqual(expected, signature)) {
      console.warn("Rejected donation with bad signature:", { orderId, paymentId });
      return json({ error: "Payment could not be verified." }, 400);
    }

    const db = createClient(SUPABASE_URL, SERVICE_KEY);

    // Re-fetch the real amount from Razorpay rather than trusting the
    // client — the browser could otherwise claim a ₹5 payment was ₹5000.
    let amountPaise = 0;
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    if (keyId) {
      const auth = btoa(`${keyId}:${KEY_SECRET}`);
      const pr = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Basic ${auth}` },
      });
      if (pr.ok) {
        const payment = await pr.json();
        amountPaise = Number(payment.amount) || 0;
        if (payment.status !== "captured" && payment.status !== "authorized") {
          return json({ error: "Payment is not complete." }, 400);
        }
      }
    }

    const { error } = await db.from("donations").insert({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      amount_paise: amountPaise,
      donor_name: (b.donor_name ?? "").toString().slice(0, 120) || null,
      donor_email: (b.donor_email ?? "").toString().slice(0, 200) || null,
      message: (b.message ?? "").toString().slice(0, 500) || null,
      status: "paid",
    });

    // A duplicate payment id means we already banked this one — that's
    // success from the donor's point of view, not an error.
    if (error && !/duplicate|unique/i.test(error.message)) {
      console.error("Could not record donation:", error.message);
      return json({ error: "Payment verified but could not be recorded. Please contact us." }, 500);
    }

    return json({ ok: true, amount_paise: amountPaise });

  } catch (err) {
    console.error("verify error:", err);
    return json({ error: "Something went wrong verifying the payment." }, 500);
  }
});
