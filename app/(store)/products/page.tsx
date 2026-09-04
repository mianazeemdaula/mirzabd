// app/(store)/products/page.tsx
import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { FilterSidebar } from "@/components/store/filter-sidebar";
import { BookGrid } from "@/components/store/book-grid";
import { SortSelect } from "@/components/store/sort-select";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { serializeProduct } from "@/lib/utils";

interface SearchParams {
  category?: string;
  min_price?: string;
  max_price?: string;
  language?: string;
  in_stock?: string;
  featured?: string;
  on_sale?: string;
  sort?: string;
  page?: string;
  q?: string;
}

export const dynamic = "force-dynamic";

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  
  // Extract and parse filters
  const categoryFilter = params.category ? params.category.split(",") : [];
  const minPrice = params.min_price ? parseFloat(params.min_price) : undefined;
  const maxPrice = params.max_price ? parseFloat(params.max_price) : undefined;
  const languageFilter = params.language ? params.language.split(",") : [];
  const inStockOnly = params.in_stock === "true";
  const featuredOnly = params.featured === "true";
  const onSaleOnly = params.on_sale === "true";
  const sort = params.sort || "default";
  const page = params.page ? parseInt(params.page) : 1;
  const searchQuery = params.q || "";

  // 1. Build Prisma Where Clause
  const where: any = {
    status: "publish",
  };

  // Search keyword query (title, author, publisher, isbn)
  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery } },
      { author: { contains: searchQuery } },
      { publisher: { contains: searchQuery } },
      { isbn: { contains: searchQuery } },
      { sku: { contains: searchQuery } },
    ];
  }

  // Category filter
  if (categoryFilter.length > 0) {
    where.categories = {
      some: {
        slug: { in: categoryFilter },
      },
    };
  }

  // Language filter
  if (languageFilter.length > 0) {
    where.language = {
      in: languageFilter,
    };
  }

  // Stock filter
  if (inStockOnly) {
    where.stockStatus = "instock";
  }

  // Featured filter
  if (featuredOnly) {
    where.isFeatured = true;
  }

  // Sale filter (salePrice must be non-null and less than regular price)
  if (onSaleOnly) {
    where.salePrice = {
      not: null,
    };
  }

  // Price range filters
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.AND = [];
    if (minPrice !== undefined) {
      where.AND.push({
        OR: [
          { salePrice: { gte: minPrice } },
          { AND: [{ salePrice: null }, { regularPrice: { gte: minPrice } }] },
        ],
      });
    }
    if (maxPrice !== undefined) {
      where.AND.push({
        OR: [
          { salePrice: { lte: maxPrice } },
          { AND: [{ salePrice: null }, { regularPrice: { lte: maxPrice } }] },
        ],
      });
    }
  }

  // 2. Sort Mapping
  let orderBy: any = { createdAt: "desc" };
  if (sort === "newest") {
    orderBy = { createdAt: "desc" };
  } else if (sort === "price-asc") {
    orderBy = { regularPrice: "asc" }; // simple sort, database handles ordering
  } else if (sort === "price-desc") {
    orderBy = { regularPrice: "desc" };
  } else if (sort === "best-selling") {
    orderBy = { totalSales: "desc" };
  }

  // 3. Query DB with pagination
  const skip = (page - 1) * PRODUCTS_PER_PAGE;
  const take = PRODUCTS_PER_PAGE;

  const [books, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        categories: true,
      },
      orderBy,
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

  // Fetch all active categories for the sidebar filter
  const allCategories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });

  // Calculate pages list for pagination UI helper
  const pagesList = Array.from({ length: totalPages }).map((_, i) => i + 1);

  // Helper to build page link url
  const getPageLink = (pageNumber: number) => {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.set("category", params.category);
    if (params.min_price) queryParams.set("min_price", params.min_price);
    if (params.max_price) queryParams.set("max_price", params.max_price);
    if (params.language) queryParams.set("language", params.language);
    if (params.in_stock) queryParams.set("in_stock", params.in_stock);
    if (params.featured) queryParams.set("featured", params.featured);
    if (params.on_sale) queryParams.set("on_sale", params.on_sale);
    if (params.sort) queryParams.set("sort", params.sort);
    if (params.q) queryParams.set("q", params.q);
    queryParams.set("page", String(pageNumber));
    return `/products?${queryParams.toString()}`;
  };

  return (
    <div className="mx-auto w-full max-w-none px-4 py-8 sm:px-8 md:px-12 lg:px-16 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          {searchQuery ? `Search Results for "${searchQuery}"` : "Product Collection"}
        </h1>
        <p className="text-sm text-muted">
          Showing {books.length} of {totalCount} products available
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <FilterSidebar categories={allCategories} />

        {/* Catalog List Content */}
        <div className="flex-1 space-y-6">
          {/* Sorting / Controls bar */}
          <div className="flex items-center justify-between bg-surface border border-border p-3.5 rounded-[var(--radius-card)]">
            <span className="text-xs text-muted font-medium">
              Sort by:
            </span>
            <SortSelect sort={sort} />
          </div>

          {/* Book Cards Grid */}
          <BookGrid books={books.map(serializeProduct)} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-border flex-wrap">
              {/* Prev button */}
              {page > 1 && (
                <Link href={getPageLink(page - 1)}>
                  <Button variant="ghost" size="sm" className="h-9 px-3 rounded-[var(--radius-btn)] text-xs border border-border text-ink hover:border-gold cursor-pointer">
                    Previous
                  </Button>
                </Link>
              )}

              {/* Number buttons with Ellipses */}
              {(() => {
                const delta = 2; // Pages to show around current page
                const range = [];
                for (let i = 1; i <= totalPages; i++) {
                  if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
                    range.push(i);
                  }
                }

                const buttons: (number | string)[] = [];
                let prevPage = 0;
                for (const p of range) {
                  if (prevPage > 0) {
                    if (p - prevPage === 2) {
                      buttons.push(prevPage + 1);
                    } else if (p - prevPage > 2) {
                      buttons.push("...");
                    }
                  }
                  buttons.push(p);
                  prevPage = p;
                }

                return buttons.map((p, idx) => {
                  if (p === "...") {
                    return (
                      <span key={`dots-${idx}`} className="px-2 text-muted text-xs select-none">
                        ...
                      </span>
                    );
                  }

                  const isCurrent = p === page;
                  return (
                    <Link key={p} href={getPageLink(p as number)}>
                      <Button
                        variant={isCurrent ? "primary" : "ghost"}
                        size="sm"
                        className={`h-9 w-9 rounded-[var(--radius-btn)] text-xs font-semibold cursor-pointer ${
                          isCurrent
                            ? "bg-gold text-white font-bold shadow-md"
                            : "border border-border text-ink hover:border-gold"
                        }`}
                      >
                        {p}
                      </Button>
                    </Link>
                  );
                });
              })()}

              {/* Next button */}
              {page < totalPages && (
                <Link href={getPageLink(page + 1)}>
                  <Button variant="ghost" size="sm" className="h-9 px-3 rounded-[var(--radius-btn)] text-xs border border-border text-ink hover:border-gold cursor-pointer">
                    Next
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
