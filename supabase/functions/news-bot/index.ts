// ══════════════════════════════════════════════════════
//  VYATIRIKHT — AI news bot (Supabase Edge Function)
//
//  Picks the next topic, researches it with Claude's built-in web
//  search, writes an article in the site's voice, and files it as a
//  DRAFT for a human to approve. It never publishes on its own.
//
//  Deploy:
//    supabase functions deploy news-bot --no-verify-jwt
//
//  Secrets it needs (Supabase → Edge Functions → Secrets):
//    ANTHROPIC_API_KEY   your key from console.anthropic.com
//    BOT_SECRET          any long random string you invent
//
//  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
//
//  Access: EITHER a signed-in team member's token (the dashboard sends
//  its own session token — nothing secret ships to the browser) OR the
//  BOT_SECRET header (for schedulers, which have no user). Every call
//  spends real money, so anonymous access is refused.
// ══════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const BOT_SECRET = Deno.env.get("BOT_SECRET")!;
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

/** Give every failure a stable code the browser can key off.
    Mirrors the VYT-* scheme in errors.js. */
function classify(detail: string): string {
  const s = detail.toLowerCase();
  if (s.includes("anthropic_api_key")) return "VYT-BOT-NOKEY";
  if (s.includes("credit") || s.includes("insufficient")) return "VYT-BOT-CREDIT";
  if (s.includes("refusal") || s.includes("declined")) return "VYT-BOT-REFUSED";
  if (s.includes("overloaded")) return "VYT-BOT-BUSY";
  if (s.includes("rate limit") || s.includes("429")) return "VYT-RATE-429";
  if (s.includes("json") || s.includes("unbalanced")) return "VYT-BOT-BADJSON";
  if (s.includes("does not exist") || s.includes("relation")) return "VYT-DB-NOTABLE";
  if (s.includes("could not save")) return "VYT-DB-WRITE";
  return "VYT-BOT-FAIL";
}

/** How often a standing beat may run again. */
const CADENCE_MS: Record<string, number> = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70);
}

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

