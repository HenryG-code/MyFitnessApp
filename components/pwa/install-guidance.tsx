"use client";

import { MonitorDown, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

function isStandaloneDisplay() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

export function InstallGuidance() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(isStandaloneDisplay());
  }, []);

  if (isInstalled) {
    return (
      <p className="rounded-2xl border border-accent/30 bg-accent/15 p-4 text-sm font-black text-teal-100">
        LiftLog is installed.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-line bg-white/65 p-4">
        <MonitorDown className="size-5 text-accent" />
        <p className="mt-3 font-black">Desktop</p>
        <p className="mt-1 text-sm leading-6 text-muted">
          Use your browser menu and choose Install app.
        </p>
      </div>
      <div className="rounded-2xl border border-line bg-white/65 p-4">
        <Smartphone className="size-5 text-accent" />
        <p className="mt-3 font-black">Mobile</p>
        <p className="mt-1 text-sm leading-6 text-muted">
          Use Add to Home Screen or Install app where your browser supports it.
        </p>
      </div>
    </div>
  );
}
