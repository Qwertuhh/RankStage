import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Authentication Error - RankStage",
  description: "There was a problem signing you in",
};

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams?.error;
  let errorMessage = "There was a problem signing you in";

  switch (error) {
    case "CredentialsSignin":
      errorMessage = "The email or password you entered is incorrect";
      break;
    case "AccessDenied":
      errorMessage = "You do not have permission to sign in";
      break;
    case "Verification":
      errorMessage = "The verification link is invalid or has expired";
      break;
    default:
      errorMessage = "There was a problem signing you in";
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-destructive">
            Authentication Error
          </h1>
          <p className="text-sm text-muted-foreground">
            {errorMessage}
          </p>
        </div>
        <Link
          href="/auth/signin"
          className="w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}
