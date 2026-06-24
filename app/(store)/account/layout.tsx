// app/(store)/account/layout.tsx
import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { User, ShoppingBag, Heart, MapPin, ChevronRight } from "lucide-react";
import { auth } from "@/auth";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check auth session
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/account");
  }

  const sidebarLinks = [
    { label: "My Profile", href: "/account", icon: User },
    { label: "Order History", href: "/account/orders", icon: ShoppingBag },
    { label: "My Wishlist", href: "/account/wishlist", icon: Heart },
    { label: "Manage Addresses", href: "/account/addresses", icon: MapPin },
  ];

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-badge text-gold font-bold">My Account Dashboard</span>
        <h1 className="font-display text-3xl font-bold text-ink">Welcome back, {session.user.name || "Customer"}!</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Account Navigation Sidebar */}
        <aside className="md:col-span-4 lg:col-span-3 bg-surface border border-border p-4 rounded-[var(--radius-card)] space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between p-3 rounded-md text-sm text-muted hover:text-gold hover:bg-elevated transition-all"
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className="text-gold/80" />
                  <span className="font-medium text-ink">{link.label}</span>
                </div>
                <ChevronRight size={14} className="text-muted/60" />
              </Link>
            );
          })}
        </aside>

        {/* Right Side: Account Page Content */}
        <main className="md:col-span-8 lg:col-span-9 bg-surface border border-border p-6 rounded-[var(--radius-card)] min-h-[300px]">
          {children}
        </main>
      </div>
    </div>
  );
}
