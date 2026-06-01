import type { ReactNode } from "react";

type FitnessCardProps = {
  children: ReactNode;
  className?: string;
};

export function FitnessCard({ children, className = "" }: FitnessCardProps) {
  return (
    <section
      className={`liftlog-enter liftlog-card-motion rounded-[1.75rem] border border-transparent bg-gradient-to-br from-card/95 via-card/85 to-surface/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.04] backdrop-blur transition duration-200 ${className}`}
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
  tone?: "yellow" | "amber" | "ink";
};

const toneStyles = {
  yellow: "bg-accent text-stone-950",
  amber: "bg-sun text-white",
  ink: "bg-surface text-sun border border-line",
};

export function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = "yellow",
}: MetricCardProps) {
  return (
    <FitnessCard className="bg-gradient-to-br from-card/95 via-surface/85 to-white/[0.035] hover:shadow-[0_28px_80px_rgba(0,0,0,0.46)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
            {label}
          </p>
          <p className="mt-3 font-display text-3xl font-black tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div className={`rounded-2xl p-3 shadow-lg shadow-black/35 ${toneStyles[tone]}`}>
          {icon}
        </div>
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
