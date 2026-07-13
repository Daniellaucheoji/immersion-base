-- Immersion Kiosk Registrations
-- Run this in the Neon SQL Editor (or any Postgres client connected to your Neon DB).

create extension if not exists "pgcrypto";

create table if not exists public.immersion_kiosk_registrations (
  id uuid primary key default gen_random_uuid(),
  queue_number bigint generated always as identity unique,
  name text not null,
  email text not null,
  phone text not null,
  experience text not null check (experience in ('VR', 'FIFA')),
  status text not null default 'waiting'
    check (status in ('waiting', 'ready', 'playing', 'completed', 'no_show')),
  event_name text not null default 'Immersion Event',
  play_count integer not null default 1,
  checked_in_by_team_member_id uuid,
  disclaimer_accepted_at timestamptz not null,
  acknowledgment_sent_at timestamptz,
  ready_email_sent_at timestamptz,
  thank_you_email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  played_at timestamptz
);

create index if not exists immersion_kiosk_registrations_created_at_idx
  on public.immersion_kiosk_registrations (created_at desc);

create index if not exists immersion_kiosk_registrations_email_idx
  on public.immersion_kiosk_registrations (lower(email));

create index if not exists immersion_kiosk_registrations_phone_idx
  on public.immersion_kiosk_registrations (phone);

create index if not exists immersion_kiosk_registrations_status_idx
  on public.immersion_kiosk_registrations (status);

create index if not exists immersion_kiosk_registrations_event_name_idx
  on public.immersion_kiosk_registrations (event_name);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists immersion_kiosk_registrations_updated_at
  on public.immersion_kiosk_registrations;

create trigger immersion_kiosk_registrations_updated_at
  before update on public.immersion_kiosk_registrations
  for each row
  execute function public.set_updated_at();

-- When the same email re-registers for the same event + experience,
-- bump play_count based on prior visits.
create or replace function public.bump_play_count()
returns trigger
language plpgsql
as $$
declare
  prior_plays integer;
begin
  select coalesce(sum(play_count), 0) + 1
    into prior_plays
  from public.immersion_kiosk_registrations
  where lower(email) = lower(new.email)
    and event_name = new.event_name
    and experience = new.experience
    and id is distinct from new.id;

  new.play_count := greatest(prior_plays, 1);
  return new;
end;
$$;

drop trigger if exists immersion_kiosk_registrations_play_count
  on public.immersion_kiosk_registrations;

create trigger immersion_kiosk_registrations_play_count
  before insert on public.immersion_kiosk_registrations
  for each row
  execute function public.bump_play_count();

-- Admin OTP codes (@nodeclub.co + invited team emails)
create table if not exists public.immersion_admin_otps (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists immersion_admin_otps_email_idx
  on public.immersion_admin_otps (email);

create index if not exists immersion_admin_otps_expires_at_idx
  on public.immersion_admin_otps (expires_at);

-- Booth team members
create table if not exists public.immersion_team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null,
  active boolean not null default true,
  invited_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists immersion_team_members_email_idx
  on public.immersion_team_members (lower(email));

create index if not exists immersion_team_members_active_idx
  on public.immersion_team_members (active);

-- Track which booth team member checked a guest in
alter table public.immersion_kiosk_registrations
  add column if not exists checked_in_by_team_member_id uuid
    references public.immersion_team_members(id);

create index if not exists immersion_kiosk_registrations_checked_in_by_idx
  on public.immersion_kiosk_registrations (checked_in_by_team_member_id);

-- If you already created the earlier schema, run this migration:
-- alter table public.immersion_kiosk_registrations
--   add column if not exists phone text,
--   add column if not exists disclaimer_accepted_at timestamptz;
-- update public.immersion_kiosk_registrations
--   set phone = coalesce(phone, ''),
--       disclaimer_accepted_at = coalesce(disclaimer_accepted_at, created_at)
--   where phone is null or disclaimer_accepted_at is null;
-- alter table public.immersion_kiosk_registrations
--   alter column phone set not null,
--   alter column disclaimer_accepted_at set not null;
-- alter table public.immersion_kiosk_registrations
--   drop column if exists social_handle;
-- alter table public.immersion_kiosk_registrations
--   add column if not exists thank_you_email_sent_at timestamptz;
