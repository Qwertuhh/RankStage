import Link from "next/link";
import { UserNav } from "@/components/layout/user-nav";
import { UserRole } from "@/types/enums";

interface DashboardNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole;
  };
}

export function DashboardNav({ user }: DashboardNavProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center space-x-2">
          <Link
            href="/"
            className="font-semibold text-xl flex items-center space-x-2"
          >
            <span className="text-primary">Rank</span>
            <span>Stage</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-foreground/80"
          >
            Dashboard
          </Link>
          <Link
            href="/domains"
            className="transition-colors hover:text-foreground/80"
          >
            Domains
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}
