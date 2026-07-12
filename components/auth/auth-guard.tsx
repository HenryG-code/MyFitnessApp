"use client";

import { AppShell } from "@/components/app-shell";
import {
  createBrowserSupabaseClient,
  hasSupabaseEnv,
} from "@/src/lib/supabase/client";
import {
  ensureUserPreferences,
  parseSelectedTrainingGoal,
} from "@/src/lib/user-preferences/queries";
import type { User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(hasSupabaseEnv);
  const [checkedOnboardingUserId, setCheckedOnboardingUserId] = useState<
    string | null
  >(null);
  // Derived instead of mirrored into state, so navigations don't re-trigger a
  // "checking" flash for an already-verified user.
  const isOnboardingResolved =
    pathname === "/onboarding" ||
    (user !== null && checkedOnboardingUserId === user.id);

  useEffect(() => {
    if (!hasSupabaseEnv) {
      router.replace("/login");
      return;
    }

    const supabase = createBrowserSupabaseClient();
    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error || !data.session?.user) {
        setIsChecking(false);
        router.replace("/login");
        return;
      }

      setUser(data.session.user);
      setIsChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        setCheckedOnboardingUserId(null);
        setIsChecking(false);
        router.replace("/login");
        return;
      }

      setUser(session.user);
      setIsChecking(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (
      !user ||
      pathname === "/onboarding" ||
      checkedOnboardingUserId === user.id
    ) {
      return;
    }

    let isMounted = true;

    ensureUserPreferences()
      .then((preferences) => {
        if (!isMounted) return;

        if (!parseSelectedTrainingGoal(preferences)) {
          router.replace("/onboarding");
          return;
        }

        setCheckedOnboardingUserId(user.id);
      })
      .catch(() => {
        if (isMounted) {
          // Preference sync should never lock an authenticated user out.
          setCheckedOnboardingUserId(user.id);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [checkedOnboardingUserId, pathname, router, user]);

  if (isChecking || !user || !isOnboardingResolved) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="rounded-[1.75rem] border border-line/80 bg-card/85 p-6 text-center shadow-[0_20px_60px_rgba(23,33,28,0.08)] backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-accent">
            {user && !isOnboardingResolved
              ? "Personalizing your plan"
              : "Checking session"}
          </p>
          <p className="mt-3 text-sm font-medium text-muted">
            {user && !isOnboardingResolved
              ? "Loading your saved training direction."
              : "Hang tight while LogFit opens the gym door."}
          </p>
        </div>
      </main>
    );
  }

  if (pathname === "/onboarding") {
    return children;
  }

  return <AppShell user={user}>{children}</AppShell>;
}
