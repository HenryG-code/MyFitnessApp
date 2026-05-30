"use client";

import {
  createBrowserSupabaseClient,
  hasSupabaseEnv,
} from "@/src/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

const registerSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required."),
    email: z.string().email("Enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

const inputClassName =
  "mt-2 w-full rounded-2xl border border-line bg-surface/80 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-yellow-400/10";

function formatAuthError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.startsWith("Missing NEXT_PUBLIC_SUPABASE")) {
      return "Sign in is temporarily unavailable. Please try again later.";
    }

    if (/invalid login credentials/i.test(error.message)) {
      return "The email or password is incorrect.";
    }

    if (/email not confirmed/i.test(error.message)) {
      return "Please confirm your email before logging in.";
    }

    if (/user already registered|already exists/i.test(error.message)) {
      return "An account already exists for this email. Try logging in instead.";
    }

    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function createConfiguredSupabaseClient() {
  if (!hasSupabaseEnv) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createBrowserSupabaseClient();
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    setError("");

    try {
      const supabase = createConfiguredSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        throw signInError;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (signInError) {
      setError(formatAuthError(signInError));
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="text-sm font-bold text-foreground" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={inputClassName}
          placeholder="alex@example.com"
          {...register("email")}
        />
        {errors.email ? (
          <p className="mt-2 text-sm font-medium text-red-700">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-bold text-foreground" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className={inputClassName}
          placeholder="Your password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="mt-2 text-sm font-medium text-red-700">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-400/25 bg-red-950/40 p-3 text-sm font-medium text-red-100">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-accent px-5 py-3 text-sm font-black text-stone-950 shadow-lg shadow-yellow-950/25 transition hover:-translate-y-0.5 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-sm text-muted">
        No account yet?{" "}
        <Link className="font-black text-accent" href="/register">
          Register free
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterValues) {
    setError("");
    setSuccess("");

    try {
      const supabase = createConfiguredSupabaseClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setSuccess("Account created. Please confirm your email before logging in.");
    } catch (signUpError) {
      setError(formatAuthError(signUpError));
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="text-sm font-bold text-foreground" htmlFor="fullName">
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          className={inputClassName}
          placeholder="Alex Morgan"
          {...register("fullName")}
        />
        {errors.fullName ? (
          <p className="mt-2 text-sm font-medium text-red-700">
            {errors.fullName.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-bold text-foreground" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={inputClassName}
          placeholder="alex@example.com"
          {...register("email")}
        />
        {errors.email ? (
          <p className="mt-2 text-sm font-medium text-red-700">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-bold text-foreground" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className={inputClassName}
          placeholder="At least 8 characters"
          {...register("password")}
        />
        {errors.password ? (
          <p className="mt-2 text-sm font-medium text-red-700">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <div>
        <label
          className="text-sm font-bold text-foreground"
          htmlFor="confirmPassword"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={inputClassName}
          placeholder="Repeat your password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="mt-2 text-sm font-medium text-red-700">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-400/25 bg-red-950/40 p-3 text-sm font-medium text-red-100">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-2xl border border-accent/25 bg-accent/15 p-3 text-sm font-medium text-soft-yellow">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-accent px-5 py-3 text-sm font-black text-stone-950 shadow-lg shadow-yellow-950/25 transition hover:-translate-y-0.5 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-muted">
        Already registered?{" "}
        <Link className="font-black text-accent" href="/login">
          Log in
        </Link>
      </p>
    </form>
  );
}
