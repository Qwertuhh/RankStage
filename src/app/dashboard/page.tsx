import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@/types/enums";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) return null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">
        {session.user.role === UserRole.ADMIN
          ? "Admin Dashboard"
          : "Moderator Dashboard"}
      </h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {session.user.role === UserRole.ADMIN ? (
          <>
            <DashboardCard
              title="Total Domains"
              value="Loading..."
              description="Active domains on the platform"
            />
            <DashboardCard
              title="Total Moderators"
              value="Loading..."
              description="Active moderators across all domains"
            />
            <DashboardCard
              title="Total Users"
              value="Loading..."
              description="Registered users on the platform"
            />
          </>
        ) : (
          <>
            <DashboardCard
              title="Pending Reviews"
              value="Loading..."
              description="Submissions awaiting your review"
            />
            <DashboardCard
              title="Active Quizzes"
              value="Loading..."
              description="Currently active quizzes in your domains"
            />
            <DashboardCard
              title="Total Submissions"
              value="Loading..."
              description="Total submissions in your domains"
            />
          </>
        )}
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 flex flex-col gap-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
