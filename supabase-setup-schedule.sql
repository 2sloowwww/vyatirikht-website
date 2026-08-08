-- ══════════════════════════════════════════════════════
--  VYATIRIKHT — daily 6 PM IST trigger for the news bot
--
--  Runs the news-bot Edge Function once a day. The function picks the
--  current-affairs beat (or any pending suggestion first), researches
--  it, and files the article.
--
--  This runs INSIDE Supabase using pg_cron (the scheduler) and pg_net
--  (outbound HTTP). No external cron service, nothing else to host.
--
--  ── BEFORE YOU RUN THIS ──
--  1. Set the BOT_SECRET Edge Function secret to a long random string
--     (Supabase → Edge Functions → Secrets). Invent one, e.g. run
--        openssl rand -hex 32
--     Redeploy news-bot after setting it.
--  2. Put that SAME value in the :bot_secret line below.
--  3. Decide draft vs auto-publish — see the body line further down.
--
--  ── TIME ──
--  6 PM IST = 12:30 UTC. Cron runs in UTC. India has no daylight
--  saving, so this stays correct year-round.
-- ══════════════════════════════════════════════════════

-- Enable the two extensions (no-op if already on).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove any earlier version of this job so re-running is clean.
select cron.unschedule('vyatirikht-daily-news')
where exists (select 1 from cron.job where jobname = 'vyatirikht-daily-news');

-- Schedule it. 30 12 * * *  =  12:30 UTC daily  =  18:00 IST daily.
select cron.schedule(
  'vyatirikht-daily-news',
  '30 12 * * *',
  $cron$
  select net.http_post(
    url     := 'https://zzjjnhumerpcuvmyjwti.supabase.co/functions/v1/news-bot',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      -- ⚠ Replace with the exact BOT_SECRET you set on the function.
      'x-bot-secret', 'PASTE_YOUR_BOT_SECRET_HERE'
    ),
    -- DRAFT MODE (default, recommended): an article is written each
    -- evening and waits in the dashboard for you to review + publish.
    body := '{}'::jsonb

    -- AUTO-PUBLISH MODE: to publish automatically, comment the line
    -- above and uncomment the one below. Even then, the function only
    -- publishes a piece the model rated "high" confidence; anything
    -- less still waits for review. See the note in the chat before
    -- turning this on — it changes what your Terms page promises.
    -- body := '{"auto_publish": true}'::jsonb
  );
  $cron$
);

-- ── Useful afterwards ──
-- See the schedule:      select jobname, schedule, active from cron.job;
-- See recent runs:       select * from cron.job_run_details
--                        where jobid = (select jobid from cron.job where jobname='vyatirikht-daily-news')
--                        order by start_time desc limit 10;
-- Trigger a test now:    select net.http_post(
--                          url := 'https://zzjjnhumerpcuvmyjwti.supabase.co/functions/v1/news-bot',
--                          headers := jsonb_build_object('Content-Type','application/json','x-bot-secret','PASTE_YOUR_BOT_SECRET_HERE'),
--                          body := '{}'::jsonb);
-- Pause it:              select cron.unschedule('vyatirikht-daily-news');
