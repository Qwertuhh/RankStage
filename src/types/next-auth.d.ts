import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
  }

  interface Session {
    user: User;
  }

  interface JWT {
    role?: "user" | "admin";
  }
}
