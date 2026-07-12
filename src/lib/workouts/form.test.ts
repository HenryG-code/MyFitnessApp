import { describe, expect, it } from "vitest";
import {
  getDefaultValues,
  getEmptyExercise,
  toWorkoutInput,
  workoutSchema,
  type WorkoutFormValues,
} from "./form";

describe("getDefaultValues", () => {
  it("prefills a lift selected from the strength tracker", () => {
    expect(getDefaultValues(undefined, "Bench press").exercises[0].exercise_name)
      .toBe("Bench press");
  });
});

function formValues(overrides: Partial<WorkoutFormValues>): WorkoutFormValues {
  return {
    title: "Upper body",
    workout_date: "2026-07-12",
    duration_minutes: "",
    notes: "",
    exercises: [getEmptyExercise()],
    ...overrides,
  };
}

describe("workoutSchema", () => {
  it("accepts a minimal workout with an untouched exercise row", () => {
    expect(workoutSchema.safeParse(formValues({})).success).toBe(true);
  });

  it("rejects a too-short title", () => {
    expect(workoutSchema.safeParse(formValues({ title: "A" })).success).toBe(
      false
    );
  });

  it("rejects zero workout duration but allows empty", () => {
    expect(
      workoutSchema.safeParse(formValues({ duration_minutes: "0" })).success
    ).toBe(false);
    expect(
      workoutSchema.safeParse(formValues({ duration_minutes: "" })).success
    ).toBe(true);
  });

  it("requires a name once any exercise field is filled", () => {
    const result = workoutSchema.safeParse(
      formValues({
        exercises: [{ ...getEmptyExercise(), sets: "3" }],
      })
    );

    expect(result.success).toBe(false);
  });

  it("rejects negative and non-integer set counts", () => {
    for (const sets of ["-1", "2.5"]) {
      const result = workoutSchema.safeParse(
        formValues({
          exercises: [{ ...getEmptyExercise(), exercise_name: "Squat", sets }],
        })
      );

      expect(result.success).toBe(false);
    }
  });

  it("allows decimal weights", () => {
    const result = workoutSchema.safeParse(
      formValues({
        exercises: [
          { ...getEmptyExercise(), exercise_name: "Squat", weight: "62.5" },
        ],
      })
    );

    expect(result.success).toBe(true);
  });
});

describe("toWorkoutInput", () => {
  it("drops rows without an exercise name", () => {
    const input = toWorkoutInput(
      formValues({
        exercises: [
          { ...getEmptyExercise(), exercise_name: "Squat", sets: "3" },
          getEmptyExercise(),
        ],
      })
    );

    expect(input.exercises).toHaveLength(1);
    expect(input.exercises[0].exercise_name).toBe("Squat");
  });

  it("converts empty strings to nulls and numbers to numbers", () => {
    const input = toWorkoutInput(
      formValues({
        duration_minutes: "45",
        exercises: [
          {
            ...getEmptyExercise(),
            exercise_name: "  Bench press  ",
            sets: "3",
            weight: "62.5",
            notes: "  ",
          },
        ],
      })
    );

    expect(input.duration_minutes).toBe(45);
    expect(input.exercises[0]).toMatchObject({
      exercise_name: "Bench press",
      sets: 3,
      reps: null,
      weight: 62.5,
      notes: null,
    });
  });
});
