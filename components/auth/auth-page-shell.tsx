import { fitnessImages } from "@/src/lib/visuals/fitness-images";
import { BarChart3, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  imageEyebrow: string;
  imageTitle: string;
  children: ReactNode;
};

export function AuthPageShell({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  imageEyebrow,
  imageTitle,
  children,
}: AuthPageShellProps) {
  return (
    <main className="min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[2.4rem] border border-white/10 bg-card/80 shadow-[0_34px_120px_rgba(0,0,0,0.36)] backdrop-blur xl:grid-cols-[0.92fr_1.08fr]">
        <section className="flex items-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <Link href="/dashboard" className="inline-flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-accent text-stone-950 shadow-lg shadow-accent/30">
                <BarChart3 className="size-5" />
              </span>
              <span>
                <span className="block font-display text-xl font-black">
                  LiftLog
                </span>
                <span className="text-sm font-medium text-muted">
                  Private fitness dashboard
                </span>
              </span>
            </Link>

            <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.20)] sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-accent">
                Account
              </p>
              <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted">{subtitle}</p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black text-muted">
                <ShieldCheck className="size-4 text-accent" />
                Your fitness data stays private to your account.
              </div>

              {children}
            </div>
          </div>
        </section>

        <section className="relative hidden min-h-full overflow-hidden xl:block">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="54vw"
            className="object-cover saturate-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/45" />
          <div className="absolute inset-x-8 bottom-8 rounded-[2rem] border border-white/15 bg-black/35 p-6 text-white shadow-2xl backdrop-blur-md">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-sun">
              <Sparkles className="size-4" />
              {imageEyebrow}
            </span>
            <h2 className="mt-4 max-w-xl font-display text-4xl font-black tracking-tight">
              {imageTitle}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-stone-300">
              Track the work, spot the patterns, and keep momentum visible.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export const authImages = {
  login: fitnessImages.strengthTraining ?? "/images/fitness/treadmill-runner.jpg",
  register:
    fitnessImages.fitnessCommunity ?? "/images/fitness/squat-coaching.jpg",
};
