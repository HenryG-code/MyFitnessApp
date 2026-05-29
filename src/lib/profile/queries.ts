import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";
import type { Profile } from "@/src/lib/supabase/database.types";

export type AuthProfile = {
  userId: string;
  email: string | null;
  fullName: string;
  profile: Profile | null;
};

function readMetadataFullName(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function fetchAuthenticatedProfile(): Promise<AuthProfile> {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("You must be logged in to view settings.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const metadataFullName = readMetadataFullName(user.user_metadata.full_name);
  const fullName =
    profile?.full_name?.trim() || metadataFullName || user.email || "Signed-in user";

  return {
    userId: user.id,
    email: user.email ?? profile?.email ?? null,
    fullName,
    profile,
  };
}
