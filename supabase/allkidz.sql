-- Allkidz portal: the tables behind public/assets/preview/allkidz/store.js, for when the draft goes live.
-- Not run yet. Run once in the client's own Supabase project (not the CTSD leads project).
-- Safe to re-run: every statement is idempotent.
--
-- Access model: people sign in with Supabase Auth. profiles.role decides what they see:
--   admin    everything
--   teacher  children, attendance, reports, incidents, messages, menus, lessons, events (no billing or settings)
--   parent   only rows for their own family
-- RLS is on for every table. The helper functions below keep the policies short.

create table if not exists public.families (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  address     text,
  emergency   text,
  notes       text,
  pickups     jsonb not null default '[]',   -- [{ name, relation, phone }]
  charges     jsonb not null default '[]'    -- late-pickup and other charges waiting for the next bill
);

create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  created_at  timestamptz not null default now(),
  role        text not null check (role in ('admin', 'teacher', 'parent')),
  status      text not null default 'active' check (status in ('active', 'pending', 'disabled')),
  name        text not null,
  phone       text,
  title       text,
  family_id   uuid references public.families on delete set null,
  must_change boolean not null default false,
  note        text
);

create table if not exists public.children (
  id                 uuid primary key default gen_random_uuid(),
  family_id          uuid not null references public.families on delete cascade,
  first              text not null,
  last               text not null,
  dob                date not null,
  schedule           text not null default 'full' check (schedule in ('full', 'part', 'dropin')),
  days               text[] not null default '{mon,tue,wed,thu,fri}',
  allergies          text,
  medical            text,
  doctor             text,
  potty              text,
  photo_ok           boolean not null default true,
  immunizations_due  date,
  start_date         date,
  status             text not null default 'active' check (status in ('active', 'enrolling', 'withdrawn')),
  reg_billed         boolean not null default false,
  notes              text
);

create table if not exists public.attendance (
  id        uuid primary key default gen_random_uuid(),
  child_id  uuid not null references public.children on delete cascade,
  date      date not null,
  in_at     timestamptz not null,
  out_at    timestamptz,
  in_by     text,
  out_by    text,
  temp      numeric(4,1),
  screened  boolean not null default false,
  note      text
);
create index if not exists attendance_child_date on public.attendance (child_id, date);

create table if not exists public.absences (
  id        uuid primary key default gen_random_uuid(),
  child_id  uuid not null references public.children on delete cascade,
  date      date not null,
  reason    text,
  note      text,
  by_user   uuid references public.profiles
);

create table if not exists public.reports (
  id        uuid primary key default gen_random_uuid(),
  child_id  uuid not null references public.children on delete cascade,
  date      date not null,
  time      time not null,
  type      text not null check (type in ('meal', 'nap', 'diaper', 'potty', 'activity', 'mood', 'note', 'photo')),
  detail    text not null,
  photo     text,                       -- object path in the private 'allkidz-photos' bucket
  by_user   uuid references public.profiles
);
create index if not exists reports_child_date on public.reports (child_id, date);

create table if not exists public.clock (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references public.profiles on delete cascade,
  date     date not null,
  in_at    timestamptz not null,
  out_at   timestamptz
);

create table if not exists public.certs (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references public.profiles on delete cascade,
  name     text not null,
  issued   date,
  expires  date
);

create table if not exists public.invoices (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  number     text not null unique,
  family_id  uuid not null references public.families on delete cascade,
  week_of    date not null,
  due        date not null,
  items      jsonb not null default '[]'   -- [{ label, amount, fee?, lateFee? }]
);

create table if not exists public.payments (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references public.invoices on delete cascade,
  amount      numeric(10,2) not null check (amount > 0),
  method      text not null,
  ref         text,
  at          timestamptz not null default now(),
  pending     boolean not null default false,   -- a parent said they paid; the director confirms
  by_user     uuid references public.profiles
);

create table if not exists public.applications (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  kind         text not null check (kind in ('tour', 'application', 'inquiry')),
  status       text not null default 'new' check (status in ('new', 'tour', 'waitlist', 'offered', 'enrolled', 'declined')),
  parent_name  text not null,
  email        text,
  phone        text,
  child_name   text,
  child_dob    date,
  schedule     text,
  start_date   date,
  tour_at      timestamptz,
  message      text,
  source       text,
  details      jsonb not null default '{}'
);

create table if not exists public.threads (
  id              uuid primary key default gen_random_uuid(),
  family_id       uuid not null references public.families on delete cascade,
  subject         text not null,
  unread_admin    boolean not null default false,
  unread_parent   boolean not null default false
);
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references public.threads on delete cascade,
  from_user  uuid references public.profiles,
  text       text not null,
  at         timestamptz not null default now()
);

create table if not exists public.announcements (
  id      uuid primary key default gen_random_uuid(),
  at      timestamptz not null default now(),
  title   text not null,
  body    text not null,
  pinned  boolean not null default false,
  by_user uuid references public.profiles
);

create table if not exists public.events (
  id     uuid primary key default gen_random_uuid(),
  date   date not null,
  "end"  date,
  title  text not null,
  type   text not null check (type in ('closed', 'break', 'pd', 'event')),
  note   text
);

create table if not exists public.menus (
  week_of  date primary key,
  days     jsonb not null default '{}'   -- { mon: { breakfast, lunch, snack }, ... }
);
create table if not exists public.lessons (
  week_of  date primary key,
  theme    text,
  verse    text,
  days     jsonb not null default '{}'
);

