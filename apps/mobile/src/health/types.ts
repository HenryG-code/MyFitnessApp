/**
 * Normalized health contract.
 * Mirrors the columns of public.health_daily_metrics in Supabase
 * (see supabase/health-schema.sql and src/lib/health/queries.ts on the web).
 */
export type HealthPlatform = "apple_health" | "health_connect";

export type DailyHealthMetrics = {
  /** YYYY-MM-DD local date. Sleep sessions are assigned to the wake date. */
  metricDate: string;
  steps: number | null;
  sleepMinutes: number | null;
  restingHeartRateBpm: number | null;
  activeEnergyKcal: number | null;
  distanceMeters: number | null;
  weightKg: number | null;
  exerciseMinutes: number | null;
};

export type HealthPermissionCategory =
  | "steps"
  | "sleep"
  | "restingHeartRate"
  | "activeEnergy"
  | "distance"
  | "weight"
  | "exercise";

export type HealthAvailability =
  | "available"
  | "needs-install" // Health Connect app missing (older Android)
  | "unavailable";

export interface HealthProvider {
  platform: HealthPlatform;
  /** Whether the platform health layer can be used on this device. */
  getAvailability(): Promise<HealthAvailability>;
  /**
   * Request read permission for the given categories.
   * Returns the categories actually granted (may be a subset).
   */
  requestPermissions(
    categories: HealthPermissionCategory[]
  ): Promise<HealthPermissionCategory[]>;
  /**
   * Read normalized daily aggregates for the inclusive local-date window.
   * Missing/denied categories yield null fields — never fabricated values.
   */
  readDailyMetrics(startDate: string, endDate: string): Promise<DailyHealthMetrics[]>;
}

export function getLocalDateValue(date = new Date()) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function getDateDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return getLocalDateValue(date);
}

export function listDatesInclusive(startDate: string, endDate: string) {
  const dates: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  while (cursor <= end) {
    dates.push(getLocalDateValue(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}
