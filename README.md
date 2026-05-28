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
for user/date queries, maintains `updated_at` timestamps, and creates a profile
automatically when a new Supabase Auth user signs up.

## Supabase Client

The browser Supabase client lives at:

```text
src/lib/supabase/client.ts
```

Manual database types live at:

```text
src/lib/supabase/database.types.ts
```

The current UI still uses mock data. Workout, weight, habit, and auth form logic
is not connected to Supabase yet.

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
