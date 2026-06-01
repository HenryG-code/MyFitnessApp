# LiftLog

LiftLog is a full-stack fitness tracker built with Next.js, Supabase, and
Tailwind CSS. It helps users track workouts, weight, habits, meals, groceries,
recipes, and suggested training plans in one clean dashboard.

Live demo: https://fitness.weblytics.co.za

Repository: https://github.com/HenryG-code/MyFitnessApp

## Screenshots

Portfolio screenshots are stored in `public/screenshots/`.

| Dashboard | Workouts |
| --- | --- |
| ![LiftLog dashboard](public/screenshots/dashboard.png) | ![LiftLog workout tracker](public/screenshots/workouts.png) |

| Recipes | Meal Planner |
| --- | --- |
| ![LiftLog healthy recipes](public/screenshots/recipes.png) | ![LiftLog meal planner](public/screenshots/meal-planner.png) |

| Grocery List | Training Plan |
| --- | --- |
| ![LiftLog grocery list](public/screenshots/grocery-list.png) | ![LiftLog suggested training plan](public/screenshots/training-plan.png) |

| Login | Register |
| --- | --- |
| ![LiftLog login screen](public/screenshots/login.png) | ![LiftLog register screen](public/screenshots/register.png) |

Additional screenshot placeholders to capture later:

- `public/screenshots/weight.png`
- `public/screenshots/habits.png`
- `public/screenshots/settings.png`

Recommended capture flow:

1. Deploy the app or run it locally with `npm run dev`.
2. Log in with a demo Supabase account.
3. Seed a few safe demo entries for weight, habits, and workouts.
4. Capture each page at the same desktop width, then repeat a few mobile shots
   if desired.
5. Save screenshots with consistent lowercase kebab-case filenames.

Screenshot capture checklist:

- Use clean test data that looks realistic.
- Hide sensitive email addresses and personal account details where necessary.
- Capture `/dashboard`.
- Capture `/weight`.
- Capture `/habits`.
- Capture `/workouts`.
- Capture `/recipes`.
- Capture `/meal-planner`.
- Capture `/grocery-list`.
- Capture `/training-plan`.
- Capture `/settings`.

## Features

- Supabase email/password authentication.
- Protected dashboard and app routes.
- Real dashboard data from user-scoped Supabase records.
- Weekly consistency score based on habits, workouts, and weight check-ins.
- Weekly report and deterministic progress insights powered by user activity.
- Profile-backed goal weight shown in dashboard progress.
- Weight Tracker CRUD with stats and charting.
- Flexible Daily Habits tracking with default habits, custom user habits,
  soft-hide, editing, and per-day completions.
- Workout Tracker CRUD with workout exercises.
- Healthy Recipes using static local TypeScript data.
- Meal Planner with browser `localStorage` persistence.
- Grocery List generated from planned meals with persistent checked state.
- Suggested Training Plans using static goal-based templates.
- Settings page with real profile data, privacy notes, logout, and quick links.
- Profile avatar uploads through Supabase Storage.
- External PayPal support link with Yoco marked as coming soon.
- Responsive desktop sidebar and mobile bottom navigation.
- Dark, screenshot-ready visual theme designed for comfortable longer use.
- Suggested Training Plan sessions can be logged directly into the workout log.
- PWA install support from supported desktop and mobile browsers.
- Opt-in notification preferences with a generic test notification.
- Supabase-synced user preferences for training goal, reminders, meal plan, and
  grocery checklist state.
- Mobile dashboard tools grid for Recipes, Meal Planner, Grocery List,
  Training Plan, Settings, and install guidance.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security
- Recharts
- Lucide React
- React Hook Form
- Zod
- Vercel

## Architecture Overview

LiftLog uses the Next.js App Router for public auth routes and protected app
routes. Shared UI lives in `components/`, while feature-specific query helpers,
types, static data, and browser-storage utilities live under `src/lib/`.

The app uses a browser Supabase client from `src/lib/supabase/client.ts`.
Supabase-backed features fetch only the signed-in user's rows and rely on Row
Level Security as the final protection layer.

