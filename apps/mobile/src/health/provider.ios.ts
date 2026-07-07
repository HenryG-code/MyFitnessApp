import {
  isHealthDataAvailable,
  queryQuantitySamples,
  queryCategorySamples,
  queryStatisticsForQuantity,
  requestAuthorization,
} from "@kingstinct/react-native-healthkit";
import {
  listDatesInclusive,
  type DailyHealthMetrics,
  type HealthAvailability,
  type HealthPermissionCategory,
  type HealthProvider,
} from "./types";

const identifierByCategory: Record<HealthPermissionCategory, string> = {
  steps: "HKQuantityTypeIdentifierStepCount",
  sleep: "HKCategoryTypeIdentifierSleepAnalysis",
  restingHeartRate: "HKQuantityTypeIdentifierRestingHeartRate",
  activeEnergy: "HKQuantityTypeIdentifierActiveEnergyBurned",
  distance: "HKQuantityTypeIdentifierDistanceWalkingRunning",
  weight: "HKQuantityTypeIdentifierBodyMass",
  exercise: "HKQuantityTypeIdentifierAppleExerciseTime",
};

function dayBounds(date: string) {
  return {
    from: new Date(`${date}T00:00:00`),
    to: new Date(`${date}T23:59:59.999`),
  };
}

/** Sleep window: 18:00 the previous evening → 18:00 on the wake date. */
function sleepBounds(wakeDate: string) {
  const to = new Date(`${wakeDate}T18:00:00`);
  const from = new Date(to);
  from.setDate(from.getDate() - 1);
  return { from, to };
}

async function safe<T>(work: () => Promise<T>): Promise<T | null> {
  try {
    return await work();
  } catch {
    return null;
  }
}

async function sumQuantity(
  identifier: string,
  unit: string,
  from: Date,
  to: Date
) {
  const stats = await queryStatisticsForQuantity(
    identifier as never,
    ["cumulativeSum"] as never,
    { filter: { startDate: from, endDate: to }, unit } as never
  );
  const value = (stats as { sumQuantity?: { quantity?: number } })?.sumQuantity
    ?.quantity;
  return typeof value === "number" && value > 0 ? value : null;
}

export const healthProvider: HealthProvider = {
  platform: "apple_health",

  async getAvailability(): Promise<HealthAvailability> {
    try {
      return (await isHealthDataAvailable()) ? "available" : "unavailable";
    } catch {
      return "unavailable";
    }
  },

  async requestPermissions(categories) {
    const identifiers = categories.map(
      (category) => identifierByCategory[category]
    );

    try {
      // (toShare, toRead) — LogFit only reads.
      await requestAuthorization([], identifiers as never);
      // HealthKit never reveals which read permissions were granted;
      // absent data is indistinguishable from denied access by design.
      return categories;
    } catch {
      return [];
    }
  },

  async readDailyMetrics(startDate, endDate) {
    const days = listDatesInclusive(startDate, endDate);
    const results: DailyHealthMetrics[] = [];

    for (const date of days) {
      const { from, to } = dayBounds(date);

      const [steps, energy, distance, exercise, rhr, weight, sleep] =
        await Promise.all([
          safe(() =>
            sumQuantity("HKQuantityTypeIdentifierStepCount", "count", from, to)
          ),
          safe(() =>
            sumQuantity(
              "HKQuantityTypeIdentifierActiveEnergyBurned",
              "kcal",
              from,
              to
            )
          ),
          safe(() =>
            sumQuantity(
              "HKQuantityTypeIdentifierDistanceWalkingRunning",
              "m",
              from,
              to
            )
          ),
          safe(() =>
            sumQuantity(
              "HKQuantityTypeIdentifierAppleExerciseTime",
              "min",
              from,
              to
            )
          ),
          safe(async () => {
            const samples = await queryQuantitySamples(
              "HKQuantityTypeIdentifierRestingHeartRate" as never,
              {
                filter: { startDate: from, endDate: to },
                unit: "count/min",
              } as never
            );
            const list = samples as unknown as Array<{ quantity: number }>;
            if (!list.length) {
              return null;
            }
            const sum = list.reduce((total, s) => total + s.quantity, 0);
            return Math.round((sum / list.length) * 10) / 10;
          }),
          safe(async () => {
            const samples = await queryQuantitySamples(
              "HKQuantityTypeIdentifierBodyMass" as never,
              { filter: { startDate: from, endDate: to }, unit: "kg" } as never
            );
            const list = samples as unknown as Array<{ quantity: number }>;
            if (!list.length) {
              return null;
            }
            return Math.round(list[list.length - 1].quantity * 100) / 100;
          }),
          safe(async () => {
            const bounds = sleepBounds(date);
            // The iOS implementation accepts (identifier, options); the
            // cross-platform stub types only declare one parameter.
            const querySleep = queryCategorySamples as unknown as (
              identifier: string,
              options: unknown
            ) => Promise<unknown>;
            const samples = await querySleep(
              "HKCategoryTypeIdentifierSleepAnalysis",
              { filter: { startDate: bounds.from, endDate: bounds.to } }
            );
            const list = samples as unknown as Array<{
              value: number;
              startDate: string | Date;
              endDate: string | Date;
            }>;
            // Values 3,4,5 are asleepCore/Deep/REM; 1 is legacy "asleep".
            const asleep = list.filter((sample) =>
              [1, 3, 4, 5].includes(sample.value)
            );
            if (!asleep.length) {
              return null;
            }
            const minutes = asleep.reduce((total, sample) => {
              const start = new Date(sample.startDate).getTime();
              const end = new Date(sample.endDate).getTime();
              return total + Math.max(0, end - start) / 60_000;
            }, 0);
            return minutes > 0 ? Math.round(minutes) : null;
          }),
        ]);

      results.push({
        metricDate: date,
        steps: steps !== null ? Math.round(steps) : null,
        sleepMinutes: sleep,
        restingHeartRateBpm: rhr,
        activeEnergyKcal: energy !== null ? Math.round(energy * 10) / 10 : null,
        distanceMeters: distance !== null ? Math.round(distance) : null,
        weightKg: weight,
        exerciseMinutes: exercise !== null ? Math.round(exercise) : null,
      });
    }

    return results;
  },
};
