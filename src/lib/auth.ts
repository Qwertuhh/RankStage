import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
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
        if (!credentials?.email || !credentials?.password) {
          logger.error("Missing credentials");
          throw new Error("Email and password are required");
        }

        try {
          await connectDB();
          logger.info("Connected to MongoDB");
          
          const user = await User.findOne({
            email: credentials.email.toLowerCase().trim(),
          }).select("+password");

          if (!user) {
            logger.warn("User not found", {
              email: credentials.email,
              timestamp: new Date().toISOString(),
            });
            // Don't reveal if user exists or not for security
            throw new Error("Invalid email or password");
          }

          if (!user.password) {
            logger.error("User has no password set", {
              userId: user._id,
              email: user.email,
            });
            throw new Error("Account configuration error. Please contact support.");
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            logger.warn("Invalid password attempt", {
              userId: user._id,
              email: user.email,
              timestamp: new Date().toISOString(),
            });
            throw new Error("Invalid email or password");
          }

          if (!user.isActive) {
            logger.warn("Login attempt for inactive account", {
              userId: user._id,
              email: user.email,
            });
            throw new Error("This account has been deactivated. Please contact support.");
          }

          logger.info("User authenticated successfully", {
            userId: user._id,
            email: user.email,
            role: user.role,
          });

          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`.trim(),
            role: user.role || 'USER',
            image: user.avatar,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
          logger.error("Authentication error", {
            error: errorMessage,
            email: credentials.email,
            timestamp: new Date().toISOString(),
          });
          
          // Rethrow the error to be handled by NextAuth
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/dashboard";
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || "";
        session.user.role = token.role || "USER";
        session.user.name = token.name || "";
        session.user.email = token.email || "";
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
  },
  events: {
    async signIn(message) {
      logger.info("User signed in", {
        userId: message.user.id,
        email: message.user.email,
        provider: message.account?.provider,
      });
    },
    async signOut(message) {
      logger.info("User signed out", {
        session: message.session,
        token: message.token,
      });
    },
  },
};
