import "next-auth";
import { UserRole } from "@/types/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      avatar?: string | null;
      role: UserRole;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string | null;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    avatar?: string | null;
    role: UserRole;
  }
}
