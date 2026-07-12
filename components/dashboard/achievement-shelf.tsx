import type {
  Achievement,
  AchievementIcon,
} from "@/src/lib/performance/achievements";
import { Award, Footprints, Medal, Sparkles, Trophy } from "lucide-react";

const achievementIcons: Record<AchievementIcon, typeof Award> = {
  steps: Footprints,
  habits: Sparkles,
  workouts: Trophy,
  streak: Medal,
};

export function AchievementShelf({
  achievements,
}: {
  achievements: Achievement[];
}) {
  const unlocked = achievements.filter((achievement) => achievement.unlocked);

  return (
    <section className="lf-rise lf-panel min-w-0 overflow-hidden p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="lf-eyebrow">Achievements</p>
          <h2 className="mt-1 font-display text-lg font-black tracking-tight">
            Your wins
          </h2>
        </div>
        <span className="lf-num shrink-0 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-black text-accent-strong">
          {unlocked.length}/{achievements.length} earned
        </span>
      </div>

      <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 lg:grid-cols-4">
        {achievements.map((achievement) => {
          const Icon = achievementIcons[achievement.icon];

          return (
            <article
              key={achievement.id}
              className={`min-w-0 rounded-xl border p-2.5 sm:p-3 ${
                achievement.unlocked
                  ? "border-accent/30 bg-accent/10"
                  : "border-line bg-white/[0.025]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-lg ${
                    achievement.unlocked
                      ? "bg-accent text-white"
                      : "bg-white/[0.05] text-ink-dim"
                  }`}
                >
                  <Icon className="size-4" />
                </span>
                <span className="text-[0.55rem] font-black uppercase tracking-wider text-ink-dim">
                  {achievement.unlocked ? "Earned" : achievement.progressLabel}
                </span>
              </div>
              <h3 className="mt-2 truncate text-sm font-black">
                {achievement.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-[0.68rem] leading-4 text-muted">
                {achievement.description}
              </p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className={`h-full rounded-full ${
                    achievement.unlocked ? "bg-accent" : "bg-white/25"
                  }`}
                  style={{ width: `${achievement.progress}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
