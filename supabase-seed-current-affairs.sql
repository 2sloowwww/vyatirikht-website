-- ══════════════════════════════════════════════════════
--  VYATIRIKHT — daily "India current affairs" beat
--
--  Adds ONE standing beat the scheduler picks up each evening. The
--  bot searches the day's news, picks one story worth explaining,
--  and writes it in the house voice.
--
--  Run AFTER supabase-setup-bot.sql. Safe to run more than once —
--  it will not create a duplicate beat.
--
--  The guidance below is doing real work. Automated writing about
--  live Indian news is where a bot can most easily cause harm:
--  getting a fact wrong on a developing story, taking a side, or
--  stating something defamatory. The instructions push hard toward
--  explaining-not-editorialising, sourcing everything, and saying
--  plainly when the picture is still unclear.
-- ══════════════════════════════════════════════════════

insert into public.bot_topics (kind, topic, category, cadence, guidance, created_by)
select
  'beat',
  'One significant thing happening in India today, explained clearly for a general reader',
  'Business & Geopolitics',
  'daily',
  $g$Search today's Indian news first. Pick ONE story of genuine, lasting significance — policy, economy, technology, infrastructure, a court judgment, a notable business development — and explain it. Skip celebrity, sport, crime-of-the-day, and anything that will not matter in a month.

Your job is to explain, not to opine:
- Lead with what happened, plainly. Then the background someone needs to follow it, then why it matters to an ordinary person or a small business.
- Attribute every factual claim to a named, reputable source (a ministry, a court, established news organisations). If reporting conflicts, say so rather than picking one version.
- Do NOT take a political side, endorse or attack any party, leader or group, or predict what "should" happen. Describe, contextualise, stop.
- On anything still developing or contested, say clearly that it is unconfirmed or unfolding. Never state a rumour as fact. Never invent a number, a date, or a quote.
- Avoid anything defamatory about a named private individual. If a story centres on allegations, frame them as allegations and attribute them.
- If today's news genuinely offers nothing of substance worth a considered piece, say so honestly in a short article rather than inflating a minor item.

Keep the studio's plain, direct voice. British/Indian spellings. End on the single most useful takeaway in the blockquote.$g$,
  'seed'
where not exists (
  select 1 from public.bot_topics
  where created_by = 'seed'
    and category = 'Business & Geopolitics'
    and cadence = 'daily'
);

-- Confirm it landed:
--   select id, topic, cadence from public.bot_topics where cadence = 'daily';
