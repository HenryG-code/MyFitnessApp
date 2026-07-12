type PreferenceErrorLike = {
  code?: unknown;
  message?: unknown;
};

function getErrorDetails(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return { code: "", message: "" };
  }

  const candidate = error as PreferenceErrorLike;
  return {
    code: typeof candidate.code === "string" ? candidate.code : "",
    message:
      typeof candidate.message === "string"
        ? candidate.message.toLowerCase()
        : "",
  };
}

export function getPreferenceSaveError(error: unknown) {
  const { code, message } = getErrorDetails(error);

  if (
    code === "42703" ||
    message.includes("column") ||
    message.includes("schema cache")
  ) {
    return "Account storage needs the latest database update. Refresh the app after applying the Supabase schema.";
  }

  if (
    code === "42501" ||
    message.includes("row-level security") ||
    message.includes("permission denied")
  ) {
    return "Your account does not have permission to save this preference.";
  }

  if (
    message.includes("jwt") ||
    message.includes("session") ||
    message.includes("not authenticated")
  ) {
    return "Your session has expired. Sign in again, then retry.";
  }

  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("timeout")
  ) {
    return "Could not reach account storage. Check your connection and retry.";
  }

  return "Could not sync preferences. Please retry.";
}
