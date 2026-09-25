// app/(store)/products/page.tsx
import React from "react";
import Link from "next/link";
import { X, Tag as TagIcon, RotateCcw } from "lucide-react";
import prisma from "@/lib/prisma";
import { FilterSidebar } from "@/components/store/filter-sidebar";
import { CategoryStrip } from "@/components/store/category-strip";
import { BookGrid } from "@/components/store/book-grid";
import { SortSelect } from "@/components/store/sort-select";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { serializeProduct } from "@/lib/utils";

interface SearchParams {
  category?: string;
  tag?: string;
  min_price?: string;
  max_price?: string;
  in_stock?: string;
  featured?: string;
  on_sale?: string;
  sort?: string;
  page?: string;
  q?: string;
}

export const dynamic = "force-dynamic";

// Category alias dictionary to map legacy or general slugs to actual database category slugs
const CATEGORY_SLUG_ALIASES: Record<string, string[]> = {
  fiction: ["novels-fiction-and-poetry"],
  "non-fiction": ["general-books-and-literature"],
  novels: ["novels-fiction-and-poetry"],
  poetry: ["novels-fiction-and-poetry"],
  literature: ["general-books-and-literature", "novels-fiction-and-poetry"],
  "urdu-literature": ["general-books-and-literature", "novels-fiction-and-poetry"],
  "islamic-books": ["hadith-and-islamic-books", "holy-quran-and-tafseer", "islamic-essentials"],
  quran: ["holy-quran-and-tafseer"],
  tafseer: ["holy-quran-and-tafseer"],
  hadith: ["hadith-and-islamic-books"],
  stationery: ["school-stationery", "office-supplies"],
  office: ["office-supplies"],
  art: ["art-materials"],
  "school-books": ["school-and-college-books"],
  textbooks: ["school-and-college-books"],
  bags: ["school-and-college-bags"],
  "past-papers": ["model-papers-and-past-papers"],
  "entry-test": ["entry-test-and-job-preparation-books"],
  registers: ["school-registers-and-account-books"],
  "lunch-boxes": ["lunch-boxes-water-bottles"],
  "water-bottles": ["lunch-boxes-water-bottles"],
  gifts: ["fun-gifts-and-play-items"],
  toys: ["fun-gifts-and-play-items"],
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Extract and parse filters (Next.js already URL-decodes searchParams)
  const rawCat = params.category ?? "";
  const categoryFilter = rawCat
    ? rawCat
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    : [];

  const rawTag = params.tag ? params.tag.trim().toLowerCase() : "";
  const minPrice = params.min_price ? parseFloat(params.min_price) : undefined;
  const maxPrice = params.max_price ? parseFloat(params.max_price) : undefined;
  const inStockOnly = params.in_stock === "true";
  const featuredOnly = params.featured === "true";
  const onSaleOnly = params.on_sale === "true";
  const sort = params.sort || "default";
  const page = params.page ? Math.max(1, parseInt(params.page) || 1) : 1;
  const searchQuery = params.q ? params.q.trim() : "";

  // Expand legacy/general slugs using aliases — only when the slug isn't a real category,
  // so selecting an actual category never pulls in products from other categories.
  const existingSlugs = categoryFilter.length
    ? new Set(
        (
          await prisma.category.findMany({
            where: { slug: { in: categoryFilter } },
            select: { slug: true },
          })
        ).map((c) => c.slug.toLowerCase())
      )
    : new Set<string>();
  const expandedCategoryFilter = new Set<string>();
  categoryFilter.forEach((cat) => {
    expandedCategoryFilter.add(cat);
    if (!existingSlugs.has(cat) && CATEGORY_SLUG_ALIASES[cat]) {
      CATEGORY_SLUG_ALIASES[cat].forEach((alias) => expandedCategoryFilter.add(alias));
    }
  });
  const filterSlugs = Array.from(expandedCategoryFilter);

  // 1. Build Prisma Where Clause
  const where: any = {
    status: "publish",
  };

  // Search keyword query (title, author, publisher, isbn, sku)
  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery } },
      { author: { contains: searchQuery } },
      { publisher: { contains: searchQuery } },
      { isbn: { contains: searchQuery } },
      { sku: { contains: searchQuery } },
    ];
  }

  // Category filter (matches slug or name in DB)
  if (filterSlugs.length > 0) {
    where.categories = {
      some: {
        OR: [
          { slug: { in: filterSlugs } },
          { name: { in: filterSlugs } },
        ],
      },
    };
  }

  // Tag filter
  if (rawTag) {
    where.tags = {
      some: {
        OR: [
          { slug: rawTag },
          { name: { contains: rawTag } },
        ],
      },
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

  // Sale filter — a real discount (many synced products carry salePrice == regularPrice)
  if (onSaleOnly) {
    where.salePrice = {
      lt: prisma.product.fields.regularPrice,
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
    orderBy = { regularPrice: "asc" };
  } else if (sort === "price-desc") {
    orderBy = { regularPrice: "desc" };
  } else if (sort === "best-selling") {
    orderBy = { totalSales: "desc" };
  }

  // 3. Query DB with pagination
  const skip = (page - 1) * PRODUCTS_PER_PAGE;
  const take = PRODUCTS_PER_PAGE;

  const [books, totalCount, allCategories, activeTagRecord] = await Promise.all([
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
    rawTag
      ? prisma.tag.findFirst({
          where: {
            OR: [{ slug: rawTag }, { name: { contains: rawTag } }],
          },
          select: { name: true, slug: true },
        })
      : null,
  ]);

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

  const formattedCategories = allCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.imageUrl,
    count: c._count.products,
  }));

  // Identify active category for highlight
  const matchedCategory = allCategories.find((c) =>
    filterSlugs.includes(c.slug.toLowerCase()) || filterSlugs.includes(c.name.toLowerCase())
  );
  const activeCategorySlug = matchedCategory ? matchedCategory.slug : categoryFilter[0] || null;

  // Compute Page Header Title
  let pageTitle = "Product Collection";
  if (searchQuery) {
    pageTitle = `Search: "${searchQuery}"`;
  } else if (activeTagRecord) {
    pageTitle = `Tag: ${activeTagRecord.name}`;
  } else if (categoryFilter.length === 1 && matchedCategory) {
    pageTitle = matchedCategory.name;
  } else if (categoryFilter.length > 1) {
    pageTitle = `Categories (${categoryFilter.length})`;
  } else if (featuredOnly) {
    pageTitle = "Featured Products";
  } else if (onSaleOnly) {
    pageTitle = "On Sale Items";
  }

  // Helper to build page link url
  const getPageLink = (pageNumber: number) => {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.set("category", params.category);
    if (params.tag) queryParams.set("tag", params.tag);
    if (params.min_price) queryParams.set("min_price", params.min_price);
    if (params.max_price) queryParams.set("max_price", params.max_price);
    if (params.in_stock) queryParams.set("in_stock", params.in_stock);
    if (params.featured) queryParams.set("featured", params.featured);
    if (params.on_sale) queryParams.set("on_sale", params.on_sale);
    if (params.sort) queryParams.set("sort", params.sort);
    if (params.q) queryParams.set("q", params.q);
    queryParams.set("page", String(pageNumber));
    return `/products?${queryParams.toString()}`;
  };

  // Helpers to construct filter removal URLs
  const createFilterUrl = (overrides: Record<string, string | null>) => {
    const qp = new URLSearchParams();
    const current: Record<string, string | undefined> = {
      category: params.category,
      tag: params.tag,
      min_price: params.min_price,
      max_price: params.max_price,
      in_stock: params.in_stock,
      featured: params.featured,
      on_sale: params.on_sale,
      sort: params.sort,
      q: params.q,
    };

    for (const [key, val] of Object.entries({ ...current, ...overrides })) {
      if (val) {
        qp.set(key, val);
      }
    }
    const str = qp.toString();
    return str ? `/products?${str}` : "/products";
  };

  const getRemoveCategoryLink = (slugToRemove: string) => {
    const remaining = categoryFilter.filter((s) => s !== slugToRemove.toLowerCase());
    return createFilterUrl({
      category: remaining.length > 0 ? remaining.join(",") : null,
    });
  };

  const hasAnyFilters =
    categoryFilter.length > 0 ||
    Boolean(rawTag) ||
    Boolean(searchQuery) ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    inStockOnly ||
    featuredOnly ||
    onSaleOnly;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-8 md:px-12 lg:px-16 space-y-6">
      {/* Top Circular Category Strip */}
      <div className="space-y-2 border-b border-border pb-4">
        <CategoryStrip
          categories={formattedCategories}
          activeCategorySlug={activeCategorySlug}
        />
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-[1.75rem] font-bold tracking-tight text-ink">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Showing {books.length} of {totalCount} products available
          </p>
        </div>

        {/* Clear all link if filters active */}
        {hasAnyFilters && (
          <Link
            href="/products"
            className="text-xs font-semibold text-crimson hover:underline flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RotateCcw size={13} /> Reset All Filters
          </Link>
        )}
      </div>

      {/* Active Filter Chips Bar */}
      {hasAnyFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider mr-1">
            Active:
          </span>

          {/* Category Chips */}
          {categoryFilter.map((slug) => {
            const catObj = allCategories.find((c) => c.slug.toLowerCase() === slug);
            const displayName = catObj ? catObj.name : slug;
            return (
              <Link
                key={`cat-${slug}`}
                href={getRemoveCategoryLink(slug)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold border border-gold/30 hover:bg-gold hover:text-white text-xs font-medium transition-all group"
              >
                <span>Category: {displayName}</span>
                <X size={13} className="opacity-70 group-hover:opacity-100" />
              </Link>
            );
          })}

          {/* Tag Chip */}
          {rawTag && (
            <Link
              href={createFilterUrl({ tag: null })}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500 hover:text-white text-xs font-medium transition-all group"
            >
              <TagIcon size={12} />
              <span>Tag: {activeTagRecord?.name || rawTag}</span>
              <X size={13} className="opacity-70 group-hover:opacity-100" />
            </Link>
          )}

          {/* Search Chip */}
          {searchQuery && (
            <Link
              href={createFilterUrl({ q: null })}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-elevated border border-border text-ink hover:border-crimson hover:text-crimson text-xs font-medium transition-all group"
            >
              <span>Search: &quot;{searchQuery}&quot;</span>
              <X size={13} className="opacity-70 group-hover:opacity-100" />
            </Link>
          )}

          {/* Price Range Chip */}
          {(minPrice !== undefined || maxPrice !== undefined) && (
            <Link
              href={createFilterUrl({ min_price: null, max_price: null })}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-elevated border border-border text-ink hover:border-crimson hover:text-crimson text-xs font-medium transition-all group"
            >
              <span>
                Price: {minPrice !== undefined ? `PKR ${minPrice}` : "0"} – {maxPrice !== undefined ? `PKR ${maxPrice}` : "Any"}
              </span>
              <X size={13} className="opacity-70 group-hover:opacity-100" />
            </Link>
          )}

          {/* In Stock Chip */}
          {inStockOnly && (
            <Link
              href={createFilterUrl({ in_stock: null })}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white text-xs font-medium transition-all group"
            >
              <span>In Stock Only</span>
              <X size={13} className="opacity-70 group-hover:opacity-100" />
            </Link>
          )}

          {/* Featured Chip */}
          {featuredOnly && (
            <Link
              href={createFilterUrl({ featured: null })}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-white text-xs font-medium transition-all group"
            >
              <span>Featured Only</span>
              <X size={13} className="opacity-70 group-hover:opacity-100" />
            </Link>
          )}

          {/* On Sale Chip */}
          {onSaleOnly && (
            <Link
              href={createFilterUrl({ on_sale: null })}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-crimson/15 text-crimson border border-crimson/30 hover:bg-crimson hover:text-white text-xs font-medium transition-all group"
            >
              <span>On Sale Only</span>
              <X size={13} className="opacity-70 group-hover:opacity-100" />
            </Link>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
        {/* Sidebar Filters with accurate counts */}
        <FilterSidebar categories={formattedCategories} />

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
          {books.length === 0 ? (
            <div className="py-14 text-center bg-surface border border-border rounded-[var(--radius-card)] space-y-3">
              <p className="text-muted text-sm">No products found matching your filters.</p>
              <Link
                href="/products"
                className="inline-block text-xs font-bold uppercase tracking-wider text-gold hover:underline"
              >
                Clear Filters &amp; View All Products &rarr;
              </Link>
            </div>
          ) : (
            <BookGrid books={books.map(serializeProduct)} />
          )}

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
