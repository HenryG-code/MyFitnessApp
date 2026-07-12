# LogFit — Personal Performance OS

LogFit is a full-stack personal performance OS built with Next.js, Supabase, and
Tailwind CSS. It turns everyday training, body progress, recovery, habits, and
nutrition into one focused system that helps users stay consistent over the long
term. A native mobile companion (Expo) syncs Apple Health and Android Health
Connect data back into the same account.

Live demo: https://fitness.weblytics.co.za

Repository: https://github.com/HenryG-code/MyFitnessApp

## Overview

LogFit is organised into two areas:

- **Perform** — the daily performance loop: a Command Centre dashboard, guided
  Workout Mode, a body-intelligence muscle map, progress trends, and a weekly
  report.
- **Lifestyle** — supporting tools: weight tracking, flexible habits, recipes,
  meal planning, grocery lists, and suggested training plans.

All performance insights are deterministic calculations from the user's own
activity. No AI, paid recipe/grocery APIs, payment SDKs, or scraping workflows
are used, and guidance is framed as fitness support, not medical advice.

## Screenshots

Portfolio screenshots are stored in `public/screenshots/`.

| Command Centre | Workout Mode |
| --- | --- |
| ![LogFit dashboard](public/screenshots/dashboard.png) | ![LogFit workout tracker](public/screenshots/workouts.png) |

| Recipes | Meal Planner |
| --- | --- |
| ![LogFit healthy recipes](public/screenshots/recipes.png) | ![LogFit meal planner](public/screenshots/meal-planner.png) |

| Grocery List | Training Plan |
| --- | --- |
| ![LogFit grocery list](public/screenshots/grocery-list.png) | ![LogFit suggested training plan](public/screenshots/training-plan.png) |

| Login | Register |
| --- | --- |
| ![LogFit login screen](public/screenshots/login.png) | ![LogFit register screen](public/screenshots/register.png) |

Additional screenshot placeholders to capture later:

- `public/screenshots/body.png`
- `public/screenshots/progress.png`
- `public/screenshots/report.png`
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

## Perform Screens

- **Today (`/dashboard`)** — the Command Centre. A readiness ring, today's
  mission, training streak, weekly load, weekly consistency, and nutrition
  macros. When Connected Health data exists, the strip swaps in Steps and Sleep.
- **Train (`/workouts`)** — workout history and manual logging, plus a live
  guided **Workout Mode** at `/workouts/live` that records a per-set breakdown.
- **Body (`/body`)** — Body Intelligence, an SVG muscle map that highlights
  worked muscle groups from recent training.
- **Progress (`/progress`)** — long-term journey trends across weight, training,
  habits, and consistency.
- **Report (`/report`)** — a deterministic weekly report summarising the week's
  activity and momentum.

## Features

- Supabase email/password authentication with protected app routes.
- Command Centre dashboard with readiness scoring, daily mission, training
  streak, weekly load classification, consistency, and nutrition macros.
- Guided live Workout Mode with per-set logging and a built-in rest timer.
- Body Intelligence SVG muscle map driven by recent workout history.
- Progress and weekly report screens powered entirely by user activity.
- Weight Tracker CRUD with stats and charting, plus profile goal weight.
- Flexible Daily Habits with default habits, custom user habits, soft-hide,
  editing, and per-day completions.
- Healthy Recipes using static local TypeScript data with filtering and detail
  pages.
- Meal Planner with Supabase-synced weekly state and `localStorage` fallback.
- Grocery List generated from planned meals with persistent checked state.
- Suggested Training Plans using goal-based templates that can be logged
  straight into the workout log.
- Connected Health: import Apple Health / Android Health Connect metrics through
  the native companion app; readiness prefers synced sleep and resting heart
  rate with a manual-habit fallback.
- Settings with real profile data, avatar uploads, privacy notes, logout, and
  quick links.
- Responsive desktop sidebar (Perform + Lifestyle groups) and a five-item mobile
  bottom nav with a lifestyle menu sheet for secondary tools.
- Dark, screenshot-ready `lf-*` design system built for comfortable longer use.
- PWA install support from supported desktop and mobile browsers.
- Opt-in notification preferences with web-push background reminders and a
  generic test notification.
- Supabase-synced user preferences for training goal, reminders, meal plan,
  grocery checklist, and health goals.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS with a custom `lf-*` utility design system
- Archivo (display) + Inter (body) fonts via `next/font`
- Supabase Auth, PostgreSQL, and Row Level Security
- Supabase Storage (avatars)
- Recharts
- Lucide React
- React Hook Form + Zod
- web-push + Vercel Cron (notifications)
- Expo / React Native mobile companion (`apps/mobile`)
- Vercel hosting + Vercel Analytics

## Architecture Overview

LogFit uses the Next.js App Router for public auth routes (`/login`,
`/register`) and protected app routes. Shared UI lives in `components/`, while
feature-specific query helpers, types, static data, and browser-storage
utilities live under `src/lib/`.

