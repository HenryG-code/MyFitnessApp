import { WeightTrendChart } from "@/components/charts/weight-trend-chart";
import { FitnessCard, SectionHeader } from "@/components/ui/fitness-card";
import { weightEntries } from "@/lib/mock-data";
import { Scale } from "lucide-react";

export default function WeightPage() {
  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-line/80 bg-card/80 p-6 backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-accent">
          Weight
        </p>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tight">
          Watch the trend, not the noise.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          A calm weight page with mock check-ins and a Recharts trend line.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <FitnessCard>
          <SectionHeader eyebrow="Trend" title="May check-ins" />
          <WeightTrendChart data={weightEntries} />
        </FitnessCard>

        <FitnessCard>
          <SectionHeader eyebrow="Goal" title="Current path" />
          <div className="flex items-center gap-4 rounded-[1.5rem] bg-[#eaf3dd] p-5">
            <span className="grid size-14 place-items-center rounded-2xl bg-accent text-white">
              <Scale className="size-6" />
            </span>
            <div>
              <p className="text-3xl font-black tracking-tight">74.0 kg</p>
              <p className="text-sm font-medium text-muted">Goal weight</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            The mock trend shows a steady decrease without crash-diet theatre.
            Tiny boring wins, suspiciously effective.
          </p>
        </FitnessCard>
      </section>

      <FitnessCard>
        <SectionHeader eyebrow="History" title="Recent entries" />
        <div className="divide-y divide-line">
          {weightEntries
            .slice()
            .reverse()
            .map((entry) => (
              <div
                key={entry.date}
                className="flex items-center justify-between gap-4 py-4"
              >
                <p className="font-bold">{entry.date}</p>
                <p className="font-display text-xl font-black">
                  {entry.weight.toFixed(1)} kg
                </p>
              </div>
            ))}
        </div>
      </FitnessCard>
    </div>
  );
}
