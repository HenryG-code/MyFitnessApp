"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { InstallAppCard } from "@/components/pwa/install-app-card";
import { AvatarUploadCard } from "@/components/settings/avatar-upload-card";
import { ConnectedHealthCard } from "@/components/settings/connected-health-card";
import { NotificationPreferencesCard } from "@/components/settings/notification-preferences-card";
import { PreferenceSyncStatusCard } from "@/components/settings/preference-sync-status-card";
import { FitnessCard, SectionHeader } from "@/components/ui/fitness-card";
import {
  fetchAuthenticatedProfile,
  type AuthProfile,
} from "@/src/lib/profile/queries";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Download,
  ExternalLink,
  HandHeart,
  Lock,
  ShieldCheck,
  ShoppingBasket,
  Target,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function getProfileDetail(profile: AuthProfile | null) {
  if (!profile) {
    return "Loading your protected account details.";
  }

  return `${profile.fullName} - ${profile.email ?? "No email available"}`;
}

const supportLinks = {
  paypal: "https://paypal.me/HenryGagiano",
  // TODO: Replace with the real Yoco payment link once approved.
  yoco: "",
};

export function SettingsPanel() {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  const settings = [
    {
      title: "Profile",
      detail: getProfileDetail(profile),
      icon: UserRound,
    },
    {
      title: "Notifications",
      detail: "Choose reminders for workouts, habits, weekly check-ins, and meals.",
      icon: Bell,
    },
    {
      title: "Privacy",
      detail: "Your fitness data is private to your account.",
      icon: Lock,
    },
  ];

  const toolLinks = [
    {
      href: "/recipes",
      title: "Recipes",
      detail: "Browse balanced meals.",
      icon: BookOpen,
    },
    {
      href: "/meal-planner",
      title: "Meal Planner",
      detail: "Build your weekly meal plan.",
      icon: CalendarDays,
    },
    {
      href: "/grocery-list",
      title: "Grocery List",
      detail: "Shop from planned meals.",
      icon: ShoppingBasket,
    },
    {
      href: "/training-plan",
      title: "Training Plan",
      detail: "Pick a goal-based routine.",
      icon: Target,
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-5">
      <section className="rounded-[1.25rem] border border-line/80 bg-card/80 p-3.5 backdrop-blur sm:p-5">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-accent">
          Settings
        </p>
        <h1 className="mt-1 font-display text-xl font-black tracking-tight sm:mt-1.5 sm:text-3xl">
          Your LogFit account.
        </h1>
        <p className="mt-2 max-w-2xl text-xs leading-5 text-muted sm:mt-3 sm:text-sm sm:leading-6">
          Manage your profile, privacy, reminders, support options, and quick
          links from one account space.
        </p>
      </section>

      {error ? (
        <p className="rounded-[1.5rem] border border-red-100 bg-red-50 p-4 text-sm font-black text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <FitnessCard>
          <p className="text-sm font-black text-muted">
            Loading account settings...
          </p>
        </FitnessCard>
      ) : null}

      <section className="grid gap-2 sm:gap-4 lg:grid-cols-3">
        {settings.map((item) => {
          const Icon = item.icon;

          return (
            <FitnessCard key={item.title} className="min-w-0 !p-3 sm:!p-5">
              <div className="flex items-center gap-3 lg:block">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-stone-950 sm:size-12 sm:rounded-2xl">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-base font-black sm:text-xl lg:mt-5">
                    {item.title}
                  </h2>
                  <p className="mt-0.5 truncate text-xs text-muted sm:mt-2 sm:text-sm sm:leading-6 lg:whitespace-normal">
                    {item.detail}
                  </p>
                </div>
              </div>
            </FitnessCard>
          );
        })}
      </section>

      <FitnessCard className="!p-3 sm:!p-5">
        <AvatarUploadCard
          fullName={profile?.fullName ?? "Signed-in user"}
          email={profile?.email ?? null}
          avatarUrl={profile?.profile?.avatar_url ?? null}
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
      </FitnessCard>

      <FitnessCard className="!p-3 sm:!p-5">
        <SectionHeader eyebrow="Account details" title="Signed-in profile" />
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="rounded-xl bg-white/[0.055] p-3 shadow-inner shadow-white/[0.02] sm:rounded-[1.25rem] sm:p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Name
            </p>
            <p className="mt-1 font-display text-base font-black sm:mt-2 sm:text-xl">
              {profile?.fullName ?? "Signed-in user"}
            </p>
          </div>
          <div className="rounded-xl bg-white/[0.055] p-3 shadow-inner shadow-white/[0.02] sm:rounded-[1.25rem] sm:p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Email
            </p>
            <p className="mt-1 break-all font-display text-sm font-black sm:mt-2 sm:text-xl">
              {profile?.email ?? "--"}
            </p>
          </div>
          <div className="rounded-xl bg-white/[0.055] p-3 shadow-inner shadow-white/[0.02] sm:rounded-[1.25rem] sm:p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-accent" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
                  Account status
                </p>
                <p className="mt-1 font-display text-base font-black sm:text-xl">
                  Signed in
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.055] p-3 shadow-inner shadow-white/[0.02] sm:rounded-[1.25rem] sm:p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Plan
            </p>
            <p className="mt-1 font-display text-base font-black sm:mt-2 sm:text-xl">
              Free version
            </p>
          </div>
        </div>
      </FitnessCard>

      <FitnessCard className="!p-3 sm:!p-5">
        <SectionHeader eyebrow="Privacy" title="Private to your account" />
        <p className="text-sm leading-6 text-muted">
          Your workouts, weight check-ins, habits, and preferences stay private
          to your signed-in account.
        </p>
      </FitnessCard>

      <ConnectedHealthCard />

      <FitnessCard className="!p-3 sm:!p-5">
        <NotificationPreferencesCard />
      </FitnessCard>

      <FitnessCard className="!p-3 sm:!p-5">
        <PreferenceSyncStatusCard />
      </FitnessCard>

      <FitnessCard className="!p-3 sm:!p-5">
        <SectionHeader eyebrow="More tools" title="Quick links" />
        <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
          {toolLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl bg-white/[0.055] p-3 shadow-inner shadow-white/[0.02] transition hover:-translate-y-0.5 hover:border-accent sm:rounded-[1.25rem] sm:p-4"
              >
                <span className="grid size-8 place-items-center rounded-xl bg-accent text-stone-950 sm:size-10 sm:rounded-2xl">
                  <Icon className="size-4" />
                </span>
                <p className="mt-2 font-display text-base font-black sm:mt-3 sm:text-lg">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-muted sm:mt-1 sm:text-sm sm:leading-6">
                  {item.detail}
                </p>
              </Link>
            );
          })}
        </div>
      </FitnessCard>

      <FitnessCard className="!p-3 sm:!p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <span className="grid size-9 place-items-center rounded-xl bg-accent text-stone-950 sm:size-12 sm:rounded-2xl">
              <Download className="size-5" />
            </span>
            <div className="mt-3 sm:mt-5">
              <SectionHeader eyebrow="App install" title="Install LogFit" />
            </div>
            <p className="text-sm leading-6 text-muted">
              Add LogFit to your device for quicker access from your home
              screen or desktop.
            </p>
            <p className="mt-3 text-sm font-black text-accent">
              Install from your browser menu
            </p>
          </div>
          <div className="lg:min-w-[26rem]">
            <InstallAppCard />
          </div>
        </div>
      </FitnessCard>

      <FitnessCard className="!p-3 sm:!p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="grid size-9 place-items-center rounded-xl bg-accent text-stone-950 sm:size-12 sm:rounded-2xl">
              <HandHeart className="size-5" />
            </span>
            <div className="mt-3 sm:mt-5">
              <SectionHeader
                eyebrow="Support"
                title="Support the project"
              />
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted">
              Enjoying LogFit? You can support future improvements.
            </p>
          </div>
          <div className="grid gap-3 sm:min-w-64">
            {supportLinks.yoco ? (
              <a
                href={supportLinks.yoco}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-line bg-white/75 px-4 py-3 text-sm font-black transition hover:-translate-y-0.5 hover:border-accent"
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
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-line bg-white/50 px-4 py-3 text-sm font-black text-muted"
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
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-line bg-white/75 px-4 py-3 text-sm font-black transition hover:-translate-y-0.5 hover:border-accent"
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
        </div>
      </FitnessCard>

      <FitnessCard className="!p-3 sm:!p-5">
        <SectionHeader eyebrow="Account" title="Sign out" />
        <p className="mb-4 text-sm leading-6 text-muted">
          Log out of this browser and return to the public login page.
        </p>
        <LogoutButton className="bg-stone-950 text-white hover:bg-accent" />
      </FitnessCard>
    </div>
  );
}