Deterministic performance logic lives in `src/lib/performance/` (readiness,
mission, muscles, journey, history, report). These are pure calculations from
workouts, flexible daily habits, weight logs, goal weight, and planned-meal
nutrition macros — no AI or paid services.

Sessions are cookie-based via `@supabase/ssr`: `middleware.ts` verifies the
session server-side and redirects unauthenticated visitors off protected
routes before they render (client-side guards remain as a second layer). Data
fetching is client-side via the browser Supabase client in
`src/lib/supabase/client.ts`. Supabase-backed features fetch only the signed-in
user's rows and rely on Row Level Security as the final protection layer.

The design system uses `lf-*` utility classes in `app/globals.css`
(`lf-panel`, `lf-inset`, `lf-eyebrow`, `lf-press`, `lf-rise`, `lf-num`) with an
ember accent (`--accent`) and semantic readiness state tokens (`--ready`,
`--caution`, `--strain`).

Recipes and training-plan templates are static local TypeScript data. Meal
Planner, Grocery List checked state, selected training goal, notification
preferences, and health goals sync through Supabase user preferences, with
`localStorage` retained as a fallback so the app stays usable when sync is
unavailable.

## Repository Layout

```text
app/                Next.js App Router routes (auth + protected app)
components/         Shared and feature UI (dashboard, workout-mode, body, ...)
src/lib/            Query helpers, performance logic, types, static data
supabase/           schema.sql (core) + health-schema.sql (Connected Health)
public/             Icons, screenshots, manifest, service worker
apps/mobile/        Expo React Native companion for Connected Health
```

`apps/` is excluded from the web `tsconfig` and ESLint config; the mobile app
has its own `package.json` and `tsconfig`.

## Database Overview

The core Supabase schema is stored in `supabase/schema.sql`.

Core tables:

- `profiles`
- `weight_logs`
- `workouts`
- `workout_exercises`
- `daily_habits`
- `habit_definitions`
- `habit_completions`
- `user_preferences`

User-owned tables are scoped through Supabase Auth. RLS policies restrict rows
so users can only access their own fitness data. Workout exercises are protected
through their parent workout ownership.

Profile avatars use Supabase Storage in a public `avatars` bucket. The profile
row stores the public avatar URL in `profiles.avatar_url`.

Live Workout Mode saves a per-set breakdown into `workout_exercises.notes`
(for example `Sets: 60kg×8, 62.5kg×6`), the top weight in `weight`, and set
count in `sets` — no schema change is required.

The older `daily_habits` table remains in the schema for compatibility, while
the flexible habit tables (`habit_definitions` and `habit_completions`) are the
source of truth going forward.

## Flexible Daily Habits

The Habits page supports user-created habits in addition to the default LogFit
routine. Each user gets default habit definitions on first visit, can add custom
habits, edit custom habit names/descriptions, hide habits they do not want, and
track completions per habit per day.

New tables:

- `habit_definitions`: user-owned habit list, including default/custom status,
  active state, description, and sort order.
- `habit_completions`: one completion state per habit per date.

Run the latest `supabase/schema.sql` in the Supabase SQL Editor if your live
project does not have these tables yet.

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

LogFit stores long-term preferences in the `user_preferences` table so key
settings can follow the user across devices.

Synced preferences include:

- Selected training goal.
- Notification preference toggles.
- Preferred reminder time.
- Meal Planner weekly state.
- Grocery List checked state.
- Health goals (added with Connected Health).

Local device storage is still retained as a fallback. If sync is unavailable,
the app stays usable and saves preferences on the current device.

Recipes and training-plan templates remain static local app data. Weight logs,
habits, workouts, profiles, avatars, goal weight, user preferences, and health
metrics are Supabase-backed.

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

## Connected Health

Connected Health lets users import health data from Apple Health (iOS) and
Android Health Connect through the native companion app in `apps/mobile`. The
companion is an Expo React Native app that signs in with the same Supabase
accounts and performs an idempotent 14-day sync keyed on
`(user_id, metric_date, platform)`.

- Native health access uses `react-native-health-connect` (Android) and
  `@kingstinct/react-native-healthkit` (iOS) behind a provider abstraction.
- The web layer (`src/lib/health/queries.ts`) **fails soft**: if the health
  tables are missing it returns an empty summary, so the web app keeps working
  without Connected Health.
- Readiness prefers synced sleep and resting heart rate when available and falls
  back to manual habit data otherwise.
- The Command Centre strip swaps in Steps/Sleep cells when data exists, and
  Settings includes a Connected Health card (`/settings#connected-health`).

The Connected Health schema is isolated in `supabase/health-schema.sql`
(additive and idempotent). Apply it in the Supabase SQL Editor. It adds:

- `health_connections`: one row per user per platform, tracking status and last
  sync.
- `health_daily_metrics`: one row per user per day per platform (steps, sleep,
  resting heart rate, active energy, distance, weight, exercise minutes).
- A `health_goals` JSONB column on `user_preferences`.

## Supabase Setup