Dashboard insights are deterministic calculations from workouts, flexible daily
habits, and weight logs. They do not use AI or paid services.

Recipes and training plan templates are static local TypeScript data in v1.
Meal Planner, Grocery List checked state, selected training goal, and
notification preferences sync through Supabase user preferences with
`localStorage` retained as a fallback. No AI APIs, paid recipe APIs, grocery
APIs, payment SDKs, or scraping workflows are used.

## Database Overview

The Supabase schema is stored in `supabase/schema.sql`.

Core tables:

- `profiles`
- `weight_logs`
- `daily_habits`
- `habit_definitions`
- `habit_completions`
- `workouts`
- `workout_exercises`
- `user_preferences`

User-owned tables are scoped through Supabase Auth. RLS policies restrict rows
so users can only access their own fitness data. Workout exercises are protected
through their parent workout ownership.

Profile avatars use Supabase Storage in a public `avatars` bucket. The profile
row stores the public avatar URL in `profiles.avatar_url`.

Daily habit definitions are created per user. Default habits are inserted the
first time a user opens Habits, and custom habit completions are stored per
habit per day. The older `daily_habits` table remains in the schema for
compatibility while the new flexible habit system is the source of truth going
forward.

Recipes and training plans are static local data in v1. Meal Planner and Grocery
List use browser storage as a fallback.

## Flexible Daily Habits

The Habits page now supports user-created habits in addition to the default
LiftLog routine. Each user gets default habit definitions on first visit, can
add custom habits, edit custom habit names/descriptions, hide habits they do not
want, and track completions per habit per day.

New tables:

- `habit_definitions`: user-owned habit list, including default/custom status,
  active state, description, and sort order.
- `habit_completions`: one completion state per habit per date.

Run the latest `supabase/schema.sql` in the Supabase SQL Editor if your live
project does not have these tables yet. The schema keeps `daily_habits` for
compatibility, but dashboard and habits now use the flexible habit tables.

Core SQL added for this milestone:

```sql
create table if not exists public.habit_definitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  icon text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habit_definitions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_date date not null,
  is_completed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, completed_date)
);

create index if not exists habit_definitions_user_id_idx
  on public.habit_definitions(user_id);

create index if not exists habit_completions_user_date_idx
  on public.habit_completions(user_id, completed_date);

create index if not exists habit_completions_habit_date_idx
  on public.habit_completions(habit_id, completed_date);

alter table public.habit_definitions enable row level security;
alter table public.habit_completions enable row level security;
```

## User Preferences Sync

LiftLog stores long-term preferences in the `user_preferences` table so key
settings can follow the user across devices.

Synced preferences include:

- Selected training goal.
- Notification preference toggles.
- Preferred reminder time.
- Meal Planner weekly state.
- Grocery List checked state.

Local device storage is still retained as a fallback. If sync is unavailable,
the app stays usable and saves preferences on the current device.

Recipes and training plan templates remain static local app data. Weight logs,
habits, workouts, profiles, avatars, goal weight, and user preferences are
Supabase-backed.

Run this SQL in Supabase if your project does not have the preferences table
yet:

```sql
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

alter table public.user_preferences enable row level security;

create policy "Users can view their own preferences"
on public.user_preferences
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
on public.user_preferences
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
on public.user_preferences
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own preferences"
on public.user_preferences
for delete
to authenticated
using (auth.uid() = user_id);

drop trigger if exists set_user_preferences_updated_at on public.user_preferences;
create trigger set_user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

notify pgrst, 'reload schema';
```

## Supabase Setup

1. Create a free Supabase project.
2. Enable Email authentication in Authentication > Providers.
3. Open the SQL Editor.
4. Copy the contents of `supabase/schema.sql`.
5. Run the SQL in Supabase.
6. Confirm RLS is enabled on the user-owned tables.
7. Add the local and production auth URLs listed in the Deployment section.

The schema creates tables, indexes, RLS policies, and a trigger that creates a
profile row when a new Supabase Auth user signs up.

Avatar storage setup:

