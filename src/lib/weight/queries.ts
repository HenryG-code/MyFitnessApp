import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";
import type {
  WeightLog,
  WeightLogInsert,
  WeightLogUpdate,
} from "@/src/lib/supabase/database.types";

export type WeightLogFormInput = {
  logged_at: string;
  weight_kg: number;
  notes: string | null;
};

async function getAuthenticatedUserId() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("You must be logged in to manage weight logs.");
  }

  return { supabase, userId: user.id };
}

export async function fetchWeightLogs() {
  const { supabase, userId } = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", userId)
    .order("logged_at", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies WeightLog[];
}

export async function createWeightLog(input: WeightLogFormInput) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const payload: WeightLogInsert = {
    user_id: userId,
    logged_at: input.logged_at,
    weight_kg: input.weight_kg,
    notes: input.notes,
  };

  const { data, error } = await supabase
    .from("weight_logs")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies WeightLog;
}

export async function updateWeightLog(
  id: string,
  input: WeightLogFormInput
) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const payload: WeightLogUpdate = {
    logged_at: input.logged_at,
    weight_kg: input.weight_kg,
    notes: input.notes,
  };

  const { data, error } = await supabase
    .from("weight_logs")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies WeightLog;
}

export async function deleteWeightLog(id: string) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const { error } = await supabase
    .from("weight_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
