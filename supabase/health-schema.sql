-- LogFit Connected Health foundation
-- Run this in the Supabase SQL Editor (idempotent, additive only).
-- Adds native health-platform connection tracking and normalized daily
-- health metrics imported from Apple Health / Android Health Connect.

-- ————— health_connections —————
create table if not exists public.health_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('apple_health', 'health_connect')),
  status text not null default 'connected'
    check (status in ('connected', 'disconnected', 'error')),
  device_label text,
  permissions jsonb not null default '{}'::jsonb,
  connected_at timestamptz not null default now(),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, platform)
);

create index if not exists health_connections_user_id_idx
  on public.health_connections(user_id);

alter table public.health_connections enable row level security;

drop policy if exists "Users can view their own health connections"
  on public.health_connections;
create policy "Users can view their own health connections"
on public.health_connections for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own health connections"
  on public.health_connections;
create policy "Users can insert their own health connections"
on public.health_connections for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own health connections"
  on public.health_connections;
create policy "Users can update their own health connections"
on public.health_connections for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own health connections"
  on public.health_connections;
create policy "Users can delete their own health connections"
on public.health_connections for delete
to authenticated
using (auth.uid() = user_id);

drop trigger if exists set_health_connections_updated_at
  on public.health_connections;
create trigger set_health_connections_updated_at
  before update on public.health_connections
  for each row execute function public.set_updated_at();

-- ————— health_daily_metrics —————
-- One row per user per day per platform. Idempotent upserts prevent
-- duplicate imports; source_name preserves provenance.
create table if not exists public.health_daily_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metric_date date not null,
  platform text not null check (platform in ('apple_health', 'health_connect')),
  source_name text,
  steps integer,
  sleep_minutes integer,
  resting_heart_rate_bpm numeric(5, 1),
  active_energy_kcal numeric(8, 1),
  distance_meters numeric(10, 1),
  weight_kg numeric(5, 2),
  exercise_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, metric_date, platform)
);

create index if not exists health_daily_metrics_user_date_idx
  on public.health_daily_metrics(user_id, metric_date desc);

alter table public.health_daily_metrics enable row level security;

drop policy if exists "Users can view their own health metrics"
  on public.health_daily_metrics;
create policy "Users can view their own health metrics"
on public.health_daily_metrics for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own health metrics"
  on public.health_daily_metrics;
create policy "Users can insert their own health metrics"
on public.health_daily_metrics for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own health metrics"
  on public.health_daily_metrics;
create policy "Users can update their own health metrics"
on public.health_daily_metrics for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own health metrics"
  on public.health_daily_metrics;
create policy "Users can delete their own health metrics"
on public.health_daily_metrics for delete
to authenticated
using (auth.uid() = user_id);

drop trigger if exists set_health_daily_metrics_updated_at
  on public.health_daily_metrics;
create trigger set_health_daily_metrics_updated_at
  before update on public.health_daily_metrics
  for each row execute function public.set_updated_at();

-- ————— health goals (user preference, additive column) —————
alter table public.user_preferences
add column if not exists health_goals jsonb not null default '{}'::jsonb;

notify pgrst, 'reload schema';
