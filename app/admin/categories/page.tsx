// app/admin/categories/page.tsx
import React from "react";
import prisma from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/category-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Categories Management | Admin Book Depot",
  description: "Manage store categories, category logos, hierarchy and display settings.",
};

export default async function AdminCategoriesPage() {
  // Fetch categories with parent hierarchy and product counts
  const categories = await prisma.category.findMany({
    include: {
      parent: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: { products: true },
      },
    },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
            Categories Management
          </h1>
          <p className="text-xs text-muted mt-1">
            Manage product categories, circular logos & images, display order, and hierarchy.
          </p>
        </div>
      </div>

      {/* Main Interactive Category Manager */}
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
