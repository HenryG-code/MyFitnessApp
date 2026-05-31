"use client";

import { CheckCircle2, MonitorDown, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

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

function isLikelyIosSafari() {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(userAgent);
  const isSafari = /safari/i.test(userAgent) && !/crios|fxios|edgios/i.test(userAgent);

  return isIos && isSafari;
}

export function InstallAppCard() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIosSafari, setIsIosSafari] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setIsInstalled(isStandaloneDisplay());
    setIsIosSafari(isLikelyIosSafari());

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setStatus("LiftLog is ready to install on this device.");
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setStatus("LiftLog is installed.");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) {
      setStatus(
        isIosSafari
          ? "On iPhone, open Safari, tap Share, then Add to Home Screen."
          : "Use your browser menu and choose Install app or Add to Home Screen."
      );
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (choice?.outcome === "accepted") {
      setStatus("Install started. Follow your browser prompts to finish.");
    } else {
      setStatus("Install dismissed. You can try again from your browser menu.");
    }
  }

  if (isInstalled) {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent/15 p-4 text-sm font-black text-soft-yellow">
        <span className="inline-flex items-center gap-2">
          <CheckCircle2 className="size-5" />
          LiftLog is installed.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => void handleInstallClick()}
        className="w-full rounded-2xl bg-accent px-5 py-3 text-sm font-black text-stone-950 shadow-lg shadow-accent/20 transition hover:-translate-y-0.5 hover:bg-accent-strong"
      >
        Install app
      </button>

      {status ? (
        <p className="rounded-2xl border border-line bg-white/65 p-3 text-sm font-bold text-muted">
          {status}
        </p>
      ) : null}

      <div className="grid gap-3">
        <div className="rounded-2xl border border-line bg-white/65 p-4">
          <Smartphone className="size-5 text-accent" />
          <p className="mt-3 font-black">Android</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Open Chrome menu and choose Install app or Add to Home Screen.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white/65 p-4">
          <Smartphone className="size-5 text-accent" />
          <p className="mt-3 font-black">iPhone</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Open Safari, tap Share, then Add to Home Screen.
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white/65 p-4">
          <MonitorDown className="size-5 text-accent" />
          <p className="mt-3 font-black">Desktop</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Use the browser address bar install icon or browser menu.
          </p>
        </div>
      </div>
    </div>
  );
}
