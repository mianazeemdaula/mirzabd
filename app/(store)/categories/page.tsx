// app/(store)/categories/page.tsx
import React from "react";
import prisma from "@/lib/prisma";
import { CategoryGrid } from "@/components/store/category-grid";
import { Layers } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export const metadata = {
  title: "Categories Catalog",
  description: "Browse all product categories and departments at Mirza Book Depot.",
};

export default async function CategoriesPage() {
  // Fetch active categories with count of published products
  const categoriesFromDb = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    include: {
      _count: {
        select: {
          products: {
            where: { status: "publish" },
          },
        },
      },
    },
  });

  const categories = categoriesFromDb.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    imageUrl: cat.imageUrl,
    productCount: cat._count.products,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-badge text-gold tracking-widest font-bold uppercase inline-flex items-center gap-1.5">
          <Layers size={12} /> Categories
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ink">
          Browse Departments
        </h1>
        <p className="text-muted text-sm sm:text-base leading-relaxed">
          From Urdu and Islamic literature to premium educational stationeries, academic materials, and supplies — explore our diverse collection of high-quality items.
        </p>
      </div>

      {/* Grid listing */}
      <CategoryGrid categories={categories} />
    </div>
  );
}
