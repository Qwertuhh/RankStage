import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Profile - RankStage",
  description: "View and edit your profile settings",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="container max-w-6xl py-6 space-y-6 lg:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            View and update your profile information
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="text-lg font-semibold">
            Personal Information
          </CardHeader>
          <CardContent>
            <ProfileForm user={session.user} />
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader className="text-lg font-semibold">
              Account Overview
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground">{session.user.email}</p>
              </div>
              <div>
                <p className="font-medium">Role</p>
                <p className="text-muted-foreground capitalize">
                  {session.user.role.toLowerCase()}
                </p>
              </div>
              <div>
                <p className="font-medium">Account Status</p>
                <p className="text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
