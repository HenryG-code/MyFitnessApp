"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { InstallAppCard } from "@/components/pwa/install-app-card";
import { AvatarUploadCard } from "@/components/settings/avatar-upload-card";
import { ConnectedHealthCard } from "@/components/settings/connected-health-card";
import { NotificationPreferencesCard } from "@/components/settings/notification-preferences-card";
import { PreferenceSyncStatusCard } from "@/components/settings/preference-sync-status-card";
import { ShareAppCard } from "@/components/settings/share-app-card";
import {
  fetchAuthenticatedProfile,
  type AuthProfile,
} from "@/src/lib/profile/queries";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  HandHeart,
  HeartPulse,
  LayoutGrid,
  Lock,
  LogOut,
  RefreshCw,
  Share2,
  ShieldCheck,
  ShoppingBasket,
  Target,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

const supportLinks = {
  paypal: "https://paypal.me/HenryGagiano",
  // TODO: Replace with the real Yoco payment link once approved.
  yoco: "",
};

const toolLinks = [
  { href: "/recipes", title: "Recipes", detail: "Browse balanced meals", icon: BookOpen },
  { href: "/meal-planner", title: "Meal Planner", detail: "Build your weekly meal plan", icon: CalendarDays },
  { href: "/grocery-list", title: "Grocery List", detail: "Shop from planned meals", icon: ShoppingBasket },
  { href: "/training-plan", title: "Training Plan", detail: "Pick a goal-based routine", icon: Target },
];

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return (words[0] ?? "L").slice(0, 2).toUpperCase();
}

/** Android-style category label above a group of setting rows. */
function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-4 pb-1.5 pt-3 text-[0.65rem] font-black uppercase tracking-[0.2em] tabular-nums text-accent">
      {children}
    </p>
  );
}

/** Rows in a group sit flush with hairline gaps, like Android 12+ settings. */
function Group({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 [&>section]:rounded-lg [&>section:first-child]:rounded-t-2xl [&>section:last-child]:rounded-b-2xl">
      {children}
    </div>
  );
}