1. Create a free Supabase project.
2. Enable Email authentication in Authentication > Providers.
3. Open the SQL Editor.
4. Copy the contents of `supabase/schema.sql` and run it.
5. (Optional) Run `supabase/health-schema.sql` to enable Connected Health.
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
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=
WEB_PUSH_CONTACT=mailto:you@example.com
CRON_SECRET=
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

Run the quality checks (also run by GitHub Actions CI on every push and PR):

```bash
npm run lint
npm run typecheck
npm test
```

Unit tests use Vitest and cover the deterministic logic in
`src/lib/performance/`, `src/lib/notifications/`, and the workout-form
schema. Create a production build:

```bash
npm run build
```

Open http://localhost:3000 while developing.

### Mobile companion (optional)

The Connected Health companion lives in `apps/mobile` and is managed
separately:

```bash
cd apps/mobile
npm install
npm run start
```

It uses the same Supabase project. Requires an Expo dev client and a physical
device for real health-platform data.

## Deployment

LogFit is designed for Vercel Hobby hosting and Supabase Free.

Vercel steps:

1. Connect the GitHub repository to Vercel.
2. Add the variables from `.env.example` in Vercel Project Settings >
   Environment Variables. Keep the service-role key, private VAPID key, and
   cron secret server-only.
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

Payment note: the Settings support card uses external links only. LogFit does
not load PayPal or Yoco SDKs, process payments internally, collect card details,
store payment information, or run payment webhooks.

## PWA Install Support

LogFit includes a web app manifest and install metadata so supported browsers
can install it without an app store. The Settings page includes an Install
LogFit card with an `Install app` button where the browser exposes the install
prompt, plus manual instructions for browsers that do not.

- Android: Chrome menu > Install app or Add to Home Screen.
- iPhone: Safari > Share > Add to Home Screen.
- Desktop: use the browser address bar install icon or browser menu.
- Browser support varies, so manual instructions remain visible as a fallback.
- The notification-only service worker does not cache private dashboard,
  workout, weight, habit, or meal data.
- PWA icons live in `public/icons/` and can be replaced later with final brand
  assets if needed.

## Notifications

LogFit includes opt-in notification preferences in Settings. Users can request
browser notification permission, choose reminder categories, set a preferred
time, configure a two-to-fourteen-day training inactivity threshold, disable
reminders, and send a test notification.

- Preferences are stored on the device and synced to the signed-in account.
- While LogFit is open, a private coordinator checks for inactivity at the
  preferred reminder time and sends at most one comeback message per day.
- Background delivery uses `public/notification-sw.js`, VAPID web-push keys,
  the `push_subscriptions` table in `supabase/schema.sql`, and the protected
  `/api/notifications/inactivity` endpoint.
- `vercel.json` runs the endpoint daily at 06:00 UTC, which is compatible with
  Vercel Hobby cron limits. The endpoint removes expired subscriptions and
  records delivery time to prevent duplicate daily reminders.
- Browser and device support varies, and users can disable reminders anytime.
- Notification content is motivational and avoids private workout, weight,
  habit, or meal details.

Generate VAPID keys once for a deployment:

```bash
npx web-push generate-vapid-keys
```

Apply `supabase/schema.sql`, add the public and private VAPID keys to the
matching environment variables, set a random `CRON_SECRET` of at least 16
characters, and redeploy.

## Sharing

Settings includes a Share LogFit card. It uses the device-native share sheet
when available and provides direct WhatsApp, Telegram, SMS, email, and copy-link
fallbacks.

## Manual QA Checklist

Use this checklist before demos or deployments:

1. Register and log in with a Supabase email/password user.
2. Confirm `/dashboard` loads real user-scoped data: readiness, today's mission,
   streak, weekly load, consistency, nutrition macros, and empty states.
3. Test `/workouts` create/edit/delete and the live `/workouts/live` Workout
   Mode with per-set logging and rest timer.
4. Test `/body` muscle map reflects recent training.
5. Test `/progress` trends and `/report` weekly summary.
6. Test `/weight` add, edit, delete, chart, and stats.
7. Test `/habits` toggles and 7-day summary persistence.
8. Test `/recipes` filters and several `/recipes/[slug]` detail pages.
9. Test `/meal-planner` selections, refresh persistence, clear slot, and clear
   week.
10. Test `/grocery-list` generation, category grouping, checked persistence,
    clear checked, and reset checked.
11. Test `/training-plan` goal selection, refresh persistence, and Log workout
    links.
12. Test `/settings` profile data, avatar upload/remove, notification
    preferences, inactivity threshold, test notification, Connected Health card,
    share options, PayPal support link, Yoco coming soon state, and logout.
13. Log out and confirm protected pages redirect to `/login`.

## Future Improvements

- Safe static asset service worker support.
- Desktop app version with Tauri.
- Custom training plan builder.
- More healthy recipes.
- Broader Connected Health metrics and richer body-intelligence insights.

## Author

Built by Henry Gagiano as a full-stack fitness portfolio project.
