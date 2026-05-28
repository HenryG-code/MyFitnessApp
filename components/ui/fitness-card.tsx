import type { ReactNode } from "react";

type FitnessCardProps = {
  children: ReactNode;
  className?: string;
};

export function FitnessCard({ children, className = "" }: FitnessCardProps) {
  return (
    <section
      className={`rounded-[1.75rem] border border-line/80 bg-card/85 p-5 shadow-[0_20px_60px_rgba(23,33,28,0.08)] backdrop-blur ${className}`}
    >
      {children}
    </section>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: "teal" | "amber" | "ink";
};

const toneStyles = {
  teal: "bg-accent text-white",
  amber: "bg-sun text-stone-950",
  ink: "bg-stone-900 text-white",
};

export function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = "teal",
}: MetricCardProps) {
  return (
    <FitnessCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-3 font-display text-3xl font-black tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div className={`rounded-2xl p-3 ${toneStyles[tone]}`}>{icon}</div>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">{detail}</p>
    </FitnessCard>
  );
}

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
};

export function SectionHeader({ eyebrow, title, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-xs font-black uppercase tracking-[0.24em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 font-display text-xl font-black tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
