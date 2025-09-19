import type { Metadata } from "next";
import { Merriweather, Open_Sans } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/providers/next-auth";
import { ThemeProvider } from "@/providers/theme-provider";
import ThemeToggle from "@/components/theme-toggle";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";

const crimsonPro = Merriweather({ weight: ["300", "400", "500", "600"], variable: "--font-crimson-pro" });
const openSans = Open_Sans({ weight: ["300", "400", "500", "600"], variable: "--font-open-sans" });

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
      <body className={`${crimsonPro.variable} ${openSans.variable} ${openSans.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
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
