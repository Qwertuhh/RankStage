import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import connectDB from "@/lib/db";
import { User } from "@/models/user.model";
import logger from "@/lib/logger";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            logger.error("Missing credentials");
            return null;
          }

          await connectDB();
          logger.info("Connected to MongoDB");
          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
          }).select("+password");

          if (!user) {
            logger.error("User not found", undefined, {
              email: credentials.email,
            });
            return null;
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            logger.error("Invalid password", undefined, {
              email: credentials.email,
            });
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          logger.error(
            "Authentication error",
            error instanceof Error ? error : new Error("Unknown error")
          );
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect() {
      return "/domains";
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role ?? "USER";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
};
