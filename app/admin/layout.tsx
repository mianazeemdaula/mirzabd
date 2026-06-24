// app/admin/layout.tsx
import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Triple-check auth state inside layouts as fallback
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  if (!session || userRole !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="min-h-screen bg-void text-ink font-body flex">
      {/* Sidebar Navigation (Fixed) */}
      <AdminSidebar />

      {/* Main Administrative Container Panel */}
      <div className="flex-grow ml-60 flex flex-col min-h-screen">
        {/* Top Header bar */}
        <AdminTopbar />

        {/* Content body */}
        <main className="flex-1 p-6 sm:p-8 bg-void/50">
          {children}
        </main>
      </div>
    </div>
  );
}
