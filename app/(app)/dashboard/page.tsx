import { WeeklyProgressChart } from "@/components/charts/weekly-progress-chart";
import {
  FitnessCard,
  MetricCard,
  SectionHeader,
} from "@/components/ui/fitness-card";
import {
  dashboardStats,
  habits,
  highlights,
  weeklyProgress,
} from "@/lib/mock-data";
import { Activity, Dumbbell, Scale, Sprout, Target } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2rem] border border-line/80 bg-stone-950 p-6 text-white shadow-[0_24px_80px_rgba(23,33,28,0.18)] sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-sun">
            Portfolio fitness tracker
          </p>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-6xl">
            Track the quiet wins that build the big ones.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
            Workouts, weight, and habits in one free app shell. This version uses
            mock data only while the Supabase layer waits backstage.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Current weight"
          value={dashboardStats.currentWeight}
          detail="Down 1.7 kg from the first May check-in."
          icon={<Scale className="size-5" />}
          tone="teal"
        />
        <MetricCard
          label="Goal weight"
          value={dashboardStats.goalWeight}
          detail="4.4 kg to go with steady weekly pacing."
          icon={<Target className="size-5" />}
          tone="amber"
        />
        <MetricCard
          label="Weekly workouts"
          value={`${dashboardStats.weeklyWorkouts}`}
          detail="Target is 5 sessions, including one mobility day."
          icon={<Dumbbell className="size-5" />}
          tone="ink"
        />
        <MetricCard
          label="Habit completion"
          value={dashboardStats.habitCompletion}
          detail="Hydration is carrying the scoreboard this week."
          icon={<Sprout className="size-5" />}
          tone="teal"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.9fr]">
        <FitnessCard>
          <SectionHeader eyebrow="Weekly progress" title="Workouts and habits" />
          <WeeklyProgressChart data={weeklyProgress} />
        </FitnessCard>

        <FitnessCard>
          <SectionHeader eyebrow="Latest workout" title="Fresh from the log" />
          <div className="rounded-[1.5rem] bg-[#eaf3dd] p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-accent text-white">
                <Activity className="size-5" />
              </span>
              <div>
                <p className="font-display text-xl font-black">
                  {dashboardStats.latestWorkout.title}
                </p>
                <p className="text-sm font-medium text-muted">
                  {dashboardStats.latestWorkout.date} -{" "}
                  {dashboardStats.latestWorkout.duration}
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-muted">
              Effort felt {dashboardStats.latestWorkout.effort.toLowerCase()}.
              Keep the next session simple: show up, move well, leave one rep in
              reserve.
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {habits.slice(0, 2).map((habit) => {
              const Icon = habit.icon;

              return (
                <div
                  key={habit.name}
                  className="rounded-[1.25rem] border border-line bg-white/65 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-5 text-accent" />
                    <p className="font-black">{habit.name}</p>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${habit.completion}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </FitnessCard>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon;

          return (
            <FitnessCard key={item.label} className="p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-stone-950 text-sun">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
                    {item.label}
                  </p>
                  <p className="mt-1 font-display text-lg font-black">
                    {item.value}
                  </p>
                </div>
              </div>
            </FitnessCard>
          );
        })}
      </section>
    </div>
  );
}
