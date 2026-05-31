-- LiftLog Supabase foundation schema.
-- Run this in the Supabase SQL Editor for a new project.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  goal_weight_kg numeric(5, 2) check (goal_weight_kg is null or goal_weight_kg > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists goal_weight_kg numeric(5, 2)
  check (goal_weight_kg is null or goal_weight_kg > 0);

create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at date not null default current_date,
  weight_kg numeric(5, 2) not null check (weight_kg > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  workout_date date not null default current_date,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_name text not null,
  sets integer check (sets is null or sets >= 0),
  reps integer check (reps is null or reps >= 0),
  weight numeric check (weight is null or weight >= 0),
  distance_km numeric check (distance_km is null or distance_km >= 0),
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_date date not null default current_date,
  sleep_8_hours boolean not null default false,
  trained boolean not null default false,
  walked_10k_steps boolean not null default false,
  ate_healthy boolean not null default false,
  no_late_food boolean not null default false,
  limited_alcohol boolean not null default false,
  clean_environment boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, habit_date)
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  selected_training_goal text,
  notification_preferences jsonb not null default '{}'::jsonb,
  preferred_reminder_time text,
  meal_plan jsonb not null default '{}'::jsonb,
  grocery_checked_items jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx
  on public.profiles (email);

create index if not exists weight_logs_user_logged_at_idx
  on public.weight_logs (user_id, logged_at desc);

create index if not exists workouts_user_workout_date_idx
  on public.workouts (user_id, workout_date desc);

create index if not exists workout_exercises_workout_idx
  on public.workout_exercises (workout_id);

create index if not exists daily_habits_user_date_idx
  on public.daily_habits (user_id, habit_date desc);

alter table public.profiles enable row level security;
alter table public.weight_logs enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.daily_habits enable row level security;
alter table public.user_preferences enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can delete their own profile" on public.profiles;
drop policy if exists "Users can view their own weight logs" on public.weight_logs;
drop policy if exists "Users can insert their own weight logs" on public.weight_logs;
drop policy if exists "Users can update their own weight logs" on public.weight_logs;
drop policy if exists "Users can delete their own weight logs" on public.weight_logs;
drop policy if exists "Users can view their own workouts" on public.workouts;
drop policy if exists "Users can insert their own workouts" on public.workouts;
drop policy if exists "Users can update their own workouts" on public.workouts;
drop policy if exists "Users can delete their own workouts" on public.workouts;
drop policy if exists "Users can view their own workout exercises" on public.workout_exercises;
drop policy if exists "Users can insert exercises for their own workouts" on public.workout_exercises;
drop policy if exists "Users can update exercises for their own workouts" on public.workout_exercises;
drop policy if exists "Users can delete their own workout exercises" on public.workout_exercises;
drop policy if exists "Users can view their own daily habits" on public.daily_habits;
drop policy if exists "Users can insert their own daily habits" on public.daily_habits;
drop policy if exists "Users can update their own daily habits" on public.daily_habits;
drop policy if exists "Users can delete their own daily habits" on public.daily_habits;
drop policy if exists "Users can view their own preferences" on public.user_preferences;
drop policy if exists "Users can insert their own preferences" on public.user_preferences;
drop policy if exists "Users can update their own preferences" on public.user_preferences;
drop policy if exists "Users can delete their own preferences" on public.user_preferences;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  using (auth.uid() = id);

create policy "Users can view their own weight logs"
  on public.weight_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own weight logs"
  on public.weight_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own weight logs"
  on public.weight_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own weight logs"
  on public.weight_logs for delete
  using (auth.uid() = user_id);

create policy "Users can view their own workouts"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own workouts"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own workouts"
  on public.workouts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own workouts"
  on public.workouts for delete
  using (auth.uid() = user_id);

create policy "Users can view their own workout exercises"
  on public.workout_exercises for select
  using (
    exists (
      select 1
      from public.workouts
      where workouts.id = workout_exercises.workout_id
        and workouts.user_id = auth.uid()
    )
  );

create policy "Users can insert exercises for their own workouts"
  on public.workout_exercises for insert
  with check (
    exists (
      select 1
      from public.workouts
      where workouts.id = workout_exercises.workout_id
        and workouts.user_id = auth.uid()
    )
  );

create policy "Users can update exercises for their own workouts"
  on public.workout_exercises for update
  using (
    exists (
      select 1
      from public.workouts
      where workouts.id = workout_exercises.workout_id
        and workouts.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.workouts
      where workouts.id = workout_exercises.workout_id
        and workouts.user_id = auth.uid()
    )
  );

create policy "Users can delete their own workout exercises"
  on public.workout_exercises for delete
  using (
    exists (
      select 1
      from public.workouts
      where workouts.id = workout_exercises.workout_id
        and workouts.user_id = auth.uid()
    )
  );

create policy "Users can view their own daily habits"
  on public.daily_habits for select
  using (auth.uid() = user_id);

create policy "Users can insert their own daily habits"
  on public.daily_habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own daily habits"
  on public.daily_habits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own daily habits"
  on public.daily_habits for delete
  using (auth.uid() = user_id);

create policy "Users can view their own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own preferences"
  on public.user_preferences for delete
  using (auth.uid() = user_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_weight_logs_updated_at on public.weight_logs;
create trigger set_weight_logs_updated_at
  before update on public.weight_logs
  for each row execute function public.set_updated_at();

drop trigger if exists set_daily_habits_updated_at on public.daily_habits;
create trigger set_daily_habits_updated_at
  before update on public.daily_habits
  for each row execute function public.set_updated_at();

drop trigger if exists set_user_preferences_updated_at on public.user_preferences;
create trigger set_user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        avatar_url = excluded.avatar_url,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

notify pgrst, 'reload schema';