1. Create a Supabase Storage bucket named `avatars`.
2. Set the bucket to public so avatar images can be displayed in the app.
3. Add storage policies so authenticated users can upload, update, and delete
   files in their own folder.
4. Add a public read policy for avatar images.

Avatar file paths use this format:

```text
{user_id}/avatar.{extension}
```

Example storage policies to adapt in Supabase SQL Editor:

```sql
create policy "Avatar images are publicly readable"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own avatar"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

If your existing Supabase project does not have profile goal weight support yet,
run this once in the Supabase SQL Editor:

```sql
alter table public.profiles
add column if not exists goal_weight_kg numeric(5, 2);

notify pgrst, 'reload schema';
```

## Environment Variables

Create `.env.local` locally and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Use `.env.local` for local development, never commit it, and add the same
variables to the Vercel project settings for production.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Open http://localhost:3000 while developing.

## Deployment

LiftLog is designed for Vercel Hobby hosting and Supabase Free.

Vercel steps:

1. Connect the GitHub repository to Vercel.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel
   Project Settings > Environment Variables.
3. Deploy from the main branch.
4. Add the custom domain `https://fitness.weblytics.co.za`.

Supabase Auth URL configuration:

Local URLs:

- `http://localhost:3000`
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/dashboard`

Production URLs:

- `https://fitness.weblytics.co.za`
- `https://fitness.weblytics.co.za/auth/callback`
- `https://fitness.weblytics.co.za/dashboard`

Payment note: the Settings support card uses external links only. LiftLog does
not load PayPal or Yoco SDKs, process payments internally, collect card details,
store payment information, or run payment webhooks.

## PWA Install Support

LiftLog includes a web app manifest and install metadata so supported browsers
can install it without an app store. The Settings page includes an Install
LiftLog card with an `Install app` button where the browser exposes the install
prompt, plus manual instructions for browsers that do not.

- Android: Chrome menu > Install app or Add to Home Screen.
- iPhone: Safari > Share > Add to Home Screen.
- Desktop: use the browser address bar install icon or browser menu.
- Browser support varies, so manual instructions remain visible as a fallback.
- Notification preferences are available in Settings.
- Service worker caching is intentionally skipped for now to avoid stale private
  dashboard, workout, weight, or habit data.
- PWA icons live in `public/icons/` and can be replaced later with final brand
  assets if needed.

## Notifications

LiftLog includes opt-in notification preferences in Settings. Users can request
browser notification permission, choose reminder categories, set a preferred
time, disable reminders, and send a generic test notification.

- Preferences are stored on the device in v1.
- Browser and device support varies.
- Users can disable reminders anytime from Settings.
- Notification content avoids private workout, weight, habit, or meal details.
- This milestone supports permission handling and test notifications.
- Full background push reminders are future work.

## Manual QA Checklist

Use this checklist before demos or deployments:

1. Register and log in with a Supabase email/password user.
2. Confirm `/dashboard` loads real user-scoped data, weekly consistency,
   weekly report, deterministic insights, and empty states.
3. Test `/weight` add, edit, delete, chart, and stats.
4. Test `/habits` habit toggles and 7-day summary persistence.
5. Test `/workouts` create, edit, delete, exercise rows, and detail page.
6. Test `/recipes` filters and several `/recipes/[slug]` detail pages.
7. Test `/meal-planner` selections, refresh persistence, clear slot, and clear
   week.
8. Test `/grocery-list` generation, category grouping, checked persistence,
   clear checked, and reset checked.
9. Test `/training-plan` goal selection, refresh persistence, and Log workout
   links.
10. Test `/settings` profile data, avatar upload/remove, notification
    preferences, PayPal support link, Yoco coming soon state, and logout.
11. Log out and confirm protected pages redirect to `/login`.

## Future Improvements

- Safe static asset service worker support.
- Background push reminders.
- Desktop app version with Tauri.
- Supabase persistence for Meal Planner, Grocery List, and training
  preferences.
- Custom training plan builder.
- More healthy recipes.
- Mobile app version later.

## Author

Built by Henry Gagiano as a full-stack fitness portfolio project.
