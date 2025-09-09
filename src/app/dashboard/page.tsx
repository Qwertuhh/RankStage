import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const isAdmin = session.user.role === "admin";

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? "Admin Dashboard" : "User Dashboard"}
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {isAdmin ? (
            <AdminDashboard />
          ) : (
            <UserDashboard userId={session.user.id} />
          )}
        </div>
      </main>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Domain Management
        </h3>
        {/* Add domain creation form and list of domains here */}
      </div>
    </div>
  );
}

function UserDashboard({ userId }: { userId: string }) {
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Your Domains
        </h3>
        {/* Add list of enrolled domains and performance metrics here */}
      </div>
    </div>
  );
}