const SYSTEM_PROMPT = `You write for Vyatirikht, a Pune-based creative studio's blog. Its voice is plain, direct, and practical — a working professional explaining something useful to another working professional.

House style, learned from the existing 90 articles:
- Short declarative sentences. No hype, no marketing voice, no exclamation marks.
- British/Indian English spellings (colour, organised, realise).
- Indian context and examples where they genuinely fit (rupees, Pune, Indian businesses) — never forced.
- Every article ends with one <blockquote class="blog-quote"> holding the single most useful takeaway.
- Never invent statistics, quotes, dates, or company claims. If a fact is uncertain, say so in the text rather than stating it confidently.
- Structure: 3-4 <h3> sections, each with 1-2 <p> paragraphs.

You have web search. Use it to ground the article in what is actually true right now. Prefer primary and reputable sources. If your search finds little of substance, say so honestly in the article instead of padding it.

Return your final answer as a single JSON object and nothing else, in exactly this shape:
{
  "title": "Headline, under 80 characters, specific not clickbaity",
  "excerpt": "One or two sentences that make someone want to read on.",
  "read_time": "5 min",
  "body": "<h3>...</h3><p>...</p>... ending with <blockquote class=\\"blog-quote\\">...</blockquote>",
  "sources": ["https://...", "https://..."],
  "confidence": "high | medium | low — how well-grounded this is in what you actually found"
}
The body must be valid HTML using only <h3>, <p>, <strong>, <em>, and the final <blockquote>. No <script>, no <style>, no inline event handlers, no <img>.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  // ── Gate: this endpoint spends money, so it must not be public ──
  // Path A: a scheduler presenting the shared secret.
  // Path B: a signed-in team member (dashboard sends their own token,
  //         so no secret ever ships to the browser).
  //
  // We remember WHICH path let the caller in. Auto-publish is a
  // trusted-scheduler-only power: a browser user (even signed in)
  // must always land in the draft queue for review, so the request
  // to skip review can only come from something holding the secret,
  // which never reaches the browser.
  const viaScheduler = !!(BOT_SECRET && req.headers.get("x-bot-secret") === BOT_SECRET);
  let authorized = viaScheduler;
  if (!authorized) {
    const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (bearer) {
      const { data, error } = await db.auth.getUser(bearer);
      authorized = !error && !!data?.user;
    }
  }
  if (!authorized) {
    return json({ ok: false, code: "VYT-AUTH-401", error: "Not signed in, or the session has expired." }, 401);
  }

  if (!ANTHROPIC_API_KEY) {
    return json({
      ok: false,
      code: "VYT-BOT-NOKEY",
      error: "The ANTHROPIC_API_KEY secret is not set on this function.",
    }, 500);
  }
  let topic: any = null;

  try {
    const body = await req.json().catch(() => ({}));

    // ── 1. Choose a topic ──────────────────────────────
    if (body.topic_id) {
      const { data } = await db.from("bot_topics").select("*").eq("id", body.topic_id).maybeSingle();
      topic = data;
    } else {
      // One-off suggestions first — they're what a human just asked for.
      const { data: suggestions } = await db
        .from("bot_topics").select("*")
        .eq("kind", "suggestion").eq("status", "pending")
        .order("created_at", { ascending: true }).limit(1);
      topic = suggestions?.[0] ?? null;

      // Otherwise the standing beat that's been waiting longest and is due.
      if (!topic) {
        const { data: beats } = await db
          .from("bot_topics").select("*")
          .eq("kind", "beat").neq("status", "processing")
          .order("last_run_at", { ascending: true, nullsFirst: true });
        const now = Date.now();
        topic = (beats ?? []).find((b: any) => {
          if (!b.last_run_at) return true;
          const gap = CADENCE_MS[b.cadence ?? "weekly"] ?? CADENCE_MS.weekly;
          return now - new Date(b.last_run_at).getTime() >= gap;
        }) ?? null;
      }
    }

    if (!topic) return json({ ok: true, message: "Nothing to write — no pending suggestions and no beats are due." });

    await db.from("bot_topics").update({ status: "processing" }).eq("id", topic.id);

    // ── 2. Research + write, in one grounded call ──────
    const userPrompt =
      `Write an article for the "${topic.category}" section about: ${topic.topic}` +
      (topic.guidance ? `\n\nExtra direction from the editor: ${topic.guidance}` : "") +
      `\n\nSearch the web first so the piece reflects what is actually true as of today (${new Date().toISOString().slice(0, 10)}). ` +
      `Then write the article and return only the JSON object.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        thinking: { type: "adaptive" },
        output_config: { effort: "medium" },
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${(await res.text()).slice(0, 400)}`);
    const msg = await res.json();

    // A safety classifier can decline; that is a 200 with stop_reason "refusal".
    if (msg.stop_reason === "refusal") {
      throw new Error("Claude declined to write this topic (safety refusal). Try rewording it.");
    }

    const text = (msg.content ?? [])
      .filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n");
    const article = extractJson(text);

    if (!article.title || !article.body) throw new Error("Model output was missing a title or body.");

    // ── 3. File the article ────────────────────────────
    // Default is DRAFT — a human approves it, which is what keeps the
    // "reviewed by a human before publishing" promise on the Terms
    // page true. Auto-publish is only honoured when ALL of:
    //   • the caller came in via the scheduler secret (not a browser),
    //   • the request explicitly asked for it, AND
    //   • the model rated the piece "high" confidence.
    // A low- or medium-confidence article on a live news topic still
    // waits for a person, even under full automation.
    const wantsAutoPublish = viaScheduler && body.auto_publish === true;
    const confident = String(article.confidence ?? "").toLowerCase() === "high";
    const publish = wantsAutoPublish && confident;
    const status = publish ? "published" : "draft";

    let slug = slugify(article.title) || `bot-${Date.now()}`;
    const { data: clash } = await db.from("articles").select("id").eq("slug", slug).maybeSingle();
    if (clash) slug = `${slug}-${Date.now().toString().slice(-5)}`;

    const { data: inserted, error: insErr } = await db.from("articles").insert({
      slug,
      title: String(article.title).slice(0, 300),
      category: topic.category,
      excerpt: article.excerpt ?? "",
      body: article.body,
      read_time: article.read_time ?? "5 min",
      author: "Vyatirikht News Bot",
      publish_at: new Date().toISOString(),
      status,
      source_urls: Array.isArray(article.sources) ? article.sources.slice(0, 12) : null,
      generated_by: "news-bot",
    }).select("id").single();
    if (insErr) throw new Error(`Could not save draft: ${insErr.message}`);

    // ── 4. Bookkeeping ─────────────────────────────────
    await db.from("bot_topics").update({
      status: topic.kind === "beat" ? "pending" : "done",   // beats stay in rotation
      last_run_at: new Date().toISOString(),
      last_error: null,
    }).eq("id", topic.id);

    await db.from("bot_runs").insert({
      topic_id: topic.id, article_id: inserted.id, ok: true,
      detail: `${publish ? "Published" : "Drafted"} "${article.title}" ` +
              `(confidence: ${article.confidence ?? "unknown"}` +
              `${wantsAutoPublish && !confident ? "; auto-publish requested but held for review — not high confidence" : ""})`,
    });

    return json({
      ok: true,
      article_id: inserted.id,
      title: article.title,
      status,
      published: publish,
      confidence: article.confidence ?? null,
      sources: article.sources ?? [],
      usage: msg.usage ?? null,
    });

  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    const code = classify(detail);
    if (topic) {
      await db.from("bot_topics").update({ status: "failed", last_error: `[${code}] ${detail}` }).eq("id", topic.id);
      await db.from("bot_runs").insert({ topic_id: topic.id, ok: false, detail: `[${code}] ${detail}` });
    }
    return json({ ok: false, code, error: detail }, 500);
  }
});
