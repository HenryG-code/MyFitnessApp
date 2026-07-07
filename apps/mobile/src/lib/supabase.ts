import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { config } from "./config";

/**
 * Same Supabase project and user accounts as the LogFit web app.
 * The anon key is a publishable client key; Row Level Security is the
 * protection layer for all user data.
 */
export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
