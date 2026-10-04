-- CTSD leads backend (spec §8.3). Run in the Supabase SQL editor.
-- Safe to re-run: every statement is idempotent.
--
-- Access model: only the Cloudflare Worker touches this data, using the
-- service_role key (which bypasses RLS). RLS is enabled with NO policies and
-- all grants are revoked from anon/authenticated, so the public anon key
-- cannot read or write anything here.

create table if not exists public.leads (
  id           uuid        primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  kind         text        not null check (kind in ('project', 'mockup')),
  org_type     text,
  org_name     text,
  needs        text[]      not null default '{}',
  website      text,
  tools        text,
  timeline     text,
  budget       text,
  design_slug  text,
  style        text,
  logo_path    text,       -- object path inside the private 'lead-uploads' bucket
  name         text        not null,
  email        text        not null,
  phone        text,
  contact_pref text,
  message      text,
  status       text        not null default 'new'
                           check (status in ('new', 'contacted', 'won', 'lost'))
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;
-- Intentionally no policies: anon and authenticated get nothing.
revoke all on public.leads from anon, authenticated;

-- Private bucket for optional mockup logos (png / jpeg / svg, max 5MB).
-- Uploads happen only through signed upload URLs issued by the Worker; there
-- are no storage.objects policies, so nobody can list or read files without
-- the service key. SVG can carry script, which is acceptable only because the
-- bucket is private and this site never serves these files: keep it private,
-- and download (do not open in-browser from a public URL) when reviewing.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lead-uploads', 'lead-uploads', false, 5242880,
        array['image/png', 'image/jpeg', 'image/svg+xml'])
on conflict (id) do update
  set public             = false,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
