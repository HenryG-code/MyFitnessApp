export function CommandSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading your day">
      <div className="h-6 w-44 animate-pulse rounded-lg bg-white/[0.06]" />
      <div className="h-40 animate-pulse rounded-[1.25rem] bg-white/[0.05]" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-[0.875rem] bg-white/[0.045]"
          />
        ))}
      </div>
      <div className="h-44 animate-pulse rounded-[1.25rem] bg-white/[0.05]" />
    </div>
  );
}
