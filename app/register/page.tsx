import {
  AuthPageShell,
  authImages,
} from "@/components/auth/auth-page-shell";
import { PublicAuthRedirect } from "@/components/auth/public-auth-redirect";
import { RegisterForm } from "@/components/forms/auth-form";

export default function RegisterPage() {
  return (
    <PublicAuthRedirect>
      <AuthPageShell
        title="Start your LogFit journey"
        subtitle="Create your free account and begin tracking your fitness progress."
        imageSrc={authImages.register}
        imageAlt="Fitness community celebrating progress"
        imageEyebrow="Start strong"
        imageTitle="Build a routine you can actually keep."
      >
        <RegisterForm />
      </AuthPageShell>
    </PublicAuthRedirect>
  );
}
