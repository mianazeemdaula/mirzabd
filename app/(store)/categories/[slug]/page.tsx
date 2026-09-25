import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { BookGrid } from "@/components/store/book-grid";
import { CategoryStrip } from "@/components/store/category-strip";
import { serializeProduct } from "@/lib/utils";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  BookOpen,
  Sparkles,
  GraduationCap,
  Scroll,
  Bookmark,
  Compass,
  Library,
  SlidersHorizontal,
} from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} Collection`,
    description:
      category.description ||
      `Browse products in our ${category.name} section at Mirza Book Depot.`,
  };
}

function getCategoryFallbackIcon(name: string, slug: string) {
  const combined = (name + " " + slug).toLowerCase();
  if (combined.includes("quran") || combined.includes("islam") || combined.includes("deen")) {
    return Sparkles;
  }
  if (
    combined.includes("school") ||
    combined.includes("class") ||
    combined.includes("grade") ||
    combined.includes("academy") ||
    combined.includes("textbook")
  ) {
    return GraduationCap;
  }
  if (
    combined.includes("fiction") ||
    combined.includes("novel") ||
    combined.includes("literature") ||
    combined.includes("poetry")
  ) {
    return BookOpen;
  }
  if (
    combined.includes("history") ||
    combined.includes("biography") ||
    combined.includes("ancient")
  ) {
    return Scroll;
  }
  if (
    combined.includes("stationery") ||
    combined.includes("pen") ||
    combined.includes("pencil") ||
    combined.includes("notebook")
  ) {
    return Bookmark;
  }
  if (
    combined.includes("science") ||
    combined.includes("tech") ||
    combined.includes("computer")
  ) {
    return Compass;
  }
  return Library;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = pageStr ? Math.max(1, parseInt(pageStr) || 1) : 1;

  // 1. Fetch category details
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category || !category.isActive) {
    notFound();
  }

  // 2. Fetch books under this category with pagination
  const skip = (page - 1) * PRODUCTS_PER_PAGE;
  const take = PRODUCTS_PER_PAGE;

  const [books, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "publish",
        categories: {
          some: {
            id: category.id,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.product.count({
      where: {
        status: "publish",
        categories: {
          some: {
            id: category.id,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

  // 3. Fetch sibling categories for circular navigation strip
  const allCategories = await prisma.category.findMany({
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
  });

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-8 md:px-12 lg:px-16 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted">
        <Link href="/" className="hover:text-gold transition-colors">
          Home
        </Link>
        <ChevronRight size={14} />
        <Link href="/categories" className="hover:text-gold transition-colors">
          Categories
        </Link>
        <ChevronRight size={14} />
        <span className="text-ink font-medium">{category.name}</span>
      </nav>

      {/* Category Header Banner with Circular Logo & Bottom Line Title */}
      <div className="bg-surface border border-border p-5 sm:p-7 rounded-[var(--radius-card)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative z-10 text-center sm:text-left">
          {/* Circular Category Logo / Avatar */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2px] border-2 border-gold/60 flex-shrink-0">
            <div className="w-full h-full rounded-full bg-gradient-to-b from-elevated via-surface to-void p-3 flex items-center justify-center relative overflow-hidden">
              {category.imageUrl ? (
                <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 96px, 128px"
                    className="object-contain p-1 rounded-full"
                    unoptimized={category.imageUrl.startsWith("http")}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gold">
                  {React.createElement(getCategoryFallbackIcon(category.name, category.slug), {
                    size: 28,
                    className: "stroke-[1.6]",
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Title & Details */}
          <div className="space-y-3 flex-1 flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-2">
              <span className="text-badge text-gold uppercase tracking-wider font-bold bg-gold/10 border border-gold/20 px-3 py-1 rounded-full">
                Department Collection
              </span>
              <span className="text-xs text-muted font-medium">
                {totalCount} {totalCount === 1 ? "Product" : "Products"}
              </span>
            </div>

            {/* Title with Bottom Line */}
            <div className="flex flex-col items-center sm:items-start">
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-ink">
                {category.name}
              </h1>
              <div className="h-1 w-16 bg-gold  rounded-full mt-2.5" />
            </div>

            {category.description && (
              <p className="text-sm text-muted max-w-2xl leading-relaxed pt-1">
                {category.description}
              </p>
            )}

            <div className="pt-2">
              <Link
                href={`/products?category=${encodeURIComponent(category.slug)}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-btn)] bg-gold/15 border border-gold/30 text-gold hover:bg-gold hover:text-white transition-all text-xs font-semibold"
              >
                <SlidersHorizontal size={14} /> Filter &amp; Sort in Catalog
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sibling Categories in Circular Form */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
            Explore Other Categories
          </h2>
          <Link
            href="/categories"
            className="text-xs text-gold hover:underline font-semibold flex items-center gap-1"
          >
            All Categories <ChevronRight size={14} />
          </Link>
        </div>

        <CategoryStrip
          categories={allCategories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            imageUrl: c.imageUrl,
            count: c._count.products,
          }))}
          activeCategorySlug={category.slug}
        />
      </div>

      {/* Products Grid */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
            Available Products ({totalCount})
          </h2>
          <span className="text-xs text-muted">
            Showing {books.length} of {totalCount} items
          </span>
        </div>

        {books.length === 0 ? (
          <div className="py-12 text-center bg-surface/40 border border-border rounded-[var(--radius-card)] space-y-3">
            <p className="text-muted text-sm">No products found in this category yet.</p>
            <Link
              href="/products"
              className="inline-block text-xs font-bold uppercase tracking-wider text-gold hover:underline"
            >
              Browse All Products &rarr;
            </Link>
          </div>
        ) : (
          <BookGrid books={books.map(serializeProduct)} />
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6 border-t border-border flex-wrap">
            {page > 1 && (
              <Link href={`/categories/${slug}?page=${page - 1}`}>
                <Button variant="ghost" size="sm" className="h-9 px-3 rounded-[var(--radius-btn)] text-xs border border-border text-ink hover:border-gold cursor-pointer">
                  Previous
                </Button>
              </Link>
            )}

            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const p = i + 1;
              const isCurrent = p === page;
              return (
                <Link key={p} href={`/categories/${slug}?page=${p}`}>
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
            })}

            {page < totalPages && (
              <Link href={`/categories/${slug}?page=${page + 1}`}>
                <Button variant="ghost" size="sm" className="h-9 px-3 rounded-[var(--radius-btn)] text-xs border border-border text-ink hover:border-gold cursor-pointer">
                  Next
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
