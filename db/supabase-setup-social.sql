-- ══════════════════════════════════════════════════════
--  VYATIRIKHT — Instagram posts generated from blog articles
--
--  Each row is one Instagram post drafted from one article: a
--  caption, a set of hashtags, and carousel slide text. Generated
--  by the generate-instagram Edge Function, reviewed in the
--  dashboard, then copied into Instagram by a human. Nothing is
--  posted automatically — Instagram has no simple posting API for
--  this, and you'd want to add the image yourself anyway.
--
--  Run after supabase-setup-bot.sql (needs the articles table).
--  Safe to run more than once.
-- ══════════════════════════════════════════════════════

create table if not exists public.social_posts (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid references public.articles(id) on delete cascade,
  platform    text not null default 'instagram',
  caption     text,                    -- the post caption, ready to paste
  hashtags    text,                    -- space-separated tags
  carousel    jsonb,                   -- array of slide strings, for a carousel
  hook        text,                    -- the opening line / cover-slide text
  status      text not null default 'draft' check (status in ('draft','posted')),
  created_at  timestamptz not null default now()
);

create index if not exists social_posts_article_idx on public.social_posts (article_id);
create index if not exists social_posts_created_idx on public.social_posts (created_at desc);

-- ── RLS ───────────────────────────────────────────────
-- Internal marketing drafts. No public access; team manages all.
alter table public.social_posts enable row level security;

drop policy if exists "team manages social posts" on public.social_posts;
create policy "team manages social posts"
  on public.social_posts for all
  to authenticated
  using (true) with check (true);

-- The Edge Function writes with the service-role key, which bypasses
-- RLS, so no separate insert policy is needed for it.

-- Confirm:
--   select count(*) from public.social_posts;
