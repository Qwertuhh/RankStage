import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@/types/enums";
import { redirect } from "next/navigation";

export default async function ManageQuizzesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.MODERATOR) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Manage Quizzes</h1>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Your Quizzes</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage quizzes for your domains
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          Create Quiz
        </button>
      </div>
      {/* Quiz list will be added here */}
      <div className="rounded-md border">
        <div className="p-4 text-center text-sm text-muted-foreground">
          No quizzes created yet
        </div>
      </div>
    </div>
  );
}
