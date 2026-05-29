# LiftLog

A free fitness tracker portfolio app built with Next.js App Router, TypeScript,
Tailwind CSS, Recharts, React Hook Form, Zod, Lucide React, and Supabase.

This project is intentionally free-tier friendly:

- Vercel Hobby hosting
- Supabase Free plan for Auth and PostgreSQL
- No paid services
- No AI APIs
- No Stripe or payment features
- No file uploads
- No paid analytics

## Getting Started

Install dependencies and run the local development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Get these values from your Supabase project dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`: Project Settings > API > Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Project Settings > API > anon public key

Never commit `.env.local` or real Supabase keys.

## Supabase Setup

1. Create a free Supabase project.
2. In the Supabase dashboard, go to Authentication > Providers.
3. Enable Email provider authentication.
4. Choose whether email confirmation is required for your project.
5. Go to SQL Editor.
6. Open `supabase/schema.sql` from this repository.
7. Paste the full SQL file into the SQL Editor.
8. Run the SQL.

The schema creates the foundation tables:

- `profiles`
- `weight_logs`
- `workouts`
- `workout_exercises`
- `daily_habits`

It also enables Row Level Security, adds user ownership policies, adds indexes
for user/date queries, maintains `updated_at` timestamps where useful, and
creates a profile automatically when a new Supabase Auth user signs up.

## Supabase Client

The browser Supabase client lives at:

```text
src/lib/supabase/client.ts
```

Manual database types live at:

```text
src/lib/supabase/database.types.ts
```

The dashboard still uses mock fitness summary data. Weight, daily habits, and
workout tracking are connected to Supabase.

## Authentication

Login, registration, protected routes, and logout are connected to Supabase Auth.

Required local values in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The protected app routes redirect signed-out users to `/login`. The public
`/login` and `/register` routes redirect signed-in users back to `/dashboard`.
Registration passes `full_name` to Supabase user metadata. If your Supabase
project requires email confirmation, new users will see a message asking them to
confirm their email before logging in.

Do not commit `.env.local` or real Supabase keys.

## Validation

Run a production build before deploying:

```bash
npm run build
```

## Testing Checklist

Use this checklist before the first real feature milestone:

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and add your Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

3. Start the app locally:

```bash
npm run dev
```

4. Build the app:

```bash
npm run build
```

5. Test registration:

Open `/register`, enter a full name, email, password, and matching confirmation.
If email confirmation is enabled in Supabase, confirm the email before logging in.

6. Test login:

Open `/login`, sign in with the registered email and password, and confirm you
are redirected to `/dashboard`.

7. Test protected routes:

While logged out, visit `/dashboard`, `/workouts`, `/workouts/new`, `/weight`,
`/habits`, and `/settings`. Each route should redirect to `/login`.

8. Test public auth redirects:

While logged in, visit `/login` or `/register`. Each route should redirect to
`/dashboard`.

9. Test logout:

Use the logout button in the desktop sidebar or on the settings page. You should
return to `/login`, and protected routes should require login again.

10. Deploy to Vercel:

Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel
Project Settings > Environment Variables, then deploy. Do not commit
`.env.local`.

## Weight Tracker CRUD Testing

The weight tracker is the first real Supabase-backed feature. Workouts, habits,
and dashboard fitness cards still use mock data.

1. Register or log in with a Supabase email/password account.
2. Go to `/weight`.
3. Add a weight log with a date, weight in kg, and optional notes.
4. Confirm the stat cards, recent entries list, and chart update.
5. Edit the weight log and confirm the updated values appear.
6. Delete the weight log and confirm it is removed from the list and chart.
7. Log out, create or use a second account, and confirm that account cannot see
   the first user's weight logs.

No extra SQL is required if `supabase/schema.sql` has already been run. The
feature uses the existing `weight_logs` table and its Row Level Security
policies.

## Daily Habits CRUD Testing

Daily Habits is the second Supabase-backed feature. Workouts and dashboard
fitness cards still use mock data. The live table uses one `daily_habits` row
per user per day with seven boolean habit columns.

1. Register or log in with a Supabase email/password account.
2. Go to `/habits`.
3. Confirm today's habit row is created automatically with these boolean fields:
   Sleep 8 hours, Trained, Walked 10k steps, Ate healthy, No food 3 hours before
   bed, Limited alcohol, and Clean environment.
4. Toggle a habit complete and incomplete.
5. Confirm today's completion percentage and stat cards update.
6. Confirm the 7-day summary updates after habit changes.
7. Confirm `/weight` still loads and the weight tracker still works.
8. Log out, create or use a second account, and confirm that account cannot see
   the first user's habit rows.

No extra SQL is required if `supabase/schema.sql` has already been run. The
feature uses the existing `daily_habits` table and its Row Level Security
policies.

## Workout Tracker CRUD Testing

Workout Tracker is the third Supabase-backed feature. Dashboard fitness cards
still use mock data.

1. Register or log in with a Supabase email/password account.
2. Go to `/workouts` and confirm the list or empty state loads.
3. Go to `/workouts/new`.
4. Create a workout with title, workout date, optional duration, and notes.
5. Add one or more exercise rows before saving. Exercises use `exercise_name`,
   optional sets/reps, `weight`, `distance_km`, optional exercise duration, and
   notes.
6. Confirm the workout appears on `/workouts` with exercise count and stats.
7. Open the workout with View/Edit and update workout fields or exercises.
8. Delete the workout and confirm it disappears from the list.
9. Log out, create or use a second account, and confirm that account cannot see
   the first user's workouts.
10. Confirm `/weight` still works.
11. Confirm `/habits` still works.

Workouts use `workout_date`, not `started_at`, and exercise weight uses
`weight`, not `weight_kg`. No extra SQL is required if the live Supabase tables
already match this schema. The feature uses the existing `workouts` and
`workout_exercises` tables and their Row Level Security policies.

## Dashboard Real Data Testing

The dashboard reads real user-scoped data from `weight_logs`, `daily_habits`,
`workouts`, and `workout_exercises`. Supabase Auth and RLS keep each user's
dashboard private.

1. Register or log in with a Supabase email/password account.
2. Visit `/dashboard` with no data and confirm empty placeholders and action
   links appear.
3. Add a weight log on `/weight`, then return to `/dashboard` and confirm the
   latest weight and total change update.
4. Toggle habits on `/habits`, then return to `/dashboard` and confirm today's
   completion percentage and weekly chart update.
5. Create a workout on `/workouts/new`, then return to `/dashboard` and confirm
   weekly workouts, minutes, latest workout, and chart update.
6. Confirm `/weight`, `/habits`, and `/workouts` still work.
7. Log out, use a second account, and confirm the dashboard does not show the
   first user's data.

No extra SQL is required if `supabase/schema.sql` has already been run.
