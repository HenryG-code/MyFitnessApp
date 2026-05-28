import { FitnessCard, SectionHeader } from "@/components/ui/fitness-card";
import { habits } from "@/lib/mock-data";

export default function HabitsPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-line/80 bg-card/80 p-6 backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-accent">
          Habits
        </p>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tight">
          Build the boring magic.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Daily habit cards use mock completion percentages and streaks.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {habits.map((habit) => {
          const Icon = habit.icon;

          return (
            <FitnessCard key={habit.name}>
              <SectionHeader eyebrow={habit.target} title={habit.name} />
              <div className="flex items-center justify-between gap-4">
                <span className="grid size-14 place-items-center rounded-2xl bg-stone-950 text-sun">
                  <Icon className="size-6" />
                </span>
                <div className="text-right">
                  <p className="font-display text-3xl font-black">
                    {habit.completion}%
                  </p>
                  <p className="text-sm font-medium text-muted">
                    {habit.streak} day streak
                  </p>
                </div>
              </div>
              <div className="mt-5 h-3 rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${habit.completion}%` }}
                />
              </div>
            </FitnessCard>
          );
        })}
      </section>
    </div>
  );
}
