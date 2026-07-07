"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { BackToTopButton } from "@/components/ui/back-to-top-button";
import { getUserDisplayName } from "@/src/lib/auth/user";
import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  Activity,
  BookOpen,
  CalendarDays,
  Dumbbell,
  FileBarChart,
  HeartPulse,
  Home,
  LayoutGrid,
  PersonStanding,
  Plus,
  Scale,
  Settings,
  ShoppingBasket,
  Sprout,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const performNavItems = [
  { label: "Today", href: "/dashboard", icon: Home },
  { label: "Train", href: "/workouts", icon: Dumbbell },
  { label: "Body", href: "/body", icon: PersonStanding },
  { label: "Progress", href: "/progress", icon: TrendingUp },
  { label: "Report", href: "/report", icon: FileBarChart },
];

const lifestyleNavItems = [
  { label: "Weight", href: "/weight", icon: Scale },
  { label: "Habits", href: "/habits", icon: Sprout },
  { label: "Recipes", href: "/recipes", icon: BookOpen },
  { label: "Meal Planner", href: "/meal-planner", icon: CalendarDays },
  { label: "Grocery List", href: "/grocery-list", icon: ShoppingBasket },
  { label: "Training Plan", href: "/training-plan", icon: Target },
  { label: "Settings", href: "/settings", icon: Settings },
];

const mobileNavItems = [
  { label: "Today", href: "/dashboard", icon: Home },
  { label: "Train", href: "/workouts", icon: Dumbbell },
  { label: "Body", href: "/body", icon: PersonStanding },
  { label: "Progress", href: "/progress", icon: TrendingUp },
  { label: "Habits", href: "/habits", icon: Sprout },
];

/** Secondary lifestyle destinations exposed through the mobile menu sheet. */
const mobileMenuItems = [
  { label: "Recipes", href: "/recipes", icon: BookOpen },
  { label: "Grocery List", href: "/grocery-list", icon: ShoppingBasket },
  { label: "Meal Planner", href: "/meal-planner", icon: CalendarDays },
  { label: "Weight", href: "/weight", icon: Scale },
  { label: "Training Plan", href: "/training-plan", icon: Target },
  { label: "Weekly Report", href: "/report", icon: FileBarChart },
  { label: "Connected Health", href: "/settings#connected-health", icon: HeartPulse },
  { label: "Settings", href: "/settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  if (href === "/workouts" && pathname.startsWith("/workouts/live")) {
    return true;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name: string, email?: string) {
  const source = name.trim() || email?.trim() || "LogFit User";
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
  // Sheet links close the menu via their own onClick handlers.
  const [menuOpen, setMenuOpen] = useState(false);

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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface/80 px-4 py-5 backdrop-blur-xl lg:flex">
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <span className="grid size-10 place-items-center rounded-xl bg-accent text-white shadow-[0_6px_20px_rgba(240,71,46,0.35)]">
            <Activity className="size-5" />
          </span>
          <span>
            <span className="block font-display text-lg font-black tracking-tight">
              LogFit
            </span>
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-ink-dim">
              Performance OS
            </span>
          </span>
        </Link>

        <nav className="mt-7 min-h-0 flex-1 space-y-6 overflow-y-auto">
          <div>
            <p className="lf-eyebrow px-3 !text-[0.6rem]">Perform</p>
            <div className="mt-2 space-y-0.5">
              {performNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`lf-press flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                      active
                        ? "bg-accent/[0.14] text-accent-strong"
                        : "text-muted hover:bg-white/[0.05] hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-[1.1rem]" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div>
            <p className="lf-eyebrow px-3 !text-[0.6rem]">Lifestyle</p>
            <div className="mt-2 space-y-0.5">
              {lifestyleNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`lf-press flex items-center gap-3 rounded-xl px-3 py-2 text-[0.82rem] font-bold transition ${
                      active
                        ? "bg-accent/[0.14] text-accent-strong"
                        : "text-muted hover:bg-white/[0.05] hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-[1.05rem]" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="mt-auto">
          <div className="rounded-xl border border-line bg-white/[0.02] p-3">
            <div className="flex items-center gap-3">
              <UserAvatar
                avatarUrl={avatarUrl}
                userName={userName}
                email={user.email}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{userName}</p>
                {user.email ? (
                  <p className="truncate text-[0.7rem] font-medium text-ink-dim">
                    {user.email}
                  </p>
                ) : null}
              </div>
            </div>
            <LogoutButton className="mt-3 w-full rounded-xl border border-line bg-transparent text-xs text-muted hover:bg-white/[0.06] hover:text-foreground" />
          </div>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-4 sm:px-6 lg:ml-64 lg:px-8 lg:pb-10 lg:pt-6">
        <header className="mb-4 flex items-center justify-between gap-3 lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-accent text-white shadow-[0_6px_20px_rgba(240,71,46,0.3)]">
              <Activity className="size-[1.05rem]" />
            </span>
            <span className="font-display text-base font-black tracking-tight">
              LogFit
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/workouts/new"
              className="lf-press grid size-10 place-items-center rounded-xl border border-line bg-white/[0.04] text-muted transition hover:text-foreground"
              aria-label="Log a workout manually"
            >
              <Plus className="size-[1.1rem]" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="lf-press grid size-10 place-items-center rounded-xl border border-line bg-white/[0.04] text-muted transition hover:text-foreground"
              aria-label="Open lifestyle menu"
              aria-expanded={menuOpen}
            >
              <LayoutGrid className="size-[1.1rem]" />
            </button>
            <Link href="/settings" aria-label="Open settings">
              <UserAvatar
                avatarUrl={avatarUrl}
                userName={userName}
                email={user.email}
                size="sm"
              />
            </Link>
          </div>
        </header>

        {menuOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-end bg-black/60 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Lifestyle menu"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="lf-sheet w-full rounded-t-2xl border-t border-line bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="lf-eyebrow">Lifestyle</p>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  className="lf-press grid size-9 place-items-center rounded-xl border border-line text-muted"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {mobileMenuItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="lf-press flex flex-col items-center gap-1.5 rounded-xl border border-line bg-white/[0.03] px-1 py-3 text-center"
                    >
                      <Icon className="size-[1.15rem] text-accent-strong" />
                      <span className="text-[0.62rem] font-bold leading-tight text-muted">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {children}
      </main>

      <BackToTopButton />

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`lf-press flex flex-col items-center justify-center gap-0.5 py-2 text-[0.62rem] font-bold transition ${
                  active
                    ? "text-accent-strong"
                    : "text-ink-dim hover:text-foreground"
                }`}
              >
                <span
                  className={`grid h-6 w-10 place-items-center rounded-full transition ${
                    active ? "bg-accent/[0.15]" : ""
                  }`}
                >
                  <Icon className="size-[1.15rem]" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
