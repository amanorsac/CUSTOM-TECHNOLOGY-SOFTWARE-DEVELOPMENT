-- CTSD back office: clients, projects (with proposals), activity and Stripe usage reports.
-- Run once in the Supabase SQL editor, after leads.sql and virtual-assistant.sql. Safe to re-run.
-- Access model as before: only the Worker (service key) reads or writes; RLS on, no policies, no grants.

create table if not exists public.clients (
  id                     uuid        primary key default gen_random_uuid(),
  created_at             timestamptz not null default now(),
  kind                   text        not null check (kind in ('va', 'project')),
  name                   text        not null,
  contact_name           text,
  email                  text,
  phone                  text,
  address                text,
  status                 text        not null default 'new',
  stripe_customer_id     text,
  stripe_subscription_id text,
  plan                   text        check (plan in ('monthly', 'payg', 'cap')),
  adelaide_id            text,       -- the client id in the Adelaide backend's data/clients.json
  va_number              text,       -- the assistant's phone number
  go_live_on             date,
  source_lead_id         uuid,
  source_signup_id       uuid,
  notes                  text,
  constraint clients_status_ok check (
    (kind = 'va' and status in ('new', 'paid', 'onboarding', 'live', 'paused', 'cancelled')) or
    (kind = 'project' and status in ('prospect', 'active', 'done', 'lost')))
);
create index if not exists clients_created_at_idx on public.clients (created_at desc);
create unique index if not exists clients_stripe_customer_idx on public.clients (stripe_customer_id) where stripe_customer_id is not null;

create table if not exists public.projects (
  id           uuid        primary key default gen_random_uuid(),
  client_id    uuid        not null references public.clients (id) on delete cascade,
  created_at   timestamptz not null default now(),
  title        text        not null,
  kind         text        not null default 'website' check (kind in ('website', 'app', 'portal', 'crm', 'integration', 'other')),
  status       text        not null default 'quoted' check (status in ('quoted', 'active', 'delivered', 'closed')),
  scope        text,
  line_items   jsonb       not null default '[]',   -- [{ "description": "...", "amount": 3500 }] in dollars; negative = discount
  deposit_pct  integer     not null default 40 check (deposit_pct between 0 and 100),
  valid_until  date,
  quote_total  numeric(12, 2) not null default 0,
  notes        text
);
create index if not exists projects_client_idx on public.projects (client_id);

create table if not exists public.activity (
  id         bigint      generated always as identity primary key,
  client_id  uuid        not null references public.clients (id) on delete cascade,
  at         timestamptz not null default now(),
  kind       text        not null check (kind in ('note', 'status', 'invoice', 'payment', 'usage', 'email')),
  text       text        not null
);
create index if not exists activity_client_idx on public.activity (client_id, at desc);

-- Minutes already sent to Stripe per client per month, so nothing is reported twice.
create table if not exists public.usage_reports (
  client_id         uuid        not null references public.clients (id) on delete cascade,
  month             text        not null check (month ~ '^\d{4}-\d{2}$'),
  minutes_reported  integer     not null default 0,
  updated_at        timestamptz not null default now(),
  primary key (client_id, month)
);

-- Inbox status on the existing tables (leads already has status new/contacted/won/lost).
alter table public.va_signups drop constraint if exists va_signups_status_check;
alter table public.va_signups add constraint va_signups_status_check
  check (status in ('new', 'contacted', 'paid', 'onboarding', 'live', 'cancelled', 'lost', 'converted'));

alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.activity enable row level security;
alter table public.usage_reports enable row level security;
revoke all on public.clients, public.projects, public.activity, public.usage_reports from anon, authenticated;
