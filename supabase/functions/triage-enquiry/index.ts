// ══════════════════════════════════════════════════════
//  VYATIRIKHT — enquiry triage (Supabase Edge Function)
//
//  Reads one enquiry, and returns a summary, a suggested urgency,
//  a spam judgement, and a ready-to-send reply drafted in the
//  studio's voice. Writes them back onto the enquiry row.
//
//  It never sends anything. The draft lands in the dashboard for a
//  human to read, edit, and send themselves.
//
//  Deploy:
//    supabase functions deploy triage-enquiry
//
//  Secrets it needs (Supabase → Edge Functions → Secrets):
//    ANTHROPIC_API_KEY   your key from console.anthropic.com
//
//  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
//
//  Access: signed-in team members only. Each call spends real money,
//  so there is no anonymous path and no shared secret to leak.
// ══════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const MODEL = "claude-opus-4-8";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  // apikey + x-client-info are sent by the browser on every
  // Supabase call; omitting them here makes the preflight fail and the
  // real request is never sent (surfaces as a generic network error).
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info, x-bot-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

/** Pull the first balanced JSON object out of a model response. */
function extractJson(text: string): any {
  const start = text.indexOf("{");
  if (start === -1) throw new Error("No JSON object found in model output.");
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return JSON.parse(text.slice(start, i + 1));
    }
  }
  throw new Error("Unbalanced JSON in model output.");
}

const SYSTEM_PROMPT = `You are triaging an incoming enquiry for Vyatirikht, a Pune-based creative studio run by Jitendra Kulkarni. The studio does photography, filmmaking, branding, and social media management.

Your job is to save the studio time — not to talk to the client. A human reads everything you write and sends the reply themselves.

Write the suggested reply in the studio's voice:
- Plain, direct, warm but not gushing. A working professional replying to a potential client.
- British/Indian English spellings (colour, organised, realise).
- Short. Three or four sentences is usually right.
- Answer what they asked, then ask the one question that would most move things forward (usually date, location, or scope).
- Never quote a price, promise a delivery date, or commit to availability — the studio has not seen its own calendar. If they asked about cost, say the studio will come back with a figure once it knows the scope.
- Never invent details about past work, clients, or capabilities.
- Sign off as Jitendra.

Judge urgency honestly:
- "high" — a dated event close at hand (a wedding, a shoot, a launch), or someone explicitly saying they're deciding between studios now.
- "normal" — a genuine enquiry with no particular time pressure.
- "low" — vague interest, a question that isn't really a job, or someone just browsing.

Mark spam true only when it is clearly not a real enquiry: bulk SEO/marketing outreach, link selling, obvious bot text, gibberish. A short or badly-written message from a real person is NOT spam.

Return a single JSON object and nothing else, in exactly this shape:
{
  "summary": "One sentence: who this is and what they want.",
  "intent": "The concrete thing they're asking for, in a few words.",
  "urgency": "high | normal | low",
  "spam": false,
  "reply": "The suggested reply, plain text, with real line breaks between paragraphs.",
  "notes": "Anything the studio should check or be careful about before sending. Empty string if nothing."
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  // ── Gate: this endpoint spends money, so it must not be public ──
  // The dashboard sends the signed-in user's own token, so nothing
  // secret ever ships to the browser.
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const denied = () =>
    json({ ok: false, code: "VYT-AUTH-401", error: "Not signed in, or the session has expired." }, 401);
  if (!bearer) return denied();
  const { data: userData, error: userErr } = await db.auth.getUser(bearer);
  if (userErr || !userData?.user) return denied();

  if (!ANTHROPIC_API_KEY) {
    return json({ ok: false, code: "VYT-BOT-NOKEY", error: "The ANTHROPIC_API_KEY secret is not set on this function." }, 500);
  }

  try {
    const body = await req.json().catch(() => ({}));
    if (!body.enquiry_id) return json({ ok: false, code: "VYT-REQ-FIELD", error: "enquiry_id is required." }, 400);

    const { data: enq, error: enqErr } = await db
      .from("enquiries").select("*").eq("id", body.enquiry_id).maybeSingle();
    if (enqErr) throw new Error(`Could not read the enquiry: ${enqErr.message}`);
    if (!enq) return json({ ok: false, code: "VYT-DB-EMPTY", error: "That enquiry no longer exists." }, 404);

    // Build the enquiry exactly as it arrived — no invented context.
    const parts = [
      `Name: ${enq.name}`,
      enq.service ? `Service they picked: ${enq.service}` : null,
      enq.detail ? `Extra detail field: ${enq.detail}` : null,
      enq.contact_via ? `Prefers contact via: ${enq.contact_via}` : null,
      enq.email ? `Email: they left one` : `Email: none given`,
      `Received: ${new Date(enq.created_at).toISOString().slice(0, 10)}`,
      "",
      "Their message:",
      enq.message || "(they left the message field blank)",
    ].filter(Boolean).join("\n");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        thinking: { type: "adaptive" },
        // Triage is a short, well-specified task — low effort keeps it
        // fast and cheap without hurting the quality of a 4-sentence reply.
        output_config: { effort: "low" },
        messages: [{ role: "user", content: parts }],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${(await res.text()).slice(0, 400)}`);
    const msg = await res.json();

    // A safety classifier can decline; that is a 200 with stop_reason "refusal".
    if (msg.stop_reason === "refusal") {
      throw new Error("Claude declined to triage this enquiry. Read it manually.");
    }

    const text = (msg.content ?? [])
      .filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n");
    const t = extractJson(text);

    // Constrain urgency to the values the DB check allows, so a stray
    // model answer can't fail the write.
    const urgency = ["high", "normal", "low"].includes(t.urgency) ? t.urgency : "normal";

    const { error: upErr } = await db.from("enquiries").update({
      ai_summary: t.summary ?? null,
      ai_intent: t.intent ?? null,
      ai_urgency: urgency,
      ai_spam: t.spam === true,
      ai_reply: t.reply ?? null,
      ai_notes: t.notes || null,
      triaged_at: new Date().toISOString(),
    }).eq("id", enq.id);
    if (upErr) throw new Error(`Could not save the triage: ${upErr.message}`);

    return json({
      ok: true,
      enquiry_id: enq.id,
      summary: t.summary ?? null,
      intent: t.intent ?? null,
      urgency,
      spam: t.spam === true,
      reply: t.reply ?? null,
      notes: t.notes || null,
      usage: msg.usage ?? null,
    });

  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    const s = detail.toLowerCase();
    const code =
      s.includes("anthropic_api_key") ? "VYT-BOT-NOKEY"
      : s.includes("credit") || s.includes("insufficient") ? "VYT-BOT-CREDIT"
      : s.includes("declined") || s.includes("refusal") ? "VYT-BOT-REFUSED"
      : s.includes("overloaded") ? "VYT-BOT-BUSY"
      : s.includes("rate limit") ? "VYT-RATE-429"
      : s.includes("json") || s.includes("unbalanced") ? "VYT-BOT-BADJSON"
      : s.includes("does not exist") || s.includes("column") ? "VYT-DB-NOCOLUMN"
      : "VYT-TRIAGE-FAIL";
    return json({ ok: false, code, error: detail }, 500);
  }
});
