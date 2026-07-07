import type { ReactNode } from "react";

type FitnessCardProps = {
  children: ReactNode;
  className?: string;
};

export function FitnessCard({ children, className = "" }: FitnessCardProps) {
  return (
    <section
      className={`liftlog-card-motion rounded-[1.25rem] border border-transparent bg-gradient-to-br from-card/95 via-card/85 to-surface/80 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.04] backdrop-blur transition duration-200 sm:rounded-[1.5rem] sm:p-5 ${className}`}
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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-muted sm:text-xs">
            {label}
          </p>
          <p
            key={value}
            className="liftlog-number-change lf-num mt-1.5 font-display text-2xl font-black tracking-tight text-foreground sm:mt-2 sm:text-3xl"
          >
            {value}
          </p>
        </div>
        <div
          className={`rounded-xl p-2.5 shadow-lg shadow-black/35 ${toneStyles[tone]}`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted sm:text-sm">{detail}</p>
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
    <div className="mb-3 flex items-start justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-accent sm:text-xs">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-0.5 font-display text-lg font-black tracking-tight text-foreground sm:text-xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
