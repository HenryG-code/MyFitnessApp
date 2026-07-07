import type { HealthProvider } from "./types";

/**
 * Fallback provider for unsupported platforms (web/simulators without
 * health services). Metro resolves provider.android.ts / provider.ios.ts
 * ahead of this file on real devices.
 */
export const healthProvider: HealthProvider = {
  platform: "health_connect",
  async getAvailability() {
    return "unavailable";
  },
  async requestPermissions() {
    return [];
  },
  async readDailyMetrics() {
    return [];
  },
};
