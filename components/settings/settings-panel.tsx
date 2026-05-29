"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { FitnessCard, SectionHeader } from "@/components/ui/fitness-card";
import {
  fetchAuthenticatedProfile,
  type AuthProfile,
} from "@/src/lib/profile/queries";
import {
  Bell,
  ExternalLink,
  Fingerprint,
  HandHeart,
  Lock,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

function getProfileDetail(profile: AuthProfile | null) {
  if (!profile) {
    return "Loading your protected account details.";
  }

  return `${profile.fullName} - ${profile.email ?? "No email available"}`;
}

function getShortUserId(userId: string) {
  return `${userId.slice(0, 8)}...${userId.slice(-6)}`;
}

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
      detail: "Coming soon: local reminders for workouts and weekly check-ins.",
      icon: Bell,
    },
    {
      title: "Privacy",
      detail: "Supabase Auth and Row Level Security keep your fitness data scoped to your account.",
      icon: Lock,
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
          This protected space uses Supabase Auth, private user-scoped data, and
          a free-tier friendly portfolio setup. No billing, trackers, uploads, or
          paid services tucked behind the curtain.
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
        {profile?.userId ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-2 text-xs font-bold text-muted">
            <Fingerprint className="size-4" />
            User ID: {getShortUserId(profile.userId)}
          </div>
        ) : null}
      </FitnessCard>

      <FitnessCard>
        <SectionHeader eyebrow="Privacy" title="Free and user-scoped" />
        <p className="text-sm leading-6 text-muted">
          LiftLog is built for Vercel Hobby and Supabase Free. Your logs are
          attached to your authenticated user and protected by Supabase RLS
          policies.
        </p>
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
            <a
              href="https://example.com/yoco-support"
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
            <a
              href="https://www.paypal.com/paypalme/example"
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
