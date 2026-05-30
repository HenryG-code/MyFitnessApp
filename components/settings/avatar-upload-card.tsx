"use client";

import {
  removeProfileAvatar,
  uploadProfileAvatar,
  validateAvatarFile,
} from "@/src/lib/profile/avatar";
import type { Profile } from "@/src/lib/supabase/database.types";
import { Camera, Trash2, Upload, UserRound } from "lucide-react";
import { useRef, useState } from "react";

type AvatarUploadCardProps = {
  fullName: string;
  email: string | null;
  avatarUrl: string | null;
  onSaved: (profile: Profile) => void;
};

function getInitials(name: string, email: string | null) {
  const source = name.trim() || email?.trim() || "LiftLog User";
  const words = source.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function AvatarUploadCard({
  fullName,
  email,
  avatarUrl,
  onSaved,
}: AvatarUploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleFileChange(file: File | null) {
    if (!file) {
      return;
    }

    setError("");
    setMessage("");

    try {
      validateAvatarFile(file);
      setIsSaving(true);
      const savedProfile = await uploadProfileAvatar(file);
      onSaved(savedProfile);
      window.dispatchEvent(
        new CustomEvent("liftlog-avatar-updated", {
          detail: { avatarUrl: savedProfile.avatar_url },
        })
      );
      setMessage("Avatar updated.");
    } catch (uploadError: unknown) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload avatar."
      );
    } finally {
      setIsSaving(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function handleRemoveAvatar() {
    setError("");
    setMessage("");
    setIsSaving(true);

    try {
      const savedProfile = await removeProfileAvatar();
      onSaved(savedProfile);
      window.dispatchEvent(
        new CustomEvent("liftlog-avatar-updated", {
          detail: { avatarUrl: savedProfile.avatar_url },
        })
      );
      setMessage("Avatar removed.");
    } catch (removeError: unknown) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Could not remove avatar."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-4">
        <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-[1.75rem] border border-accent/30 bg-accent/10 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={`${fullName} avatar`}
              className="size-full object-cover"
            />
          ) : (
            <span className="font-display text-3xl font-black text-accent">
              {getInitials(fullName, email)}
            </span>
          )}
          <span className="absolute bottom-2 right-2 grid size-8 place-items-center rounded-xl bg-accent text-stone-950">
            <Camera className="size-4" />
          </span>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
            Profile photo
          </p>
          <h2 className="mt-2 font-display text-2xl font-black">
            {fullName || "Signed-in user"}
          </h2>
          <p className="mt-1 break-all text-sm leading-6 text-muted">
            Upload a square image for the cleanest fit. JPEG, PNG, or WebP up to
            2MB.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:min-w-64">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isSaving}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-black text-stone-950 transition hover:-translate-y-0.5 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload className="size-4" />
          {isSaving ? "Saving..." : "Upload avatar"}
        </button>
        {avatarUrl ? (
          <button
            type="button"
            onClick={handleRemoveAvatar}
            disabled={isSaving}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-line bg-white/65 px-5 py-3 text-sm font-black text-muted transition hover:-translate-y-0.5 hover:border-red-400 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="size-4" />
            Remove avatar
          </button>
        ) : null}
      </div>

      {message ? (
        <p className="rounded-2xl border border-accent/25 bg-accent/10 p-3 text-sm font-black text-soft-yellow lg:max-w-xs">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-black text-red-700 lg:max-w-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
