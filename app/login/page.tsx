import {
  AuthPageShell,
  authImages,
} from "@/components/auth/auth-page-shell";
import { PublicAuthRedirect } from "@/components/auth/public-auth-redirect";
import { LoginForm } from "@/components/forms/auth-form";

export default function LoginPage() {
  return (
    <PublicAuthRedirect>
      <AuthPageShell
        title="Welcome back"
        subtitle="Log your training, habits, meals, and progress from one private dashboard."
        imageSrc={authImages.login}
        imageAlt="Athlete strength training in a gym"
        imageEyebrow="Training waits"
        imageTitle="Pick up where your last session left off."
      >
        <LoginForm />
      </AuthPageShell>
    </PublicAuthRedirect>
  );
}
