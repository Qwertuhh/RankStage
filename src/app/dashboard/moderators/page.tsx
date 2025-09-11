import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@/types/enums";
import { redirect } from "next/navigation";

export default async function ManageModeratorsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Manage Moderators</h1>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">
            Domain Moderators
          </h2>
          <p className="text-sm text-muted-foreground">
            Assign and manage moderators for each domain
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          Assign Moderator
        </button>
      </div>
      {/* Moderator list will be added here */}
      <div className="rounded-md border">
        <div className="p-4 text-center text-sm text-muted-foreground">
          No moderators assigned yet
        </div>
      </div>
    </div>
  );
}
