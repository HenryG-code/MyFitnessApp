import { FitnessCard, SectionHeader } from "@/components/ui/fitness-card";
import { profile } from "@/lib/mock-data";
import { Bell, Lock, UserRound } from "lucide-react";

const settings = [
  {
    title: "Profile",
    detail: `${profile.name} - ${profile.email}`,
    icon: UserRound,
  },
  {
    title: "Notifications",
    detail: "Mock reminders for workouts and weekly check-ins.",
    icon: Bell,
  },
  {
    title: "Privacy",
    detail: "Free Supabase auth will protect user data later.",
    icon: Lock,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-line/80 bg-card/80 p-6 backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-accent">
          Settings
        </p>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tight">
          Personalize the app shell.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Static settings for now. No paid services, tracking pixels, uploads, or
          billing features hiding in the walls.
        </p>
      </section>

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
        <SectionHeader eyebrow="Plan" title={profile.plan} />
        <p className="text-sm leading-6 text-muted">
          Built for Vercel Hobby and Supabase Free. The product boundary is clear:
          free portfolio app, no payments, no AI APIs, no paid analytics.
        </p>
      </FitnessCard>
    </div>
  );
}
