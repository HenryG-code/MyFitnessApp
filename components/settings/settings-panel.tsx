"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { InstallAppCard } from "@/components/pwa/install-app-card";
import { AvatarUploadCard } from "@/components/settings/avatar-upload-card";
import { GoalWeightForm } from "@/components/settings/goal-weight-form";
import { NotificationPreferencesCard } from "@/components/settings/notification-preferences-card";
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
      detail: "Choose opt-in reminders for workouts, habits, weekly check-ins, and meals.",
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
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-line/80 bg-card/80 p-6 backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-accent">
          Settings
        </p>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tight">
          Your LiftLog account.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Manage your profile, privacy, support options, and quick links from
          one calm account space.
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

      <section className="grid gap-4 lg:grid-cols-3">
        {settings.map((item) => {
          const Icon = item.icon;

          return (
            <FitnessCard key={item.title}>
              <span className="grid size-12 place-items-center rounded-2xl bg-accent text-white">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-5 font-display text-xl font-black">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
            </FitnessCard>
          );
        })}
      </section>

      <FitnessCard>
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

      <FitnessCard>
        <SectionHeader eyebrow="Account details" title="Signed-in profile" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Name
            </p>
            <p className="mt-2 font-display text-xl font-black">
              {profile?.fullName ?? "Signed-in user"}
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Email
            </p>
            <p className="mt-2 break-all font-display text-xl font-black">
              {profile?.email ?? "--"}
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-accent" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
                  Account status
                </p>
                <p className="mt-1 font-display text-xl font-black">
                  Signed in
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Plan
            </p>
            <p className="mt-2 font-display text-xl font-black">
              Free portfolio version
            </p>
          </div>
        </div>
      </FitnessCard>

      <FitnessCard>
        <SectionHeader eyebrow="Privacy" title="Private to your account" />
        <p className="text-sm leading-6 text-muted">
          Your workouts, weight logs, and habits stay connected to your signed-in
          account.
        </p>
      </FitnessCard>

      <FitnessCard>
        <SectionHeader eyebrow="Fitness goals" title="Goal weight" />
        <GoalWeightForm
          initialGoalWeight={profile?.profile?.goal_weight_kg ?? null}
          onSaved={(savedProfile) =>
            setProfile((currentProfile) =>
              currentProfile
                ? { ...currentProfile, profile: savedProfile }
                : currentProfile
            )
          }
        />
      </FitnessCard>

      <FitnessCard>
        <NotificationPreferencesCard />
      </FitnessCard>

      <FitnessCard>
        <SectionHeader eyebrow="More tools" title="Quick links" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {toolLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[1.25rem] border border-line bg-white/65 p-4 transition hover:-translate-y-0.5 hover:border-accent"
              >
                <span className="grid size-10 place-items-center rounded-2xl bg-accent text-white">
                  <Icon className="size-4" />
                </span>
                <p className="mt-3 font-display text-lg font-black">
                  {item.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {item.detail}
                </p>
              </Link>
            );
          })}
        </div>
      </FitnessCard>

      <FitnessCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <span className="grid size-12 place-items-center rounded-2xl bg-accent text-white">
              <Download className="size-5" />
            </span>
            <div className="mt-5">
              <SectionHeader eyebrow="App install" title="Install LiftLog" />
            </div>
            <p className="text-sm leading-6 text-muted">
              Add LiftLog to your device for quicker access from your home
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

      <FitnessCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="grid size-12 place-items-center rounded-2xl bg-accent text-white">
              <HandHeart className="size-5" />
            </span>
            <div className="mt-5">
              <SectionHeader
                eyebrow="Support"
                title="Support the project"
              />
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted">
              Enjoying LiftLog? You can support future improvements.
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

      <FitnessCard>
        <SectionHeader eyebrow="Account" title="Sign out" />
        <p className="mb-4 text-sm leading-6 text-muted">
          Log out of this browser and return to the public login page.
        </p>
        <LogoutButton className="bg-stone-950 text-white hover:bg-accent" />
      </FitnessCard>
    </div>
  );
}
