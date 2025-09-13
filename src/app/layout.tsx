import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/providers/next-auth";
import { ThemeProvider } from "@/providers/theme-provider";
import ThemeToggle from "@/components/theme-toggle";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  icons: "/rankstage-logo.svg",
  title: "RankStage - Track Your Skills Progress",
  description:
    "Join domain-specific communities, take quizzes, and get evaluated by experts to track your progress and improve your skills.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="bottom-right" richColors closeButton />
          <div className="fixed bottom-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <NextAuthProvider>{children}</NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
