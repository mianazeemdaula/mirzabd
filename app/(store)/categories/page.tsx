// app/(store)/categories/page.tsx
import React from "react";
import prisma from "@/lib/prisma";
import { CategoryGrid } from "@/components/store/category-grid";
import { Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Categories Catalog",
  description: "Browse all product categories and departments at Mirza Book Depot.",
};

export default async function CategoriesPage() {
  let categories: {
    id: number;
    name: string;
    slug: string;
    description: string;
    imageUrl: string | null;
    productCount: number;
    totalSales: number;
  }[] = [];

  try {
    // Fetch active categories with count of published products and total sales
    // Sales totals are summed in SQL rather than loading every product row
    const [categoriesFromDb, salesRows] = await Promise.all([
      prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            products: {
              where: { status: "publish" },
            },
          },
        },
      },
      orderBy: { displayOrder: "asc" },
      }),
      prisma.$queryRaw<{ categoryId: number; total: number | null }[]>`
        SELECT pc.A AS categoryId, SUM(p.totalSales) AS total
        FROM _ProductCategories pc
        JOIN products p ON p.id = pc.B
        WHERE p.status = 'publish'
        GROUP BY pc.A`,
    ]);
    const salesByCategory = new Map(salesRows.map((r) => [Number(r.categoryId), Number(r.total ?? 0)]));

    categories = categoriesFromDb
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        productCount: cat._count.products,
        totalSales: salesByCategory.get(cat.id) ?? 0,
        displayOrder: cat.displayOrder,
      }))
      .sort((a, b) => b.totalSales - a.totalSales || a.displayOrder - b.displayOrder);
  } catch (err) {
    console.warn("Categories page: database query skipped or unreachable:", err);
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-8 md:px-12 lg:px-16 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-badge text-gold tracking-widest font-bold uppercase inline-flex items-center gap-1.5">
          <Layers size={12} /> Categories
        </span>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">
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
