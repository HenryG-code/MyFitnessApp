"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="lf-panel max-w-md p-6 text-center">
        <p className="lf-eyebrow text-accent">Something went wrong</p>
        <p className="mt-3 text-sm font-medium text-muted">
          LogFit hit an unexpected error. Your data is safe — try again, and
          reload the page if it keeps happening.
        </p>
        <button
          type="button"
          onClick={reset}
          className="lf-press mt-5 rounded-xl bg-accent px-4 py-2.5 text-sm font-black text-white transition hover:bg-accent-strong"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
