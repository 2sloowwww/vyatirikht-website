// ══════════════════════════════════════════════════════
//  VYATIRIKHT — Instagram post from a blog article (Edge Function)
//
//  Reads one article, and writes an Instagram post from it: a hook,
//  a caption, a carousel of slide text, and hashtags. Stores it in
//  social_posts for a human to review and post. It never posts to
//  Instagram — that stays a manual step.
//
//  Deploy:
//    supabase functions deploy generate-instagram
//
//  Secrets it needs (Supabase → Edge Functions → Secrets):
//    ANTHROPIC_API_KEY   your key from console.anthropic.com
//
//  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
//
//  Access: signed-in team only. Each call spends money, so there is
//  no anonymous path and no shared secret to leak.
// ══════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const MODEL = "claude-opus-4-8";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
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

/** Strip HTML to plain text so the model works from the words, not markup. */
function stripHtml(s: string): string {
  return String(s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();
}

const SYSTEM_PROMPT = `You turn a blog article from Vyatirikht — a Pune-based creative studio (photography, film, branding, social media) — into one Instagram post that makes someone stop scrolling and read.

Vyatirikht runs social media for clients, so this post is also a live sample of that work. It must look like a studio that knows the platform.

Voice: plain, direct, useful. A working professional sharing something worth knowing — never a motivational-quote account. British/Indian English spellings. No emoji-stuffing (one or two, placed well, is the ceiling). No "Link in bio!!!" energy.

Write for the carousel format, because that is what performs:
- A hook line: the cover slide. Short, concrete, makes a specific promise or poses a real question. Not clickbait — the actual most interesting point.
- 4 to 6 carousel slides: each one idea, a sentence or two, readable on a phone in a second. Draw them from the article's real substance. Do not pad.
- A caption: 3 to 5 short lines that expand the hook, then a soft call to read the full piece. End with a single clear line pointing to the blog.
- Hashtags: 8 to 12, mixing broad and niche, relevant to the actual topic and to a Pune / India creative audience. No banned or spammy tags, nothing irrelevant.

Never invent statistics, quotes, or claims that are not in the article. If the article is thin, make a shorter honest post rather than inflating it.

Return a single JSON object and nothing else, in exactly this shape:
{
  "hook": "The cover-slide line.",
  "carousel": ["Slide 2 text", "Slide 3 text", "Slide 4 text", "..."],
  "caption": "The caption, with real line breaks between lines.",
  "hashtags": "#tag1 #tag2 #tag3 …"
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  // ── Gate: signed-in team members only ──
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
    if (!body.article_id) return json({ ok: false, code: "VYT-REQ-FIELD", error: "article_id is required." }, 400);

    const { data: art, error: artErr } = await db
      .from("articles").select("id,title,excerpt,body,category,slug").eq("id", body.article_id).maybeSingle();
    if (artErr) throw new Error(`Could not read the article: ${artErr.message}`);
    if (!art) return json({ ok: false, code: "VYT-DB-EMPTY", error: "That article no longer exists." }, 404);

    const userPrompt =
      `Article title: ${art.title}\n` +
      `Category: ${art.category}\n` +
      (art.excerpt ? `Excerpt: ${art.excerpt}\n` : "") +
      `\nArticle text:\n${stripHtml(art.body).slice(0, 6000)}\n\n` +
      `Write the Instagram post and return only the JSON object.`;

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
        // Short, well-specified writing task — low effort keeps it cheap.
        output_config: { effort: "low" },
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${(await res.text()).slice(0, 400)}`);
    const msg = await res.json();

    if (msg.stop_reason === "refusal") {
      throw new Error("Claude declined to write a post for this article.");
    }

    const text = (msg.content ?? [])
      .filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n");
    const post = extractJson(text);

    const carousel = Array.isArray(post.carousel) ? post.carousel.slice(0, 8).map((s: any) => String(s)) : [];

    const { data: inserted, error: insErr } = await db.from("social_posts").insert({
      article_id: art.id,
      platform: "instagram",
      hook: post.hook ?? null,
      caption: post.caption ?? null,
      hashtags: post.hashtags ?? null,
      carousel: carousel,
      status: "draft",
    }).select("id").single();
    if (insErr) throw new Error(`Could not save the post: ${insErr.message}`);

    return json({
      ok: true,
      id: inserted.id,
      article_id: art.id,
      hook: post.hook ?? null,
      caption: post.caption ?? null,
      hashtags: post.hashtags ?? null,
      carousel,
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
      : "VYT-SOCIAL-FAIL";
    return json({ ok: false, code, error: detail }, 500);
  }
});
