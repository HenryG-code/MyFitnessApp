import type { User } from "@supabase/supabase-js";

export function getUserDisplayName(user: User | null | undefined) {
  const fullName = user?.user_metadata?.full_name;

  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim();
  }

  return user?.email ?? "Signed-in user";
}
