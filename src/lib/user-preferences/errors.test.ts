import { describe, expect, it } from "vitest";
import { getPreferenceSaveError } from "@/src/lib/user-preferences/errors";

describe("preference save errors", () => {
  it("explains a missing database column", () => {
    expect(
      getPreferenceSaveError({
        code: "42703",
        message: "column user_preferences.running_plan does not exist",
      })
    ).toContain("database update");
  });

  it("explains permission and session failures", () => {
    expect(
      getPreferenceSaveError({ message: "new row violates row-level security" })
    ).toContain("permission");
    expect(getPreferenceSaveError({ message: "JWT expired" })).toContain(
      "session has expired"
    );
  });

  it("does not claim a failed preference was saved locally", () => {
    expect(getPreferenceSaveError({ message: "network request failed" })).toBe(
      "Could not reach account storage. Check your connection and retry."
    );
  });
});
