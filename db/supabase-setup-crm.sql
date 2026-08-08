-- ══════════════════════════════════════════════════════
--  VYATIRIKHT — CRM + cold-call list
--
--  ONE table holds every contact — cold leads you haven't called
--  yet, people mid-conversation, signed clients, and dead ends. The
--  `stage` field is what separates them:
--
--    cold        → the cold-call list. Not contacted yet.
--    contacted   → you've reached out; conversation open.
--    negotiating → discussing a specific job / quote.
--    client      → signed / paying.
--    lost        → not happening (kept, so you don't re-call them).
--
--  The dashboard shows the whole list with a stage filter, so the
--  "cold-call list" is just the filter set to `cold`. A cold lead
--  graduates to client by changing one field — no re-typing.
--
--  Internal only: the public has no access. Signed-in team members
--  read and write everything.
--
--  Run once in Supabase → SQL Editor. Safe to run more than once.
-- ══════════════════════════════════════════════════════

create table if not exists public.crm_contacts (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  company           text,
  phone             text,                    -- kept as text: preserves +91, spaces, leading 0
  email             text,
  stage             text not null default 'cold'
                      check (stage in ('cold','contacted','negotiating','client','lost')),
  service           text,                    -- what they might buy (photography, film, branding…)
  value_inr         integer,                 -- rough deal size in rupees, for prioritising
  source            text,                    -- where they came from (referral, Instagram, cold…)
  notes             text,                    -- freeform running notes on this contact
  next_action       text,                    -- the single next thing to do
  next_action_at    date,                    -- when to do it (drives the "due" view)
  last_contacted_at timestamptz,             -- stamped when you log a call/message
  owner             text,                    -- which team member owns this contact
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Find the cold-call list, and today's follow-ups, fast.
create index if not exists crm_contacts_stage_idx on public.crm_contacts (stage);
create index if not exists crm_contacts_next_action_idx
  on public.crm_contacts (next_action_at nulls last);

-- Keep updated_at honest.
create or replace function public.touch_crm_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists crm_contacts_touch on public.crm_contacts;
create trigger crm_contacts_touch
  before update on public.crm_contacts
  for each row execute function public.touch_crm_updated_at();

-- ── RLS ───────────────────────────────────────────────
-- Client contact details and deal values are exactly the kind of
-- thing that must never be publicly readable. No anon access at all;
-- signed-in team manages everything.
alter table public.crm_contacts enable row level security;

drop policy if exists "team manages crm" on public.crm_contacts;
create policy "team manages crm"
  on public.crm_contacts for all
  to authenticated
  using (true) with check (true);

-- Confirm:
--   select stage, count(*) from public.crm_contacts group by stage;