create table if not exists public.incidents (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references public.children on delete cascade,
  at           timestamptz not null,
  type         text not null,
  "where"      text,
  description  text not null,
  action       text not null,
  notified     boolean not null default false,
  by_user      uuid references public.profiles,
  signed       boolean not null default false,
  signed_by    text,
  signed_at    timestamptz
);

create table if not exists public.settings (
  id    boolean primary key default true check (id),   -- one row
  data  jsonb not null default '{}'
);

create table if not exists public.activity (
  id    uuid primary key default gen_random_uuid(),
  at    timestamptz not null default now(),
  text  text not null,
  k     text,
  icon  text
);

-- ---------- who is asking ----------
create or replace function public.ak_role() returns text language sql stable security definer set search_path = public as
  $$ select role from public.profiles where id = auth.uid() and status = 'active' $$;
create or replace function public.ak_family() returns uuid language sql stable security definer set search_path = public as
  $$ select family_id from public.profiles where id = auth.uid() and status = 'active' $$;
create or replace function public.ak_staff() returns boolean language sql stable as
  $$ select public.ak_role() in ('admin', 'teacher') $$;
create or replace function public.ak_admin() returns boolean language sql stable as
  $$ select public.ak_role() = 'admin' $$;

-- ---------- row level security ----------
do $$
declare t text;
begin
  foreach t in array array['families','profiles','children','attendance','absences','reports','clock','certs','invoices','payments',
                           'applications','threads','messages','announcements','events','menus','lessons','incidents','settings','activity']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists admin_all on public.%I', t);
    execute format('create policy admin_all on public.%I for all using (public.ak_admin()) with check (public.ak_admin())', t);
  end loop;
end $$;

-- teachers: the day-to-day tables
do $$
declare t text;
begin
  foreach t in array array['children','attendance','absences','reports','incidents','threads','messages','menus','lessons']
  loop
    execute format('drop policy if exists staff_all on public.%I', t);
    execute format('create policy staff_all on public.%I for all using (public.ak_staff()) with check (public.ak_staff())', t);
  end loop;
end $$;
drop policy if exists staff_read on public.families;      create policy staff_read on public.families      for select using (public.ak_staff());
drop policy if exists staff_read on public.events;        create policy staff_read on public.events        for select using (public.ak_staff());
drop policy if exists staff_read on public.announcements; create policy staff_read on public.announcements for select using (public.ak_staff());
drop policy if exists own_clock on public.clock;          create policy own_clock on public.clock           for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists own_certs on public.certs;          create policy own_certs on public.certs           for select using (user_id = auth.uid());

-- everyone signed in: their own profile
drop policy if exists own_profile on public.profiles; create policy own_profile on public.profiles for select using (id = auth.uid() or public.ak_staff());

-- parents: only their family
drop policy if exists parent_family on public.families;   create policy parent_family on public.families   for select using (id = public.ak_family());
drop policy if exists parent_pickups on public.families;  create policy parent_pickups on public.families  for update using (id = public.ak_family()) with check (id = public.ak_family());
drop policy if exists parent_children on public.children; create policy parent_children on public.children for select using (family_id = public.ak_family());
drop policy if exists parent_att on public.attendance;    create policy parent_att on public.attendance     for select using (child_id in (select id from public.children where family_id = public.ak_family()));
drop policy if exists parent_reports on public.reports;   create policy parent_reports on public.reports    for select using (child_id in (select id from public.children where family_id = public.ak_family()));
drop policy if exists parent_abs on public.absences;      create policy parent_abs on public.absences       for all using (child_id in (select id from public.children where family_id = public.ak_family())) with check (child_id in (select id from public.children where family_id = public.ak_family()));
drop policy if exists parent_inc on public.incidents;     create policy parent_inc on public.incidents      for select using (child_id in (select id from public.children where family_id = public.ak_family()));
drop policy if exists parent_inv on public.invoices;      create policy parent_inv on public.invoices       for select using (family_id = public.ak_family());
drop policy if exists parent_pay on public.payments;      create policy parent_pay on public.payments       for select using (invoice_id in (select id from public.invoices where family_id = public.ak_family()));
drop policy if exists parent_pay_new on public.payments;  create policy parent_pay_new on public.payments   for insert with check (pending and invoice_id in (select id from public.invoices where family_id = public.ak_family()));
drop policy if exists parent_threads on public.threads;   create policy parent_threads on public.threads    for all using (family_id = public.ak_family()) with check (family_id = public.ak_family());
drop policy if exists parent_msgs on public.messages;     create policy parent_msgs on public.messages      for all using (thread_id in (select id from public.threads where family_id = public.ak_family())) with check (from_user = auth.uid());

-- read-only for every active account: the calendar, news, menu and lessons
drop policy if exists all_events on public.events;        create policy all_events on public.events        for select using (public.ak_role() is not null);
drop policy if exists all_news on public.announcements;   create policy all_news on public.announcements   for select using (public.ak_role() is not null);
drop policy if exists all_menus on public.menus;          create policy all_menus on public.menus           for select using (public.ak_role() is not null);
drop policy if exists all_lessons on public.lessons;      create policy all_lessons on public.lessons       for select using (public.ak_role() is not null);

-- The website's tour and application forms post through the Worker with the service_role key,
-- so anonymous visitors never get direct table access. The public calendar and menu are served the same way.
revoke all on all tables in schema public from anon;
