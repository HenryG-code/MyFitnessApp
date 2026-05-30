import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";
import type { Profile, ProfileUpdate } from "@/src/lib/supabase/database.types";

export const avatarBucketName = "avatars";
export const avatarMaxFileSize = 2 * 1024 * 1024;

const acceptedAvatarTypes = ["image/jpeg", "image/png", "image/webp"] as const;

type AcceptedAvatarType = (typeof acceptedAvatarTypes)[number];

function readMetadataFullName(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getAvatarExtension(type: AcceptedAvatarType) {
  if (type === "image/png") {
    return "png";
  }

  if (type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function isAcceptedAvatarType(type: string): type is AcceptedAvatarType {
  return acceptedAvatarTypes.includes(type as AcceptedAvatarType);
}

function getStorageSetupMessage(errorMessage: string) {
  const normalizedMessage = errorMessage.toLowerCase();

  if (
    normalizedMessage.includes("bucket") ||
    normalizedMessage.includes("policy") ||
    normalizedMessage.includes("row-level security") ||
    normalizedMessage.includes("permission")
  ) {
    return "Avatar uploads are not ready yet. Create the public avatars bucket and storage policies in Supabase.";
  }

  return errorMessage;
}

export function validateAvatarFile(file: File): AcceptedAvatarType {
  if (!isAcceptedAvatarType(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }

  if (file.size > avatarMaxFileSize) {
    throw new Error("Avatar image must be 2MB or smaller.");
  }

  return file.type;
}

export async function getAuthenticatedAvatarUser() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("You must be logged in to update your avatar.");
  }

  return user;
}

export async function uploadProfileAvatar(file: File) {
  const fileType = validateAvatarFile(file);

  const supabase = createBrowserSupabaseClient();
  const user = await getAuthenticatedAvatarUser();
  const extension = getAvatarExtension(fileType);
  const avatarPath = `${user.id}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(avatarBucketName)
    .upload(avatarPath, file, {
      cacheControl: "3600",
      contentType: fileType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(getStorageSetupMessage(uploadError.message));
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(avatarBucketName).getPublicUrl(avatarPath);

  const avatarUrl = `${publicUrl}?v=${Date.now()}`;
  const payload: ProfileUpdate = {
    avatar_url: avatarUrl,
    email: user.email ?? null,
    full_name: readMetadataFullName(user.user_metadata.full_name),
  };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...payload })
    .select("*")
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  return profile satisfies Profile;
}

export async function removeProfileAvatar() {
  const supabase = createBrowserSupabaseClient();
  const user = await getAuthenticatedAvatarUser();

  await supabase.storage.from(avatarBucketName).remove([
    `${user.id}/avatar.jpg`,
    `${user.id}/avatar.jpeg`,
    `${user.id}/avatar.png`,
    `${user.id}/avatar.webp`,
  ]);

  const payload: ProfileUpdate = {
    avatar_url: null,
    email: user.email ?? null,
    full_name: readMetadataFullName(user.user_metadata.full_name),
  };

  const { data: profile, error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...payload })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return profile satisfies Profile;
}
