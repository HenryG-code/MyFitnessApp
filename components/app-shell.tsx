"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { BackToTopButton } from "@/components/ui/back-to-top-button";
import { getUserDisplayName } from "@/src/lib/auth/user";
import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Dumbbell,
  Home,
  Plus,
  Scale,
  Settings,
  ShoppingBasket,
  Sprout,
  Target,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Workouts", href: "/workouts", icon: Dumbbell },
  { label: "Weight", href: "/weight", icon: Scale },
  { label: "Habits", href: "/habits", icon: Sprout },
  { label: "Recipes", href: "/recipes", icon: BookOpen },
  { label: "Meal Planner", href: "/meal-planner", icon: CalendarDays },
  { label: "Grocery List", href: "/grocery-list", icon: ShoppingBasket },
  { label: "Training Plan", href: "/training-plan", icon: Target },
  { label: "Settings", href: "/settings", icon: Settings },
];

const mobileNavItems = navItems.filter(
  (item) =>
    item.href !== "/recipes" &&
    item.href !== "/meal-planner" &&
    item.href !== "/grocery-list" &&
    item.href !== "/training-plan"
);

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name: string, email?: string) {
  const source = name.trim() || email?.trim() || "LiftLog User";
  const words = source.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function UserAvatar({
  avatarUrl,
  userName,
  email,
  size = "md",
}: {
  avatarUrl: string | null;
  userName: string;
  email?: string;
  size?: "sm" | "md";
}) {
  const sizeClassName = size === "sm" ? "size-11" : "size-14";
  const textClassName = size === "sm" ? "text-sm" : "text-xl";

  return (
    <span
      className={`grid ${sizeClassName} shrink-0 place-items-center overflow-hidden rounded-2xl border border-accent/25 bg-accent/10 font-display font-black text-accent`}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={`${userName} avatar`}
          className="size-full object-cover"
        />
      ) : (
        <span className={textClassName}>{getInitials(userName, email)}</span>
      )}
    </span>
  );
}

export function AppShell({
  children,
  user,
}: {
  children: ReactNode;
  user: User;
}) {
  const pathname = usePathname();
  const userName = getUserDisplayName(user);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = createBrowserSupabaseClient();

    supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (isMounted) {
          setAvatarUrl(data?.avatar_url ?? null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user.id]);

  useEffect(() => {
    function handleAvatarUpdated(event: Event) {
      const customEvent = event as CustomEvent<{ avatarUrl: string | null }>;
      setAvatarUrl(customEvent.detail.avatarUrl);
    }

    window.addEventListener("liftlog-avatar-updated", handleAvatarUpdated);

    return () => {
      window.removeEventListener("liftlog-avatar-updated", handleAvatarUpdated);
    };
  }, []);

  return (
    <div className="min-h-screen text-foreground">
      <aside className="fixed inset-y-4 left-4 z-30 hidden w-72 flex-col rounded-[2rem] border border-line/90 bg-card/95 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.48)] backdrop-blur-xl lg:flex">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-[1.4rem] border border-line bg-surface p-4 text-white shadow-inner shadow-white/[0.03]"
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-sun text-stone-950">
            <BarChart3 className="size-5" />
          </span>
          <span>
            <span className="block font-display text-lg font-black">
              LiftLog
            </span>
            <span className="text-xs text-stone-300">Free fitness tracker</span>
          </span>
        </Link>

        <nav className="mt-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  active
                    ? "bg-accent text-stone-950 shadow-lg shadow-accent/20"
                    : "text-muted hover:bg-white/10 hover:text-foreground"
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-[1.6rem] border border-line bg-surface/90 p-4">
            <div className="flex items-center gap-3">
              <UserAvatar
                avatarUrl={avatarUrl}
                userName={userName}
                email={user.email}
              />
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
                  Signed in
                </p>
                <p className="mt-1 truncate font-display text-lg font-black">
                  {userName}
                </p>
                {user.email ? (
                  <p className="mt-1 truncate text-xs font-medium text-muted">
                    {user.email}
                  </p>
                ) : null}
              </div>
            </div>
            <LogoutButton className="mt-4 w-full bg-accent text-stone-950 hover:bg-accent-strong" />
          </div>

          <div className="rounded-[1.6rem] border border-accent/25 bg-accent/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
              Keep building
            </p>
            <p className="mt-2 text-2xl font-black tracking-tight">
              Your private hub
            </p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Track workouts, habits, meals, groceries, and training plans from
              one private dashboard.
            </p>
          </div>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-5 sm:px-6 lg:ml-80 lg:mr-6 lg:px-0 lg:pb-10">
        <header className="mb-5 rounded-[1.75rem] border border-line/80 bg-card/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="flex items-center gap-3">
              <UserAvatar
                avatarUrl={avatarUrl}
                userName={userName}
                email={user.email}
                size="sm"
              />
              <span>
                <span className="block font-display text-lg font-black">
                  LiftLog
                </span>
                <span className="text-xs font-medium text-muted">
                  {userName}
                </span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/recipes"
                className={`grid size-11 place-items-center rounded-2xl border border-line bg-surface text-muted transition hover:bg-white/10 ${
                  isActive(pathname, "/recipes") ? "bg-accent text-stone-950" : ""
                }`}
                aria-label="Open recipes"
              >
                <BookOpen className="size-5" />
              </Link>
              <Link
                href="/meal-planner"
                className={`grid size-11 place-items-center rounded-2xl border border-line bg-surface text-muted transition hover:bg-white/10 ${
                  isActive(pathname, "/meal-planner")
                    ? "bg-accent text-stone-950"
                    : ""
                }`}
                aria-label="Open meal planner"
              >
                <CalendarDays className="size-5" />
              </Link>
              <Link
                href="/workouts/new"
                className="grid size-11 place-items-center rounded-2xl bg-accent text-stone-950 shadow-lg shadow-accent/20"
                aria-label="Add workout"
              >
                <Plus className="size-5" />
              </Link>
            </div>
          </div>
        </header>

        {children}
      </main>

      <BackToTopButton />

      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[1.5rem] border border-line/90 bg-card/95 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.48)] backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[0.68rem] font-black transition ${
                  active
                    ? "bg-accent text-stone-950"
                    : "text-muted hover:bg-white/10 hover:text-foreground"
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
