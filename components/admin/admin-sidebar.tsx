// components/admin/admin-sidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  ShoppingBag,
  Users,
  MessageSquare,
  Key,
  Terminal,
  Settings,
  LogOut,
  User,
  Book,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { Logo } from "@/components/store/logo";

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products Catalog", href: "/admin/products", icon: BookOpen },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    { label: "API Credentials", href: "/admin/api-keys", icon: Key },
    { label: "API Logs", href: "/admin/logs", icon: Terminal },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="fixed top-0 bottom-0 left-0 w-60 bg-surface border-r border-border flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-border overflow-hidden">
        <Logo size="sm" href="/admin" />
      </div>

      {/* Nav list */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "text-gold bg-gold/5 border-l-2 border-gold"
                  : "text-muted hover:text-ink hover:bg-elevated/40 border-l-2 border-transparent"
              }`}
            >
              <Icon size={16} className={isActive ? "text-gold" : "text-muted"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile Info */}
      <div className="p-4 border-t border-border bg-elevated/20 flex flex-col gap-3">
        <div className="flex items-center gap-2.5 px-2">
          <div className="h-8 w-8 rounded-full bg-gold/10 text-gold flex items-center justify-center flex-shrink-0 border border-gold/20">
            <User size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-ink truncate block">
              {session?.user?.name || "Administrator"}
            </span>
            <span className="text-[10px] text-muted truncate block">
              {session?.user?.email || "admin@bookdepot.com"}
            </span>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-crimson hover:bg-crimson/10 rounded transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
export default AdminSidebar;
