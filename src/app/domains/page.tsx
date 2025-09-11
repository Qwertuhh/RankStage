import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DomainsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Your Domains</h1>
      {/* We'll add domain list and creation functionality later */}
      <div className="bg-muted p-8 rounded-lg text-center">
        <p className="text-lg mb-4">
          Welcome to RankStage, {session.user.name}!
        </p>
        <p>You can start by creating a domain or joining existing ones.</p>
      </div>
    </div>
  );
}
