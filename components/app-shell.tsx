"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { getUserDisplayName } from "@/src/lib/auth/user";
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
import type { ReactNode } from "react";

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

export function AppShell({
  children,
  user,
}: {
  children: ReactNode;
  user: User;
}) {
  const pathname = usePathname();
  const userName = getUserDisplayName(user);

  return (
    <div className="min-h-screen text-foreground">
      <aside className="fixed inset-y-4 left-4 z-30 hidden w-72 flex-col rounded-[2rem] border border-line/90 bg-card/90 p-4 shadow-[0_24px_80px_rgba(23,33,28,0.10)] backdrop-blur-xl lg:flex">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-[1.4rem] bg-stone-950 p-4 text-white"
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
                    ? "bg-accent text-white shadow-lg shadow-teal-900/15"
                    : "text-muted hover:bg-stone-100 hover:text-foreground"
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="rounded-[1.6rem] border border-line bg-white/70 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Signed in
            </p>
            <p className="mt-2 truncate font-display text-lg font-black">
              {userName}
            </p>
            {user.email ? (
              <p className="mt-1 truncate text-xs font-medium text-muted">
                {user.email}
              </p>
            ) : null}
            <LogoutButton className="mt-4 w-full bg-stone-950 text-white hover:bg-accent" />
          </div>

          <div className="rounded-[1.6rem] bg-[#eaf3dd] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-accent-strong">
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
        <header className="mb-5 rounded-[1.75rem] border border-line/80 bg-card/75 p-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-stone-950 text-sun">
                <BarChart3 className="size-5" />
              </span>
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
                className={`grid size-11 place-items-center rounded-2xl border border-line bg-white/70 text-muted transition hover:bg-stone-100 ${
                  isActive(pathname, "/recipes") ? "bg-accent text-white" : ""
                }`}
                aria-label="Open recipes"
              >
                <BookOpen className="size-5" />
              </Link>
              <Link
                href="/meal-planner"
                className={`grid size-11 place-items-center rounded-2xl border border-line bg-white/70 text-muted transition hover:bg-stone-100 ${
                  isActive(pathname, "/meal-planner")
                    ? "bg-accent text-white"
                    : ""
                }`}
                aria-label="Open meal planner"
              >
                <CalendarDays className="size-5" />
              </Link>
              <Link
                href="/workouts/new"
                className="grid size-11 place-items-center rounded-2xl bg-accent text-white shadow-lg shadow-teal-900/15"
                aria-label="Add workout"
              >
                <Plus className="size-5" />
              </Link>
            </div>
          </div>
        </header>

        {children}
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[1.5rem] border border-line/90 bg-card/95 p-2 shadow-[0_18px_60px_rgba(23,33,28,0.16)] backdrop-blur-xl lg:hidden">
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
                    ? "bg-accent text-white"
                    : "text-muted hover:bg-stone-100 hover:text-foreground"
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
