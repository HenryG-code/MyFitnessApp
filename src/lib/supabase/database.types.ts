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
  workout_type: string | null;
  started_at: string;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkoutExercise = {
  id: string;
  workout_id: string;
  user_id: string;
  name: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  order_index: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DailyHabit = {
  id: string;
  user_id: string;
  habit_date: string;
  habit_key: string;
  label: string;
  target_value: number | null;
  completed_value: number | null;
  unit: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

type Insert<T extends { id?: string; created_at?: string; updated_at?: string }> =
  Omit<T, "id" | "created_at" | "updated_at"> & {
    id?: string;
    created_at?: string;
    updated_at?: string;
  };

type Update<T> = Partial<Omit<T, "id" | "created_at">> & {
  id?: never;
  created_at?: never;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Insert<Profile>;
        Update: Update<Profile>;
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
        Insert: Insert<WeightLog>;
        Update: Update<WeightLog>;
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
        Insert: Insert<Workout>;
        Update: Update<Workout>;
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
        Insert: Insert<WorkoutExercise>;
        Update: Update<WorkoutExercise>;
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_fkey";
            columns: ["workout_id"];
            referencedRelation: "workouts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_exercises_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_habits: {
        Row: DailyHabit;
        Insert: Insert<DailyHabit>;
        Update: Update<DailyHabit>;
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
