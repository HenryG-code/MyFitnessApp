import { getClientEnv, hasSupabaseEnv } from "@/src/lib/env";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Cookie-based session storage (via @supabase/ssr) so the middleware can
// verify auth server-side before protected pages render.
export function createBrowserSupabaseClient() {
  const env = getClientEnv();

  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export { hasSupabaseEnv };
