import { z } from "zod";

// NEXT_PUBLIC_* vars must be referenced literally so Next.js can inline them
// into the client bundle — never read them dynamically by key.
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const clientEnvResult = clientEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export const hasSupabaseEnv = clientEnvResult.success;

export function getClientEnv() {
  if (!clientEnvResult.success) {
    const missing = clientEnvResult.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    throw new Error(
      `Invalid or missing environment variables: ${missing}. Add them to .env.local for local development and to Vercel project settings for deployment.`
    );
  }

  return clientEnvResult.data;
}

const notificationEnvSchema = z.object({
  supabaseUrl: z.url(),
  serviceRoleKey: z.string().min(1),
  publicKey: z.string().min(1),
  privateKey: z.string().min(1),
  cronSecret: z.string().min(1),
  contact: z.string().min(1),
});

export type NotificationEnvironment = z.infer<typeof notificationEnvSchema>;

// Server-only: reads the service role key. Returns null when background
// notifications are not configured so the cron route can respond 503.
export function getNotificationEnvironment(): NotificationEnvironment | null {
  const result = notificationEnvSchema.safeParse({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    publicKey: process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
    privateKey: process.env.WEB_PUSH_PRIVATE_KEY,
    cronSecret: process.env.CRON_SECRET,
    contact: process.env.WEB_PUSH_CONTACT ?? "mailto:support@example.com",
  });

  return result.success ? result.data : null;
}
