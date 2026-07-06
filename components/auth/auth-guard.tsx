"use client";

import { AppShell } from "@/components/app-shell";
import {
  createBrowserSupabaseClient,
  hasSupabaseEnv,
} from "@/src/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(hasSupabaseEnv);

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

  if (isChecking || !user) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="rounded-[1.75rem] border border-line/80 bg-card/85 p-6 text-center shadow-[0_20px_60px_rgba(23,33,28,0.08)] backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-accent">
            Checking session
          </p>
          <p className="mt-3 text-sm font-medium text-muted">
            Hang tight while LogFit opens the gym door.
          </p>
        </div>
      </main>
    );
  }

  return <AppShell user={user}>{children}</AppShell>;
}
