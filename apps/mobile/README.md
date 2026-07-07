# LogFit Mobile — Native Health Bridge

Expo/React Native companion app that connects **Apple Health (iOS)** or
**Android Health Connect** to the existing LogFit Supabase backend.

```
Wearable / Fitness device
  ↓
Apple Health / Health Connect
  ↓
LogFit Mobile (this app)   ← auth: same LogFit Supabase accounts
  ↓
Supabase (health_daily_metrics, health_connections — RLS protected)
  ↓
LogFit Web (Command Centre, readiness, Weekly Report)
```

## What it does (v1)

- Sign in with your existing LogFit account (same Supabase project).
- Connect the platform health layer with least-privilege read permissions:
  steps, sleep, resting HR, active energy, distance, weight, exercise minutes.
- Sync a rolling 14-day window of **daily aggregates** (no raw sample dumps).
- Idempotent upserts keyed on `(user_id, metric_date, platform)` — repeated
  syncs never duplicate rows.
- Sync on app foreground + manual **Sync Now**. No fake background sync;
  platform-honest background delivery is future work.
- Quick links to Recipes, Grocery List, and Meal Planner (opens the
  mobile-optimised LogFit web app).

## Prerequisites

The Supabase health schema must be applied first — run
`supabase/health-schema.sql` (repo root) in the Supabase SQL Editor.

## Development builds (required — not Expo Go)

Both health integrations use native modules, so use a development build:

```bash
cd apps/mobile
npm install
npx expo prebuild          # generates android/ + ios/ with plugins applied
npm run android            # device/emulator with Health Connect (Android 14+ built in)
npm run ios                # macOS + Xcode required; HealthKit needs a real device
```

Notes:

- **Android**: Health Connect is part of Android 14+; on Android 13 and below
  the app links to the Play Store listing. Permissions are declared in
  `app.json > android.permissions` and surfaced by the
  `react-native-health-connect` config plugin.
- **iOS**: HealthKit capability + usage strings come from the
  `@kingstinct/react-native-healthkit` plugin config in `app.json`.
  HealthKit is unavailable in the iOS Simulator for most data types — test on
  a device. Apple never reveals which read permissions were granted; absent
  data is indistinguishable from denied access by design.
- The Supabase **anon (publishable) key** in `app.json` is the same public
  client key the web app ships; Row Level Security protects all data.
  No service-role key exists anywhere in this app.

## Validation status

- Web integration (schema contract, fail-soft queries, readiness fallbacks)
  is validated by the web build in CI/Vercel.
- The native project is structured and typed but **native binaries were not
  built in the authoring environment** — run the commands above on a machine
  with Android Studio / Xcode to produce the first build, and verify the
  permission prompts and denied/partial-grant paths on a real device.

## Privacy

- Explicit opt-in; the app and LogFit web work fully without a connection.
- Only daily aggregates are stored; provenance kept in `source_name`.
- No health data in analytics or logs. Disconnect and data deletion are
  available in LogFit web → Settings → Connected Health.
