import Image from "next/image";
import type { ReactNode } from "react";

type HeroPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  imageSrc?: string | null;
  imageAlt?: string;
  variant?: "default" | "performance" | "amber";
};

const variantStyles = {
  default:
    "from-[#050505] via-[#101014] to-[#18181f] after:bg-[radial-gradient(circle_at_80%_20%,rgba(220,38,38,0.28),transparent_18rem)]",
  performance:
    "from-[#050505] via-[#101014] to-[#18181f] after:bg-[radial-gradient(circle_at_78%_20%,rgba(249,115,22,0.28),transparent_18rem)]",
  amber:
    "from-[#050505] via-[#1f1111] to-[#101014] after:bg-[radial-gradient(circle_at_80%_20%,rgba(255,77,0,0.24),transparent_18rem)]",
};

export function HeroPanel({
  eyebrow,
  title,
  description,
  children,
  imageSrc,
  imageAlt = "",
  variant = "default",
}: HeroPanelProps) {
  return (
    <section
      className={`liftlog-hero-motion relative overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.45)] after:absolute after:inset-0 after:pointer-events-none sm:p-8 ${variantStyles[variant]}`}
    >
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(120deg,rgba(255,255,255,0.08)_0_1px,transparent_1px_14px)]" />
      {imageSrc ? (
        <div className="absolute inset-y-0 right-0 hidden w-[46%] lg:block">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="46vw"
            className="object-cover opacity-55 saturate-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-stone-950/30" />
        </div>
      ) : null}
      <div className="relative z-10 max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-sun">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
          {description}
        </p>
        {children}
      </div>
    </section>
  );
}
