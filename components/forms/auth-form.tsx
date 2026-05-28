"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(6, "Use at least 6 characters."),
});

type AuthValues = z.infer<typeof authSchema>;

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [message, setMessage] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: AuthValues) {
    setMessage(
      `${mode === "login" ? "Login" : "Registration"} mock submitted for ${
        values.email
      }. Supabase auth will connect here later.`
    );
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
          className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-700/10"
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
          className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-700/10"
          placeholder="password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="mt-2 text-sm font-medium text-red-700">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-stone-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-stone-950/10 transition hover:-translate-y-0.5 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
      >
        {mode === "login" ? "Log in" : "Create free account"}
      </button>

      {message ? (
        <p className="rounded-2xl bg-[#eaf3dd] p-3 text-sm font-medium text-accent-strong">
          {message}
        </p>
      ) : null}

      <p className="text-center text-sm text-muted">
        {mode === "login" ? "No account yet?" : "Already registered?"}{" "}
        <Link
          className="font-black text-accent"
          href={mode === "login" ? "/register" : "/login"}
        >
          {mode === "login" ? "Register free" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
