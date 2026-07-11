"use client";

import {
  Check,
  Copy,
  Mail,
  MessageCircle,
  Send,
  Share2,
  Smartphone,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const shareText =
  "I use LogFit to plan workouts, track progress, and stay consistent. Try it with me:";

export function ShareAppCard() {
  const [shareUrl, setShareUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setShareUrl(window.location.origin);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const links = useMemo(() => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    const combined = encodeURIComponent(`${shareText} ${shareUrl}`);

    return [
      {
        label: "WhatsApp",
        href: `https://wa.me/?text=${combined}`,
        icon: MessageCircle,
      },
      {
        label: "Telegram",
        href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
        icon: Send,
      },
      {
        label: "SMS",
        href: `sms:?body=${combined}`,
        icon: Smartphone,
      },
      {
        label: "Email",
        href: `mailto:?subject=${encodeURIComponent("Train with me on LogFit")}&body=${combined}`,
        icon: Mail,
      },
    ];
  }, [shareUrl]);

  async function handleNativeShare() {
    if (!shareUrl) {
      return;
    }

    if (!("share" in navigator)) {
      setMessage("Use one of the sharing options below or copy the link.");
      return;
    }

    try {
      await navigator.share({
        title: "LogFit",
        text: shareText,
        url: shareUrl,
      });
      setMessage("Thanks for sharing LogFit.");
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") {
        return;
      }

      setMessage("Sharing did not open. Try a direct option below.");
    }
  }

  async function handleCopy() {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setMessage("Invite link copied.");
    } catch {
      setMessage("Could not copy automatically. Select a messaging option instead.");
    }
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-white sm:size-12 sm:rounded-2xl">
          <Share2 className="size-5" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
            Invite friends
          </p>
          <h2 className="mt-1 font-display text-xl font-black sm:text-2xl">
            Share LogFit
          </h2>
          <p className="mt-1.5 text-xs leading-5 text-muted sm:text-sm sm:leading-6">
            Send a simple invite through your phone&apos;s share sheet or choose
            a messaging service directly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => void handleNativeShare()}
          disabled={!shareUrl}
          className="lf-press col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-black text-white transition hover:bg-accent-strong disabled:opacity-50 sm:col-span-1"
        >
          <Share2 className="size-4" />
          Share
        </button>
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.label}
              href={shareUrl ? item.href : undefined}
              target={item.label === "SMS" || item.label === "Email" ? undefined : "_blank"}
              rel="noreferrer"
              aria-disabled={!shareUrl}
              className="lf-press inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white/[0.04] px-3 py-3 text-xs font-black text-muted transition hover:border-accent/40 hover:text-foreground sm:text-sm"
            >
              <Icon className="size-4" />
              {item.label}
            </a>
          );
        })}
        <button
          type="button"
          onClick={() => void handleCopy()}
          disabled={!shareUrl}
          className="lf-press inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white/[0.04] px-3 py-3 text-xs font-black text-muted transition hover:border-accent/40 hover:text-foreground disabled:opacity-50 sm:text-sm"
        >
          <Copy className="size-4" />
          Copy link
        </button>
      </div>

      {message ? (
        <p
          className="flex items-center gap-2 rounded-xl border border-ready/20 bg-ready/[0.07] p-3 text-xs font-bold text-ready"
          aria-live="polite"
        >
          <Check className="size-4 shrink-0" />
          {message}
        </p>
      ) : null}
    </div>
  );
}
