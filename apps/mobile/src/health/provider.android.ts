import {
  aggregateRecord,
  getSdkStatus,
  initialize,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
  type Permission,
} from "react-native-health-connect";
import {
  listDatesInclusive,
  type DailyHealthMetrics,
  type HealthAvailability,
  type HealthPermissionCategory,
  type HealthProvider,
} from "./types";

const recordTypeByCategory: Record<HealthPermissionCategory, Permission["recordType"]> = {
  steps: "Steps",
  sleep: "SleepSession",
  restingHeartRate: "RestingHeartRate",
  activeEnergy: "ActiveCaloriesBurned",
  distance: "Distance",
  weight: "Weight",
  exercise: "ExerciseSession",
};

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    initialized = await initialize();
  }
  return initialized;
}

function dayRange(date: string) {
  return {
    operator: "between" as const,
    startTime: new Date(`${date}T00:00:00`).toISOString(),
    endTime: new Date(`${date}T23:59:59.999`).toISOString(),
  };
}

/** Sleep window: from 18:00 the previous evening to 18:00 on the wake date. */
function sleepRange(wakeDate: string) {
  const end = new Date(`${wakeDate}T18:00:00`);
  const start = new Date(end);
  start.setDate(start.getDate() - 1);

  return {
    operator: "between" as const,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  };
}

async function safe<T>(work: () => Promise<T>): Promise<T | null> {
  try {
    return await work();
  } catch {
    // Denied permission or unsupported record type — treat as no data.
    return null;
  }
}

export const healthProvider: HealthProvider = {
  platform: "health_connect",

  async getAvailability(): Promise<HealthAvailability> {
    try {
      const status = await getSdkStatus();

      if (status === SdkAvailabilityStatus.SDK_AVAILABLE) {
        return "available";
      }

      if (
        status ===
        SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED
      ) {
        return "needs-install";
      }

      return "unavailable";
    } catch {
      return "unavailable";
    }
  },

  async requestPermissions(categories) {
    if (!(await ensureInitialized())) {
      return [];
    }

    const requested: Permission[] = categories.map((category) => ({
      accessType: "read",
      recordType: recordTypeByCategory[category],
    }));

    const granted = await requestPermission(requested);
    const grantedTypes = new Set(
      granted
        .filter((permission) => permission.accessType === "read")
        .map((permission) => permission.recordType)
    );

    return categories.filter((category) =>
      grantedTypes.has(recordTypeByCategory[category])
    );
  },

  async readDailyMetrics(startDate, endDate) {
    if (!(await ensureInitialized())) {
      return [];
    }

    const days = listDatesInclusive(startDate, endDate);
    const results: DailyHealthMetrics[] = [];

    for (const date of days) {
      const range = dayRange(date);

      const [steps, energy, distance, sleep, rhr, weight, exercise] =
        await Promise.all([
          safe(async () => {
            const aggregate = await aggregateRecord({
              recordType: "Steps",
              timeRangeFilter: range,
            });
            return aggregate.COUNT_TOTAL > 0 ? aggregate.COUNT_TOTAL : null;
          }),
          safe(async () => {
            const aggregate = await aggregateRecord({
              recordType: "ActiveCaloriesBurned",
              timeRangeFilter: range,
            });
            const kcal = aggregate.ACTIVE_CALORIES_TOTAL?.inKilocalories ?? 0;
            return kcal > 0 ? Math.round(kcal * 10) / 10 : null;
          }),
          safe(async () => {
            const aggregate = await aggregateRecord({
              recordType: "Distance",
              timeRangeFilter: range,
            });
            const meters = aggregate.DISTANCE?.inMeters ?? 0;
            return meters > 0 ? Math.round(meters) : null;
          }),
          safe(async () => {
            const aggregate = await aggregateRecord({
              recordType: "SleepSession",
              timeRangeFilter: sleepRange(date),
            });
            // SLEEP_DURATION_TOTAL is total seconds.
            const seconds = aggregate.SLEEP_DURATION_TOTAL ?? 0;
            return seconds > 0 ? Math.round(seconds / 60) : null;
          }),
          safe(async () => {
            const { records } = await readRecords("RestingHeartRate", {
              timeRangeFilter: range,
            });
            if (!records.length) {
              return null;
            }
            const sum = records.reduce(
              (total, record) => total + record.beatsPerMinute,
              0
            );
            return Math.round((sum / records.length) * 10) / 10;
          }),
          safe(async () => {
            const { records } = await readRecords("Weight", {
              timeRangeFilter: range,
            });
            if (!records.length) {
              return null;
            }
            const latest = records[records.length - 1];
            return Math.round(latest.weight.inKilograms * 100) / 100;
          }),
          safe(async () => {
            const aggregate = await aggregateRecord({
              recordType: "ExerciseSession",
              timeRangeFilter: range,
            });
            const seconds = aggregate.EXERCISE_DURATION_TOTAL?.inSeconds ?? 0;
            return seconds > 0 ? Math.round(seconds / 60) : null;
          }),
        ]);

      results.push({
        metricDate: date,
        steps,
        sleepMinutes: sleep,
        restingHeartRateBpm: rhr,
        activeEnergyKcal: energy,
        distanceMeters: distance,
        weightKg: weight,
        exerciseMinutes: exercise,
      });
    }

    return results;
  },
};
