alter table public.user_preferences
  add column if not exists running_plan jsonb not null default '{}'::jsonb;

notify pgrst, 'reload schema';
