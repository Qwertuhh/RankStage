"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      theme="system"
      toastOptions={{
        className: "bg-background text-foreground border-border",
      }}
      className="dark:!bg-zinc-800"
      richColors
      closeButton
    />
  );
}
