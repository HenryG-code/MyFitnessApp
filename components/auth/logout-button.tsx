"use client";

import {
  createBrowserSupabaseClient,
  hasSupabaseEnv,
} from "@/src/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LogoutButtonProps = {
  className?: string;
  label?: string;
};

export function LogoutButton({
  className = "",
  label = "Log out",
}: LogoutButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setError("");
    setIsSigningOut(true);

    try {
      if (hasSupabaseEnv) {
        const supabase = createBrowserSupabaseClient();
        const { error: signOutError } = await supabase.auth.signOut();

        if (signOutError) {
          throw signOutError;
        }
      }

      router.replace("/login");
      router.refresh();
    } catch (logoutError) {
      setError(
        logoutError instanceof Error
          ? logoutError.message
          : "Could not log out. Please try again."
      );
      setIsSigningOut(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isSigningOut}
        className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      >
        <LogOut className="size-4" />
        {isSigningOut ? "Logging out..." : label}
      </button>
      {error ? <p className="mt-2 text-sm font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
