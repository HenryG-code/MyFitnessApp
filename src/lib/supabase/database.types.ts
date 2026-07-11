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
  goal_weight_kg: number | null;
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

export type HabitDefinition = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type HabitCompletion = {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type UserPreferences = {
  user_id: string;
  selected_training_goal: string | null;
  notification_preferences: Json;
  preferred_reminder_time: string | null;
  meal_plan: Json;
  grocery_checked_items: Json;
  health_goals: Json;
  created_at: string;
  updated_at: string;
};

export type PushSubscription = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  timezone: string;
  user_agent: string | null;
  last_inactivity_notification_at: string | null;
  created_at: string;
  updated_at: string;
};

export type HealthPlatform = "apple_health" | "health_connect";

export type HealthConnection = {
  id: string;
  user_id: string;
  platform: HealthPlatform;
  status: "connected" | "disconnected" | "error";
  device_label: string | null;
  permissions: Json;
  connected_at: string;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type HealthDailyMetric = {
  id: string;
  user_id: string;
  metric_date: string;
  platform: HealthPlatform;
  source_name: string | null;
  steps: number | null;
  sleep_minutes: number | null;
  resting_heart_rate_bpm: number | null;
  active_energy_kcal: number | null;
  distance_meters: number | null;
  weight_kg: number | null;
  exercise_minutes: number | null;
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
  goal_weight_kg?: number | null;
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

export type HabitDefinitionInsert = {
  id?: string;
  user_id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  sort_order?: number;
  is_active?: boolean;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type HabitDefinitionUpdate = Partial<
  Omit<HabitDefinition, "id" | "user_id" | "created_at">
>;

export type HabitCompletionInsert = {
  id?: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  is_completed?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type HabitCompletionUpdate = Partial<
  Omit<HabitCompletion, "id" | "habit_id" | "user_id" | "created_at">
>;

export type UserPreferencesInsert = {
  user_id: string;
  selected_training_goal?: string | null;
  notification_preferences?: Json;
  preferred_reminder_time?: string | null;
  meal_plan?: Json;
  grocery_checked_items?: Json;
  health_goals?: Json;
  created_at?: string;
  updated_at?: string;
};

export type PushSubscriptionInsert = {
  id?: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  timezone?: string;
  user_agent?: string | null;
  last_inactivity_notification_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PushSubscriptionUpdate = Partial<
  Omit<PushSubscription, "id" | "user_id" | "created_at">
>;

export type HealthConnectionInsert = {
  id?: string;
  user_id: string;
  platform: HealthPlatform;
  status?: HealthConnection["status"];
  device_label?: string | null;
  permissions?: Json;
  connected_at?: string;
  last_synced_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type HealthConnectionUpdate = Partial<
  Omit<HealthConnection, "id" | "user_id" | "created_at">
>;

export type HealthDailyMetricInsert = {
  id?: string;
  user_id: string;
  metric_date: string;
  platform: HealthPlatform;
  source_name?: string | null;
  steps?: number | null;
  sleep_minutes?: number | null;
  resting_heart_rate_bpm?: number | null;
  active_energy_kcal?: number | null;
  distance_meters?: number | null;
  weight_kg?: number | null;
  exercise_minutes?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type HealthDailyMetricUpdate = Partial<
  Omit<HealthDailyMetric, "id" | "user_id" | "created_at">
>;

export type UserPreferencesUpdate = Partial<
  Omit<UserPreferences, "user_id" | "created_at">
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
      habit_definitions: {
        Row: HabitDefinition;
        Insert: HabitDefinitionInsert;
        Update: HabitDefinitionUpdate;
        Relationships: [
          {
            foreignKeyName: "habit_definitions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      habit_completions: {
        Row: HabitCompletion;
        Insert: HabitCompletionInsert;
        Update: HabitCompletionUpdate;
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey";
            columns: ["habit_id"];
            referencedRelation: "habit_definitions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "habit_completions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: UserPreferencesInsert;
        Update: UserPreferencesUpdate;
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      push_subscriptions: {
        Row: PushSubscription;
        Insert: PushSubscriptionInsert;
        Update: PushSubscriptionUpdate;
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      health_connections: {
        Row: HealthConnection;
        Insert: HealthConnectionInsert;
        Update: HealthConnectionUpdate;
        Relationships: [
          {
            foreignKeyName: "health_connections_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      health_daily_metrics: {
        Row: HealthDailyMetric;
        Insert: HealthDailyMetricInsert;
        Update: HealthDailyMetricUpdate;
        Relationships: [
          {
            foreignKeyName: "health_daily_metrics_user_id_fkey";
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