function SettingsSection({
  sectionKey,
  icon: Icon,
  iconClassName,
  title,
  subtitle,
  leading,
  open,
  onToggle,
  children,
}: {
  sectionKey: string;
  icon?: LucideIcon;
  iconClassName?: string;
  title: string;
  subtitle: string;
  leading?: ReactNode;
  open: boolean;
  onToggle: (key: string) => void;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden border border-line/60 bg-card/85">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onToggle(sectionKey)}
        className="lf-press flex min-h-14 w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-white/[0.03]"
      >
        {leading ??
          (Icon ? (
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-full ${iconClassName ?? "bg-white/[0.07] text-muted"}`}
            >
              <Icon className="size-4" />
            </span>
          ) : null)}
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold leading-tight">{title}</span>
          <span className="mt-0.5 block truncate text-xs leading-tight text-muted">
            {subtitle}
          </span>
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="lf-fade border-t border-line/50 px-3.5 py-3">
          {children}
        </div>
      ) : null}
    </section>
  );
}

export function SettingsPanel() {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;

    fetchAuthenticatedProfile()
      .then((data) => {
        if (isMounted) {
          setProfile(data);
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load account settings."
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Deep links like /settings#connected-health open and scroll to the section.
  useEffect(() => {
    if (window.location.hash.slice(1) !== "connected-health") {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setOpenSections((current) => new Set(current).add("health"));
      requestAnimationFrame(() => {
        document
          .getElementById("connected-health")
          ?.scrollIntoView({ block: "start" });
      });
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  function toggleSection(key: string) {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const fullName = profile?.fullName ?? "Signed-in user";
  const email = profile?.email ?? null;
  const avatarUrl = profile?.profile?.avatar_url ?? null;

  return (
    <div className="mx-auto max-w-2xl space-y-1">
      <header className="px-1 pb-2">
        <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
          Settings
        </h1>
      </header>

      {error ? (
        <p className="rounded-2xl border border-strain/25 bg-strain/10 p-3 text-sm font-bold text-strain">
          {error}
        </p>
      ) : null}

      <GroupLabel>Account</GroupLabel>
      <Group>
        <SettingsSection
          sectionKey="profile"
          title={fullName}
          subtitle={
            isLoading ? "Loading your account…" : (email ?? "Profile & avatar")
          }
          leading={
            <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-accent/25 bg-accent/10 text-xs font-black text-accent">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                getInitials(fullName)
              )}
            </span>
          }
          open={openSections.has("profile")}
          onToggle={toggleSection}
        >
          <AvatarUploadCard
            fullName={fullName}
            email={email}
            avatarUrl={avatarUrl}
            onSaved={(savedProfile) =>
              setProfile((currentProfile) =>
                currentProfile
                  ? {
                      ...currentProfile,
                      fullName:
                        savedProfile.full_name?.trim() ||
                        currentProfile.fullName,
                      profile: savedProfile,
                    }
                  : currentProfile
              )
            }
          />
          <dl className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
            <div className="rounded-lg bg-white/[0.05] p-2.5">
              <dt className="font-black uppercase tracking-[0.14em] text-ink-dim">
                Name
              </dt>
              <dd className="mt-0.5 font-bold">{fullName}</dd>
            </div>
            <div className="rounded-lg bg-white/[0.05] p-2.5">
              <dt className="font-black uppercase tracking-[0.14em] text-ink-dim">
                Email
              </dt>
              <dd className="mt-0.5 break-all font-bold">{email ?? "--"}</dd>
            </div>
            <div className="rounded-lg bg-white/[0.05] p-2.5">
              <dt className="font-black uppercase tracking-[0.14em] text-ink-dim">
                Status
              </dt>
              <dd className="mt-0.5 flex items-center gap-1.5 font-bold">
                <ShieldCheck className="size-3.5 text-ready" />
                Signed in
              </dd>
            </div>
            <div className="rounded-lg bg-white/[0.05] p-2.5">
              <dt className="font-black uppercase tracking-[0.14em] text-ink-dim">
                Plan
              </dt>
              <dd className="mt-0.5 font-bold">Free version</dd>
            </div>
          </dl>
        </SettingsSection>

        <SettingsSection
          sectionKey="privacy"
          icon={Lock}
          iconClassName="bg-sun/15 text-sun"
          title="Privacy"
          subtitle="Your data stays private to your account"
          open={openSections.has("privacy")}
          onToggle={toggleSection}
        >
          <p className="text-xs leading-5 text-muted">
            Your workouts, weight check-ins, habits, and preferences stay
            private to your signed-in account.
          </p>
        </SettingsSection>
      </Group>

      <GroupLabel>Tracking</GroupLabel>
      <Group>
        <SettingsSection
          sectionKey="notifications"
          icon={Bell}
          iconClassName="bg-accent/15 text-accent-strong"
          title="Notifications"
          subtitle="Workout, habit, and meal reminders"
          open={openSections.has("notifications")}
          onToggle={toggleSection}
        >
          <NotificationPreferencesCard />
        </SettingsSection>

        <SettingsSection
          sectionKey="health"
          icon={HeartPulse}
          iconClassName="bg-ready/15 text-ready"
          title="Connected Health"
          subtitle="Steps, sleep, and heart data from your phone"
          open={openSections.has("health")}
          onToggle={toggleSection}
        >
          <ConnectedHealthCard />
        </SettingsSection>

        <SettingsSection
          sectionKey="sync"
          icon={RefreshCw}
          iconClassName="bg-caution/15 text-caution"
          title="Preference sync"
          subtitle="Backup status for plans and preferences"
          open={openSections.has("sync")}
          onToggle={toggleSection}
        >
          <PreferenceSyncStatusCard />
        </SettingsSection>
      </Group>

      <GroupLabel>App</GroupLabel>
      <Group>
        <SettingsSection
          sectionKey="tools"
          icon={LayoutGrid}
          iconClassName="bg-white/[0.08] text-foreground"
          title="Quick links"
          subtitle="Recipes, meals, groceries, and plans"
          open={openSections.has("tools")}
          onToggle={toggleSection}
        >
          <ul className="divide-y divide-line/50">
            {toolLinks.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="lf-press flex min-h-12 items-center gap-3 py-2 transition hover:bg-white/[0.03]"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/[0.07] text-muted">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold leading-tight">
                        {item.title}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {item.detail}
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-ink-dim" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </SettingsSection>

        <SettingsSection
          sectionKey="share"
          icon={Share2}
          iconClassName="bg-accent/15 text-accent-strong"
          title="Share LogFit"
          subtitle="Invite a training partner"
          open={openSections.has("share")}
          onToggle={toggleSection}
        >
          <ShareAppCard />
        </SettingsSection>

        <SettingsSection
          sectionKey="install"
          icon={Download}
          iconClassName="bg-ready/15 text-ready"
          title="Install app"
          subtitle="Add LogFit to your home screen"
          open={openSections.has("install")}
          onToggle={toggleSection}
        >
          <p className="text-xs leading-5 text-muted">
            Add LogFit to your device for quicker access from your home screen
            or desktop.
          </p>
          <div className="mt-2">
            <InstallAppCard />
          </div>
        </SettingsSection>

        <SettingsSection
          sectionKey="support"
          icon={HandHeart}
          iconClassName="bg-sun/15 text-sun"
          title="Support the project"
          subtitle="Help fund future improvements"
          open={openSections.has("support")}
          onToggle={toggleSection}
        >
          <p className="text-xs leading-5 text-muted">
            Enjoying LogFit? You can support future improvements.
          </p>
          <div className="mt-3 grid gap-2">
            {supportLinks.yoco ? (
              <a
                href={supportLinks.yoco}
                target="_blank"
                rel="noreferrer"
                className="lf-press inline-flex min-h-11 items-center justify-center gap-3 rounded-xl border border-line bg-white/[0.04] px-4 text-sm font-black transition hover:border-accent"
              >
                <Image
                  src="/brand/yoco-logo.png"
                  alt=""
                  width={72}
                  height={20}
                  className="h-5 w-auto"
                />
                Support with Yoco
                <ExternalLink className="size-4 text-muted" />
              </a>
            ) : (
              <span
                className="inline-flex min-h-11 items-center justify-center gap-3 rounded-xl border border-line bg-white/[0.02] px-4 text-sm font-black text-muted"
                aria-disabled="true"
              >
                <Image
                  src="/brand/yoco-logo.png"
                  alt=""
                  width={72}
                  height={20}
                  className="h-5 w-auto opacity-70"
                />
                Yoco coming soon
              </span>
            )}
            <a
              href={supportLinks.paypal}
              target="_blank"
              rel="noreferrer"
              className="lf-press inline-flex min-h-11 items-center justify-center gap-3 rounded-xl border border-line bg-white/[0.04] px-4 text-sm font-black transition hover:border-accent"
            >
              <Image
                src="/brand/paypal-icon.webp"
                alt=""
                width={76}
                height={20}
                className="h-5 w-auto"
              />
              Support with PayPal
              <ExternalLink className="size-4 text-muted" />
            </a>
          </div>
        </SettingsSection>
      </Group>

      <div className="pt-3">
        <section className="flex min-h-14 items-center gap-3 rounded-2xl border border-strain/20 bg-card/85 px-3.5 py-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-strain/15 text-strain">
            <LogOut className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold leading-tight">
              Sign out
            </span>
            <span className="mt-0.5 block truncate text-xs leading-tight text-muted">
              Return to the public login page
            </span>
          </span>
          <LogoutButton className="shrink-0 !px-4 !py-2 !text-xs bg-stone-950 text-white hover:bg-accent" />
        </section>
      </div>
    </div>
  );
}
