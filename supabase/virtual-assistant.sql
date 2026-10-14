-- Virtual Assistant sign-ups, events and menu uploads. Run once in the Supabase SQL editor (same project as leads.sql).
-- Safe to re-run: every statement is idempotent.
--
-- Access model (same as leads.sql): only the Cloudflare Worker touches this data, using the service_role key.
-- RLS is on with no policies and all grants are revoked from anon/authenticated.

create table if not exists public.va_signups (
  id              uuid        primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  restaurant      text        not null,
  owner_name      text        not null,
  email           text        not null,
  mobile          text        not null,
  address         text        not null,
  current_phone   text        not null,
  hours           jsonb       not null default '{}',   -- { mon: "11-10", ..., sun: "Closed" }
  menu_path       text,                                  -- object path inside the private 'va-menus' bucket
  menu_link       text,
  reservations    boolean     not null,
  party_max       integer,
  booking_system  text,
  pickup          boolean     not null,
  ready_time      text,
  transfer_phone  text        not null,
  plan            text        not null check (plan in ('monthly', 'payg', 'cap')),
  answer_mode     text        not null check (answer_mode in ('all', 'missed')),
  assistant_name  text,
  notes           text,
  consent_at      timestamptz not null,
  status          text        not null default 'new'
                              check (status in ('new', 'paid', 'onboarding', 'live', 'cancelled'))
);
create index if not exists va_signups_created_at_idx on public.va_signups (created_at desc);
alter table public.va_signups enable row level security;
revoke all on public.va_signups from anon, authenticated;

-- Three events only: call_click, form_start, signup_complete. No IP address, no cookie, no person.
create table if not exists public.va_events (
  id          bigint      generated always as identity primary key,
  created_at  timestamptz not null default now(),
  event       text        not null check (event in ('call_click', 'form_start', 'signup_complete')),
  page        text        not null
);
create index if not exists va_events_created_at_idx on public.va_events (created_at desc);
alter table public.va_events enable row level security;
revoke all on public.va_events from anon, authenticated;

-- Counts per event per day, for a quick look:  select * from public.va_event_counts;
create or replace view public.va_event_counts as
  select date_trunc('day', created_at)::date as day, event, count(*) as total
  from public.va_events group by 1, 2 order by 1 desc, 2;
revoke all on public.va_event_counts from anon, authenticated;

-- Private bucket for menus (PDF, JPG, PNG, up to 10 MB). Uploads only through signed URLs from the Worker.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('va-menus', 'va-menus', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
