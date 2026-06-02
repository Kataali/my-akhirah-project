-- ============================================================
-- My Akhirah Project — Supabase Schema
-- Run this in Supabase SQL Editor or save as a migration file
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- ENUMS
-- ────────────────────────────────────────────────────────────
create type user_role as enum ('investor', 'admin');
create type campaign_status as enum ('draft', 'active', 'funded', 'completed');
create type contribution_status as enum ('pending', 'success', 'failed');
create type currency as enum ('GHS', 'USD');

-- ────────────────────────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ────────────────────────────────────────────────────────────
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  full_name       text,
  avatar_url      text,
  role            user_role not null default 'investor',
  phone           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- CAMPAIGNS
-- ────────────────────────────────────────────────────────────
create table public.campaigns (
  id                  uuid primary key default uuid_generate_v4(),
  slug                text not null unique,
  title               text not null,
  description         text not null,           -- Short tagline
  story               text not null,           -- Full rich description
  location            text not null,
  region              text not null default 'Northern Region',
  target_amount       numeric(12, 2) not null,
  raised_amount       numeric(12, 2) not null default 0,
  currency            currency not null default 'GHS',
  status              campaign_status not null default 'draft',
  cover_image_url     text,
  gallery_urls        text[] not null default '{}',
  items_needed        jsonb not null default '[]',  -- CampaignItem[]
  beneficiaries_count int,
  end_date            date,
  created_by          uuid not null references public.profiles(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index campaigns_status_idx on public.campaigns(status);
create index campaigns_slug_idx on public.campaigns(slug);

create trigger campaigns_updated_at
  before update on public.campaigns
  for each row execute procedure public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- CONTRIBUTIONS
-- ────────────────────────────────────────────────────────────
create table public.contributions (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null references public.profiles(id),
  campaign_id             uuid not null references public.campaigns(id),
  amount                  numeric(12, 2) not null,
  currency                currency not null default 'GHS',
  paystack_reference      text not null unique,
  paystack_transaction_id text,
  status                  contribution_status not null default 'pending',
  message                 text,
  anonymous               boolean not null default false,
  created_at              timestamptz not null default now()
);

create index contributions_user_idx on public.contributions(user_id);
create index contributions_campaign_idx on public.contributions(campaign_id);
create index contributions_reference_idx on public.contributions(paystack_reference);

-- Auto-update campaign raised_amount after a successful contribution
create or replace function public.update_campaign_raised_amount()
returns trigger as $$
begin
  if new.status = 'success' and (old.status is null or old.status != 'success') then
    update public.campaigns
    set raised_amount = raised_amount + new.amount
    where id = new.campaign_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_contribution_success
  after insert or update on public.contributions
  for each row execute procedure public.update_campaign_raised_amount();

-- ────────────────────────────────────────────────────────────
-- IMPACT REPORTS
-- ────────────────────────────────────────────────────────────
create table public.impact_reports (
  id                    uuid primary key default uuid_generate_v4(),
  campaign_id           uuid not null references public.campaigns(id),
  title                 text not null,
  summary               text not null,
  photos_urls           text[] not null default '{}',
  items_delivered       jsonb not null default '[]',
  beneficiaries_reached int not null default 0,
  published             boolean not null default false,
  created_by            uuid not null references public.profiles(id),
  created_at            timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- VIEWS
-- ────────────────────────────────────────────────────────────
create or replace view public.campaign_stats as
select
  c.id as campaign_id,
  count(con.id)           as total_contributions,
  count(distinct con.user_id) as unique_investors,
  round((c.raised_amount / nullif(c.target_amount, 0)) * 100, 1) as progress_percent
from public.campaigns c
left join public.contributions con
  on con.campaign_id = c.id and con.status = 'success'
group by c.id;

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.campaigns      enable row level security;
alter table public.contributions  enable row level security;
alter table public.impact_reports enable row level security;

-- Create a security definer function to bypass RLS for admin checks and prevent infinite recursion
create or replace function public.is_admin()
returns boolean as $$
declare
  admin_status boolean;
begin
  select (role = 'admin') into admin_status from public.profiles where id = auth.uid();
  return coalesce(admin_status, false);
end;
$$ language plpgsql security definer;


-- Profiles
create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Campaigns — anyone can read active/funded/completed
create policy "Public can view active campaigns"
  on public.campaigns for select
  using (status in ('active', 'funded', 'completed'));
create policy "Admins can do everything with campaigns"
  on public.campaigns for all
  using (public.is_admin());

-- Contributions — users see only their own
create policy "Users can view their own contributions"
  on public.contributions for select using (auth.uid() = user_id);
create policy "Users can insert their own contributions"
  on public.contributions for insert with check (auth.uid() = user_id);
create policy "Admins can view all contributions"
  on public.contributions for select
  using (public.is_admin());

-- Impact Reports — published ones are public
create policy "Public can read published reports"
  on public.impact_reports for select using (published = true);
create policy "Admins can manage all reports"
  on public.impact_reports for all
  using (public.is_admin());
