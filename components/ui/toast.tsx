"use client";

import { Toaster as SonnerToaster } from "sonner";

function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-right"
      richColors
      toastOptions={{
        style: {
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-ink)",
        },
        classNames: {
          toast: "group",
          title: "text-ink font-medium",
          description: "text-muted text-sm",
          actionButton:
            "bg-gold text-white hover:bg-gold-dim font-medium text-sm px-3 py-1.5 rounded-[var(--radius-btn)]",
          cancelButton:
            "bg-elevated text-muted hover:text-ink font-medium text-sm px-3 py-1.5 rounded-[var(--radius-btn)]",
          closeButton: "text-muted hover:text-ink",
          success: "border-green-800/50",
          error: "border-crimson/50",
          warning: "border-gold/50",
          info: "border-blue-800/50",
        },
      }}
    />
  );
}

export { Toaster };
