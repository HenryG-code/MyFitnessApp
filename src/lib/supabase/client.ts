import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getRequiredEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to .env.local for local development and to Vercel project settings for deployment.`
    );
  }

  return value;
}

export function createBrowserSupabaseClient() {
  return createClient<Database>(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey)
  );
}

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);
