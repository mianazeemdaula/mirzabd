// app/(store)/categories/[slug]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { BookGrid } from "@/components/store/book-grid";
import { serializeProduct } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} Collection`,
    description: category.description || `Browse products in our ${category.name} section at Mirza Book Depot.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // 1. Fetch category details
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category || !category.isActive) {
    notFound();
  }

  // 2. Fetch books under this category
  const books = await prisma.product.findMany({
    where: {
      status: "publish",
      categories: {
        some: {
          id: category.id,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted">
        <Link href="/" className="hover:text-gold transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link href="/books" className="hover:text-gold transition-colors">Shop</Link>
        <ChevronRight size={14} />
        <span className="text-ink">{category.name}</span>
      </nav>

      {/* Category Header Banner */}
      <div className="bg-surface border border-border p-6 sm:p-10 rounded-[var(--radius-card)] space-y-3">
        <span className="text-badge text-gold font-bold">Category Collection</span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-sm text-muted max-w-2xl leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {/* Grid listing */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-display text-xl font-bold text-ink">
            Available Products ({books.length})
          </h2>
        </div>
        <BookGrid books={books.map(serializeProduct)} />
      </div>
    </div>
  );
}
