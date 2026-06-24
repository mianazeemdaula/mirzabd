// components/admin/admin-topbar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, ShieldAlert, ChevronRight } from "lucide-react";

export function AdminTopbar() {
  const pathname = usePathname();

  // Simple breadcrumbs generator
  const pathParts = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const href = "/" + pathParts.slice(0, index + 1).join("/");
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace("-", " ");
    const isLast = index === pathParts.length - 1;

    return (
      <React.Fragment key={href}>
        <ChevronRight size={14} className="text-muted" />
        {isLast ? (
          <span className="text-ink font-semibold text-xs sm:text-sm">{label}</span>
        ) : (
          <Link href={href} className="text-muted hover:text-gold transition-colors text-xs sm:text-sm font-medium">
            {label}
          </Link>
        )}
      </React.Fragment>
    );
  });

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-30 select-none">
      {/* Left side Breadcrumbs */}
      <div className="flex items-center gap-2">
        <ShieldAlert size={16} className="text-gold" />
        <Link href="/admin" className="text-muted hover:text-gold transition-colors text-xs sm:text-sm font-medium">
          Admin
        </Link>
        {breadcrumbs}
      </div>

      {/* Right side quick actions */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-muted hover:text-gold transition-colors border border-border rounded-[var(--radius-btn)] px-3 py-1.5 bg-void"
        >
          <Globe size={14} />
          <span className="hidden sm:inline">View Storefront</span>
        </Link>
      </div>
    </header>
  );
}
export default AdminTopbar;
