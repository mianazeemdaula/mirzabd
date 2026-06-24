// app/admin/books/new/page.tsx
import React from "react";
import prisma from "@/lib/prisma";
import { BookFormWrapper } from "./book-form-wrapper";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewBookPage() {
  // Fetch active categories to populate checklists
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Link href="/admin/books" className="p-1.5 border border-border rounded-[var(--radius-btn)] text-muted hover:text-gold hover:border-gold transition-colors">
          <ChevronLeft size={16} />
        </Link>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Add New Product</h1>
          <p className="text-xs text-muted">Create a new product listing details in the inventory catalog.</p>
        </div>
      </div>

      {/* Form Wrapper */}
      <BookFormWrapper categories={categories} />
    </div>
  );
}
