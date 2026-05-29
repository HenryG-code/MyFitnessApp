export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type WeightLog = {
  id: string;
  user_id: string;
  logged_at: string;
  weight_kg: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Workout = {
  id: string;
  user_id: string;
  title: string;
  workout_date: string;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
};

export type WorkoutExercise = {
  id: string;
  workout_id: string;
  exercise_name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  distance_km: number | null;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
};

export type DailyHabit = {
  id: string;
  user_id: string;
  habit_date: string;
  sleep_8_hours: boolean;
  trained: boolean;
  walked_10k_steps: boolean;
  ate_healthy: boolean;
  no_late_food: boolean;
  limited_alcohol: boolean;
  clean_environment: boolean;
  created_at: string;
  updated_at: string;
};

export type HabitKey =
  | "sleep_8_hours"
  | "trained"
  | "walked_10k_steps"
  | "ate_healthy"
  | "no_late_food"
  | "limited_alcohol"
  | "clean_environment";

export type ProfileInsert = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProfileUpdate = Partial<Omit<Profile, "id" | "created_at">>;

export type WeightLogInsert = {
  id?: string;
  user_id: string;
  logged_at?: string;
  weight_kg: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type WeightLogUpdate = Partial<
  Omit<WeightLog, "id" | "user_id" | "created_at">
>;

export type WorkoutInsert = {
  id?: string;
  user_id: string;
  title: string;
  workout_date?: string;
  duration_minutes?: number | null;
  notes?: string | null;
  created_at?: string;
};

export type WorkoutUpdate = Partial<
  Omit<Workout, "id" | "user_id" | "created_at">
>;

export type WorkoutExerciseInsert = {
  id?: string;
  workout_id: string;
  exercise_name: string;
  sets?: number | null;
  reps?: number | null;
  weight?: number | null;
  distance_km?: number | null;
  duration_minutes?: number | null;
  notes?: string | null;
  created_at?: string;
};

export type WorkoutExerciseUpdate = Partial<
  Omit<WorkoutExercise, "id" | "workout_id" | "created_at">
>;

export type DailyHabitInsert = {
  id?: string;
  user_id: string;
  habit_date?: string;
  sleep_8_hours?: boolean;
  trained?: boolean;
  walked_10k_steps?: boolean;
  ate_healthy?: boolean;
  no_late_food?: boolean;
  limited_alcohol?: boolean;
  clean_environment?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type DailyHabitUpdate = Partial<
  Omit<DailyHabit, "id" | "user_id" | "created_at">
>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      weight_logs: {
        Row: WeightLog;
        Insert: WeightLogInsert;
        Update: WeightLogUpdate;
        Relationships: [
          {
            foreignKeyName: "weight_logs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      workouts: {
        Row: Workout;
        Insert: WorkoutInsert;
        Update: WorkoutUpdate;
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_exercises: {
        Row: WorkoutExercise;
        Insert: WorkoutExerciseInsert;
        Update: WorkoutExerciseUpdate;
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_fkey";
            columns: ["workout_id"];
            referencedRelation: "workouts";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_habits: {
        Row: DailyHabit;
        Insert: DailyHabitInsert;
        Update: DailyHabitUpdate;
        Relationships: [
          {
            foreignKeyName: "daily_habits_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
