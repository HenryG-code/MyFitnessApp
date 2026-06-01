"use client";

import { Pause, Play, RotateCcw, Timer, TimerReset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const presets = [30, 60, 90, 120];

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function maybeNotifyTimerDone() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    new Notification("Rest complete", {
      body: "Time for the next set.",
    });
  }
}

export function RestTimer() {
  const [duration, setDuration] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("");

  const progress = useMemo(() => {
    if (!duration) {
      return 0;
    }

    return Math.max(0, Math.min(100, (remaining / duration) * 100));
  }, [duration, remaining]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          setIsRunning(false);
          setMessage("Rest complete. Time for the next set.");
          maybeNotifyTimerDone();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  function selectPreset(seconds: number) {
    setDuration(seconds);
    setRemaining(seconds);
    setIsRunning(false);
    setMessage("");
  }

  function resetTimer() {
    setRemaining(duration);
    setIsRunning(false);
    setMessage("");
  }

  function addTime(seconds: number) {
    setRemaining((current) => {
      const nextRemaining = current + seconds;
      setDuration((currentDuration) =>
        Math.max(currentDuration, nextRemaining)
      );
      return nextRemaining;
    });
    setMessage("");
  }

  return (
    <section
      className={`rounded-[1.5rem] border border-accent/25 bg-gradient-to-br from-accent/10 via-white/[0.04] to-sun/10 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.25)] transition ${
        message ? "liftlog-complete-pulse" : isRunning ? "liftlog-timer-running" : ""
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-accent text-stone-950">
              <Timer className="size-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
                Workout tools
              </p>
              <h2 className="font-display text-2xl font-black">Rest timer</h2>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            Use this between sets to keep your workout moving.
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p
            key={remaining}
            className="liftlog-number-change font-display text-5xl font-black tracking-tight text-foreground"
          >
            {formatTime(remaining)}
          </p>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-muted">
            {isRunning ? "Resting" : "Ready"}
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="liftlog-progress-bar h-full rounded-full bg-gradient-to-r from-accent via-sun to-energy transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {presets.map((seconds) => (
          <button
            key={seconds}
            type="button"
            onClick={() => selectPreset(seconds)}
            className={`rounded-full border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5 ${
              duration === seconds
                ? "border-accent bg-accent text-stone-950"
                : "border-line bg-white/65 text-muted hover:border-accent hover:text-foreground"
            }`}
          >
            {seconds}s
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => {
            setIsRunning((current) => !current);
            setMessage("");
          }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-2 text-sm font-black text-stone-950 transition hover:-translate-y-0.5"
        >
          {isRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={resetTimer}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-line bg-white/65 px-4 py-2 text-sm font-black transition hover:border-accent"
        >
          <RotateCcw className="size-4" />
          Reset
        </button>
        <button
          type="button"
          onClick={() => addTime(15)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-line bg-white/65 px-4 py-2 text-sm font-black transition hover:border-accent"
        >
          <TimerReset className="size-4" />
          +15 sec
        </button>
        <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-line bg-white/65 px-3 py-2 text-sm font-black">
          Custom
          <input
            type="number"
            min="10"
            max="600"
            step="5"
            value={duration}
            onChange={(event) => {
              const nextDuration = Number(event.target.value);

              if (Number.isFinite(nextDuration) && nextDuration > 0) {
                selectPreset(nextDuration);
              }
            }}
            className="min-w-0 flex-1 bg-transparent text-right outline-none"
            aria-label="Custom rest seconds"
          />
        </label>
      </div>

      {message ? (
        <p className="liftlog-pop-in mt-4 rounded-2xl border border-accent/30 bg-accent/10 p-3 text-sm font-black text-soft-yellow">
          {message}
        </p>
      ) : null}
    </section>
  );
}
