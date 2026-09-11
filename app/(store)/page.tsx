// app/(store)/page.tsx
import React from "react";
import Link from "next/link";
import { ArrowRight, Package, Truck, ShieldCheck, Mail } from "lucide-react";
import prisma from "@/lib/prisma";
import { Hero } from "@/components/store/hero";
import { CategoryStrip } from "@/components/store/category-strip";
import { BookGrid } from "@/components/store/book-grid";
import { TagSection } from "@/components/store/tag-section";
import { CountUp } from "@/components/motion/count-up";
import { Button } from "@/components/ui/button";
import { serializeProduct } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let categories: any[] = [];
  let featuredBooks: any[] = [];
  let newArrivals: any[] = [];
  let bestsellers: any[] = [];
  let serializedTags: any[] = [];

  try {
    // Fetch active categories and sort by total sales of products within them
    const rawCategories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        products: {
          where: { status: "publish" },
          select: {
            totalSales: true,
          },
        },
      },
    });

    categories = rawCategories
      .map((cat) => {
        const totalSales = cat.products.reduce((sum, p) => sum + p.totalSales, 0);
        return {
          ...cat,
          totalSales,
        };
      })
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 12);

    // Fetch Featured Products
    featuredBooks = await prisma.product.findMany({
      where: {
        status: "publish",
        isFeatured: true,
      },
      include: {
        categories: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
    });

    // Fetch New Arrivals (latest published products)
    newArrivals = await prisma.product.findMany({
      where: { status: "publish" },
      include: {
        categories: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    // Fetch Bestsellers (sorted by total sales)
    bestsellers = await prisma.product.findMany({
      where: { status: "publish" },
      include: {
        categories: true,
      },
      orderBy: { totalSales: "desc" },
      take: 4,
    });

    // Fetch Tags with their products for "School Books" section
    const schoolTags = await prisma.tag.findMany({
      where: {
        OR: [
          { name: { contains: "school" } },
          { name: { contains: "allied" } },
          { name: { contains: "class" } },
          { name: { contains: "grade" } },
          { name: { contains: "academy" } },
        ],
      },
      include: {
        products: {
          where: { status: "publish" },
          include: { categories: true },
          take: 12,
          orderBy: { updatedAt: "desc" },
        },
      },
      orderBy: { name: "asc" },
    });

    // If no school-specific tags, fetch ALL tags that have products
    const allTagsWithProducts = schoolTags.length > 0
      ? schoolTags
      : await prisma.tag.findMany({
          where: {
            products: {
              some: { status: "publish" },
            },
          },
          include: {
            products: {
              where: { status: "publish" },
              include: { categories: true },
              take: 12,
              orderBy: { updatedAt: "desc" },
            },
          },
          orderBy: { name: "asc" },
          take: 10,
        });

    // Serialize tag products for client components
    serializedTags = allTagsWithProducts.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      products: tag.products.map(serializeProduct),
    }));
  } catch (err) {
    console.warn("Home page: database queries skipped or unreachable:", err);
  }

  return (
    <div className="w-full space-y-16 pb-16">
      {/* Section 1: Hero */}
      <Hero />

      <div className="mx-auto w-full max-w-none px-4 sm:px-8 md:px-12 lg:px-16 space-y-16">
        {/* Section 2: Category Strip */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-ink">
              Browse Categories
            </h2>
            <Link href="/categories" className="text-xs font-bold text-gold hover:underline uppercase tracking-wider flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <CategoryStrip categories={categories} />
        </div>

        {/* Section 3: Featured Products */}
        {featuredBooks.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-ink">
                Featured Products
              </h2>
              <Link href="/products?featured=true" className="text-xs font-bold text-gold hover:underline uppercase tracking-wider flex items-center gap-1">
                Explore All <ArrowRight size={14} />
              </Link>
            </div>
            <BookGrid books={featuredBooks.map(serializeProduct)} />
          </div>
        )}

        {/* Section 4: School Books / Tag-Based Sections */}
        {serializedTags.length > 0 && (
          <TagSection
            title="School Books"
            subtitle="Browse textbooks and guides organized by school — Allied School, AR Science School, and more."
            tags={serializedTags}
          />
        )}

        {/* Section 5: New Arrivals */}
        {newArrivals.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-ink">
                New Arrivals
              </h2>
              <Link href="/products?sort=newest" className="text-xs font-bold text-gold hover:underline uppercase tracking-wider flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <BookGrid books={newArrivals.map(serializeProduct)} />
          </div>
        )}

        {/* Section 6: Promo Banner */}
        <div className="relative rounded-[var(--radius-card)] overflow-hidden bg-gradient-to-r from-gold-dim via-gold to-[#15A88C] p-8 sm:p-12 shadow-card">
          {/* Ambient overlays */}
          <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-badge bg-white text-gold font-bold px-2 py-0.5 rounded shadow">
              Special Promotion
            </span>
            <h3 className="font-display text-3xl sm:text-4xl italic text-white leading-tight">
              Back to School Deals
            </h3>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-lg">
              Get ready for the new academic year! Enjoy up to <span className="font-bold text-white">40% off</span> on school books, stationery, and sports items.
            </p>
            <div className="pt-2">
              <Link href="/products?on_sale=true">
                <Button className="bg-white text-gold hover:bg-white/90 font-bold shadow-lg">
                  Shop the Sale
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Section 7: Bestsellers */}
        {bestsellers.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-ink">
                Bestselling Products
              </h2>
              <Link href="/products?sort=best-selling" className="text-xs font-bold text-gold hover:underline uppercase tracking-wider flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <BookGrid books={bestsellers.map(serializeProduct)} />
          </div>
        )}

        {/* Section 8: About Strip (Statistics) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-border">
          {/* Col 1 */}
          <div className="flex flex-col items-center text-center p-6 bg-surface rounded-[var(--radius-card)] border border-border/40 shadow-sm space-y-3">
            <div className="p-3 bg-gold/10 rounded-full text-gold">
              <Package size={24} />
            </div>
            <h3 className="font-display text-3xl font-bold text-ink">
              <CountUp target={10000} suffix="+" />
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Products Available</p>
            <p className="text-xs text-muted leading-relaxed max-w-[200px]">
              Extensive catalog spanning books, stationery, sports equipment, and academic supplies.
            </p>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col items-center text-center p-6 bg-surface rounded-[var(--radius-card)] border border-border/40 shadow-sm space-y-3">
            <div className="p-3 bg-gold/10 rounded-full text-gold">
              <Truck size={24} />
            </div>
            <h3 className="font-display text-3xl font-bold text-ink">
              <CountUp target={24} suffix=" Hours" />
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Depalpur Delivery</p>
            <p className="text-xs text-muted leading-relaxed max-w-[200px]">
              Super-fast local shipping within Depalpur and quick courier shipping across Pakistan.
            </p>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col items-center text-center p-6 bg-surface rounded-[var(--radius-card)] border border-border/40 shadow-sm space-y-3">
            <div className="p-3 bg-gold/10 rounded-full text-gold">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-display text-3xl font-bold text-ink">
              <CountUp target={100} suffix="%" />
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Secure Checkout</p>
            <p className="text-xs text-muted leading-relaxed max-w-[200px]">
              100% secure payments via Stripe credit/debit card, or convenient Cash on Delivery (COD).
            </p>
          </div>
        </div>

        {/* Section 9: Newsletter */}
        <div className="bg-surface border border-border rounded-[var(--radius-card)] p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
            <Mail size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink">
              Stay Updated
            </h3>
            <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
              Subscribe to our newsletter for new arrivals, school book updates, exclusive deals, and seasonal promotions.
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="flex-grow bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] h-11 px-4 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 placeholder:text-faint"
              />
              <Button type="submit" variant="primary" className="h-11 px-6 rounded-[var(--radius-btn)] font-bold">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
