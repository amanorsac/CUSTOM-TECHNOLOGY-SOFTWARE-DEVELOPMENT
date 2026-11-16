-- Allow the 'booking' and 'contact' lead kinds (Kingsley Anyenor draft forms).
-- NOT YET RUN: run once in the Supabase SQL editor before production forms post these kinds.
-- supabase/leads.sql declared the check inline and unnamed, so Postgres named it leads_kind_check.

alter table public.leads drop constraint if exists leads_kind_check;
alter table public.leads add constraint leads_kind_check check (kind in ('project','mockup','booking','contact'));
