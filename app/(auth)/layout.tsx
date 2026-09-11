// app/(auth)/layout.tsx
import React from "react";
import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { Logo } from "@/components/store/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-void text-ink py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient background overlays */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-gold/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center relative z-10 space-y-2 flex flex-col items-center">
        <Logo size="lg" href="/" />
        <p className="text-xs text-muted font-medium italic mt-1">{APP_TAGLINE}</p>
      </div>

      {/* Main card box */}
      <div className="w-full max-w-md bg-surface border border-border rounded-[var(--radius-card)] p-6 sm:p-8 shadow-card relative z-10">
        {children}
      </div>
    </div>
  );
}
