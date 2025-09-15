import Link from "next/link";
import { getServerSession } from "next-auth";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { UserNav } from "@/components/layout/user-nav";
import Logo from "@/components/logo";


export async function Navbar() {
  const session = await getServerSession(authOptions);
console.log(session);
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center space-x-2">
          <Logo className="h-8 w-8" />
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {session?.user ? (
            <UserNav user={{
              name: session.user.name ?? "",
              email: session.user.email ?? "",
              avatar: session.user.avatar ?? null,
              role: session.user.role
            }} />
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
