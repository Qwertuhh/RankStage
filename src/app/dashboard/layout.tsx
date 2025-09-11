import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@/types/enums";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Only allow admin and moderators to access dashboard
  if (
    session.user.role !== UserRole.ADMIN &&
    session.user.role !== UserRole.MODERATOR
  ) {
    redirect("/domains");
  }

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <DashboardNav user={session.user} />
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          <nav className="flex flex-col space-y-2">
            {session.user.role === UserRole.ADMIN ? (
              <>
                <DashboardLink href="/dashboard">Overview</DashboardLink>
                <DashboardLink href="/dashboard/domains">
                  Manage Domains
                </DashboardLink>
                <DashboardLink href="/dashboard/moderators">
                  Manage Moderators
                </DashboardLink>
              </>
            ) : (
              <>
                <DashboardLink href="/dashboard">Overview</DashboardLink>
                <DashboardLink href="/dashboard/onboarding">
                  Onboarding Forms
                </DashboardLink>
                <DashboardLink href="/dashboard/submissions">
                  Review Submissions
                </DashboardLink>
                <DashboardLink href="/dashboard/quizzes">
                  Manage Quizzes
                </DashboardLink>
                <DashboardLink href="/dashboard/analytics">
                  Analytics
                </DashboardLink>
              </>
            )}
          </nav>
        </aside>
        <main className="flex w-full flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}

function DashboardLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
    >
      {children}
    </a>
  );
}
