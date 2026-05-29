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

## Features

- Supabase Auth with protected app routes and public login/register redirects.
- Real dashboard data from user-scoped weight, habit, and workout records.
- Weight Tracker CRUD with chart and stats.
- Daily Habits with boolean daily habit tracking.
- Workout Tracker CRUD with exercises.
- Healthy Recipes using local static TypeScript data.
- Meal Planner using the static recipe library and browser localStorage.
- Grocery List generated from Meal Planner selections with local checked state.
- Suggested Training Plans using static rule-based templates and localStorage.
- Settings with real profile data, privacy notes, logout, and external support
  links.

Recipes, Meal Planner, Grocery List, and Suggested Training Plans are free
static/localStorage features in v1. No paid APIs, AI APIs, recipe APIs, grocery
APIs, analytics, or payment SDKs are used.

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

Dashboard, weight tracking, daily habits, workout tracking, settings, healthy
recipes, Meal Planner, and Grocery List are wired into their current v1 data
sources. Meal Planner, Grocery List, and Suggested Training Plans use
localStorage for v1.

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

Use this checklist when setting up the app locally:

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

## Manual QA Checklist

Use this broader checklist before portfolio demos or deployments:

1. Log in with a Supabase email/password user.
2. Confirm `/dashboard` loads real user-scoped dashboard data and quick links.
3. Test `/weight` create, edit, delete, chart, and empty state.
4. Test `/habits` daily habit toggles and weekly summary.
5. Test `/workouts` create, edit, delete, exercise rows, and workout details.
6. Test `/recipes` filters and several `/recipes/[slug]` detail pages.
7. Test `/meal-planner` selections, refresh persistence, clear slot, and clear
   week.
8. Test `/grocery-list` generation from planned meals, category grouping,
   checked item persistence, clear checked, and reset checked.
9. Test `/training-plan` goal selection, refresh persistence, and Log workout
   links.
10. Test `/settings` real profile data, quick links, external support links,
    and logout.
11. Log out and confirm protected routes redirect to `/login`.

## Weight Tracker CRUD Testing

The weight tracker is a Supabase-backed feature using user-scoped data.

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

Daily Habits is a Supabase-backed feature. The live table uses one
`daily_habits` row per user per day with seven boolean habit columns.

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

Workout Tracker is a Supabase-backed feature using the live workout schema.

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
2. Visit `/dashboard` with no data and confirm empty states and action links
   appear.
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

## Healthy Recipes Testing

Healthy Recipes is a static v1 feature powered by local TypeScript data in
`src/lib/recipes/data.ts`. No paid API is used, no recipe content is scraped,
and no Supabase recipe tables are required yet. Filtering happens client-side,
and Meal Planner plus Grocery List reuse this same local recipe library.

1. Register or log in with a Supabase email/password account.
2. Open `/recipes`.
3. Confirm recipe cards display for breakfast, lunch, dinner, and snack meals.
4. Use the meal type, goal, prep time, and protein filters.
5. Open several recipe detail pages, such as
   `/recipes/greek-yogurt-protein-bowl` and `/recipes/chicken-rice-power-bowl`.
6. Confirm an invalid recipe slug shows the clean not-found state.
7. Confirm `/dashboard`, `/weight`, `/habits`, `/workouts`, and `/settings`
   still load.

Grocery List generates from Meal Planner selections.

## Meal Planner Testing

Meal Planner uses the static recipe library and stores weekly selections in
browser `localStorage` under `liftlog-meal-planner-v1`. No Supabase table,
database migration, paid API, AI, or scraped recipe content is used for v1.
Grocery List reads this saved plan to generate shopping items.

1. Register or log in with a Supabase email/password account.
2. Open `/meal-planner`.
3. Select recipes for several meal slots across the week.
4. Refresh the page and confirm selections persist.
5. Clear one meal slot and confirm daily and weekly totals update.
6. Use Clear week and confirm the browser confirmation appears.
7. Open selected recipe detail links and confirm they go to `/recipes/[slug]`.
8. Confirm `/recipes`, `/dashboard`, `/weight`, `/habits`, `/workouts`, and
   `/settings` still load.

No extra SQL is required.

## Suggested Training Plans Testing

Suggested Training Plans are static rule-based templates in
`src/lib/training-plans/data.ts`. No AI, paid API, external fitness API, or
scraped workout content is used. The selected goal is stored in browser
`localStorage` under `liftlog-training-goal-v1`.

These plans are general fitness suggestions, not medical advice. Start light,
use proper form, and consult a professional if you have injuries or medical
conditions. Users can manually log strength and hybrid suggested workouts from
`/workouts/new`.

1. Register or log in with a Supabase email/password account.
2. Open `/training-plan`.
3. Select each goal and confirm the weekly plan changes.
4. Refresh the page and confirm the selected goal persists.
5. Confirm plan overview stats and session cards render.
6. Confirm Log workout buttons link to `/workouts/new`.
7. Confirm `/dashboard`, `/workouts`, `/weight`, `/habits`, `/recipes`,
   `/meal-planner`, `/grocery-list`, and `/settings` still load.

No extra SQL is required.

## Grocery List Testing

Grocery List is generated from Meal Planner selections and the static recipe
library. Checked grocery item state is stored in browser `localStorage` under
`liftlog-grocery-list-checked-v1`. No Supabase table, database migration, paid
API, AI, or scraped grocery content is used for v1. Quantity math is
intentionally simple: duplicate ingredients are combined and shown with recipe
usage counts instead of invented measurements.

1. Register or log in with a Supabase email/password account.
2. Open `/grocery-list` with no planned meals and confirm the empty state links
   to `/meal-planner`.
3. Add recipes to several slots on `/meal-planner`.
4. Return to `/grocery-list` and confirm ingredients generate from selected
   recipes.
5. Confirm ingredients are grouped by category and duplicates show recipe usage
   counts.
6. Check a few items, refresh the page, and confirm checked state persists.
7. Use Clear checked items and Reset all checked states.
8. Confirm `/meal-planner`, `/recipes`, `/dashboard`, `/weight`, `/habits`,
   `/workouts`, and `/settings` still load.

No extra SQL is required.

## Settings Real Profile Data Testing

The Settings page reads the signed-in Supabase Auth user and the matching
`profiles` row when available. If the profile row is missing, it falls back to
Auth metadata and email.

Settings also includes external “Support the project” links for Yoco and
PayPal. These are placeholder URLs for now, and LiftLog does not process
payments internally, load payment SDKs, collect card details, or store payment
information.

1. Register or log in with a Supabase email/password account.
2. Open `/settings`.
3. Confirm the full name or email appears in the Profile and Account details
   sections.
4. Confirm the account status says signed in and the plan says free portfolio
   version.
5. Confirm the Yoco and PayPal support buttons open in a new tab.
6. Use the sign out button and confirm logout still returns you to `/login`.
7. Confirm `/weight`, `/habits`, and `/workouts` still load after signing back
   in.
