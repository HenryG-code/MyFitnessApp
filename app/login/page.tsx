import { AuthForm } from "@/components/forms/auth-form";
import { FitnessCard } from "@/components/ui/fitness-card";
import { BarChart3 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <FitnessCard className="w-full max-w-md">
        <Link href="/dashboard" className="inline-flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-stone-950 text-sun">
            <BarChart3 className="size-5" />
          </span>
          <span>
            <span className="block font-display text-xl font-black">
              LiftLog
            </span>
            <span className="text-sm font-medium text-muted">
              Free fitness tracker
            </span>
          </span>
        </Link>
        <h1 className="mt-8 font-display text-4xl font-black tracking-tight">
          Welcome back.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          This is a mock login screen. Supabase auth can connect here next.
        </p>
        <AuthForm mode="login" />
      </FitnessCard>
    </main>
  );
}
