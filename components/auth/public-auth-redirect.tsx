"use client";

import {
  createBrowserSupabaseClient,
  hasSupabaseEnv,
} from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export function PublicAuthRedirect({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!hasSupabaseEnv) {
      setIsChecking(false);
      return;
    }

    const supabase = createBrowserSupabaseClient();
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      if (data.session) {
        router.replace("/dashboard");
        return;
      }

      setIsChecking(false);
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isChecking) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="rounded-[1.75rem] border border-line/80 bg-card/85 p-6 text-center shadow-[0_20px_60px_rgba(23,33,28,0.08)] backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-accent">
            Checking session
          </p>
          <p className="mt-3 text-sm font-medium text-muted">
            Seeing if you are already signed in.
          </p>
        </div>
      </main>
    );
  }

  return children;
}
