alter table public.user_preferences
  add column if not exists selected_training_level text;

notify pgrst, 'reload schema';
