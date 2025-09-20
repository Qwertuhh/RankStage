import SignUpForm from "@/components/auth/signup-form";
import { CardDescription, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-[var(--signup-form-width)] flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <CardTitle className="text-2xl font-crimson-pro">
            Create an account
          </CardTitle>
          <CardDescription>
            Join us and start your journey today.
          </CardDescription>
        </div>
        <SignUpForm />
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          Already have an account?{" "}
          <a href="/auth/signin" className="font-semibold text-primary">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
