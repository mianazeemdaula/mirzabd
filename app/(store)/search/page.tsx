// app/(store)/search/page.tsx
import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { BookGrid } from "@/components/store/book-grid";
import { serializeProduct } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  // Query PostgreSQL database if query has length
  const books = query
    ? await prisma.product.findMany({
        where: {
          status: "publish",
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { author: { contains: query, mode: "insensitive" } },
            { publisher: { contains: query, mode: "insensitive" } },
            { isbn: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          categories: true,
        },
        orderBy: { totalSales: "desc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted">
        <Link href="/" className="hover:text-gold transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link href="/books" className="hover:text-gold transition-colors">Shop</Link>
        <ChevronRight size={14} />
        <span className="text-ink">Search Results</span>
      </nav>

      {/* Search Header Banner */}
      <div className="bg-surface border border-border p-6 sm:p-8 rounded-[var(--radius-card)] space-y-2">
        <span className="text-badge text-gold font-bold">Search Catalog</span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
          {query ? `Search results for "${query}"` : "Search our entire collection"}
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          Found {books.length} matching titles in database
        </p>
      </div>

      {/* Grid listing */}
      <div className="space-y-6">
        {books.length > 0 ? (
          <BookGrid books={books.map(serializeProduct)} />
        ) : (
          <div className="text-center py-16 bg-surface border border-border rounded-[var(--radius-card)]">
            <p className="text-muted text-base">
              No matching products found. Try searching for something else or view all titles.
            </p>
            <Link href="/books" className="inline-block mt-4 text-xs font-bold text-gold hover:underline uppercase tracking-wider">
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
