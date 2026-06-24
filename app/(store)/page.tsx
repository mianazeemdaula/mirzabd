// app/(store)/page.tsx
import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Truck, ShieldCheck, Mail } from "lucide-react";
import prisma from "@/lib/prisma";
import { Hero } from "@/components/store/hero";
import { CategoryStrip } from "@/components/store/category-strip";
import { BookGrid } from "@/components/store/book-grid";
import { CountUp } from "@/components/motion/count-up";
import { Button } from "@/components/ui/button";
import { serializeProduct } from "@/lib/utils";

export const revalidate = 60; // Revalidate page every minute

export default async function HomePage() {
  // Fetch active categories
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    take: 12,
  });

  // Fetch Featured Books
  const featuredBooks = await prisma.product.findMany({
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
  const newArrivals = await prisma.product.findMany({
    where: { status: "publish" },
    include: {
      categories: true,
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  // Fetch Bestsellers (sorted by total sales)
  const bestsellers = await prisma.product.findMany({
    where: { status: "publish" },
    include: {
      categories: true,
    },
    orderBy: { totalSales: "desc" },
    take: 4,
  });

  return (
    <div className="w-full space-y-16 pb-16">
      {/* Section 1: Hero */}
      <Hero />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
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

        {/* Section 3: Featured Books */}
        {featuredBooks.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-ink">
                Featured Products
              </h2>
              <Link href="/books?featured=true" className="text-xs font-bold text-gold hover:underline uppercase tracking-wider flex items-center gap-1">
                Explore All <ArrowRight size={14} />
              </Link>
            </div>
            <BookGrid books={featuredBooks.map(serializeProduct)} />
          </div>
        )}

        {/* Section 4: New Arrivals */}
        {newArrivals.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-ink">
                New Arrivals
              </h2>
              <Link href="/books?sort=newest" className="text-xs font-bold text-gold hover:underline uppercase tracking-wider flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <BookGrid books={newArrivals.map(serializeProduct)} />
          </div>
        )}

        {/* Section 5: Promo Banner */}
        <div className="relative rounded-[var(--radius-card)] overflow-hidden bg-gradient-to-r from-crimson-dim via-crimson to-[#5c1b12] p-8 sm:p-12 shadow-card">
          {/* Ambient overlays */}
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-badge bg-gold text-void font-bold px-2 py-0.5 rounded shadow">
              Special Promotion
            </span>
            <h3 className="font-display text-3xl sm:text-4xl italic text-ink leading-tight">
              Urdu & Islamic Literature Deals
            </h3>
            <p className="text-sm sm:text-base text-ink/80 leading-relaxed max-w-lg">
              Unlock the secrets of classic Urdu prose and profound Islamic history. Enjoy up to <span className="font-bold text-gold">40% off</span> on selected titles this month.
            </p>
            <div className="pt-2">
              <Link href="/books?category=urdu-literature,islamic-books&on_sale=true">
                <Button className="bg-gold text-void hover:bg-gold-dim font-bold shadow-lg hover:shadow-gold/10">
                  Shop the Sale
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Section 6: Bestsellers */}
        {bestsellers.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-ink">
                Bestselling Products
              </h2>
              <Link href="/books?sort=best-selling" className="text-xs font-bold text-gold hover:underline uppercase tracking-wider flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <BookGrid books={bestsellers.map(serializeProduct)} />
          </div>
        )}

        {/* Section 7: About Strip (Statistics) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-border">
          {/* Col 1 */}
          <div className="flex flex-col items-center text-center p-6 bg-surface rounded-[var(--radius-card)] border border-border/40 shadow-sm space-y-3">
            <div className="p-3 bg-gold/10 rounded-full text-gold">
              <BookOpen size={24} />
            </div>
            <h3 className="font-display text-3xl font-bold text-ink">
              <CountUp target={10000} suffix="+" />
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Curated Titles</p>
            <p className="text-xs text-muted leading-relaxed max-w-[200px]">
              Extensive catalog spanning local publications, academics, and international bestsellers.
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

        {/* Section 8: Newsletter (General Newsletter signup strip) */}
        <div className="bg-surface border border-border rounded-[var(--radius-card)] p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
            <Mail size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink">
              Join Our Literary Circle
            </h3>
            <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
              Sign up for our email newsletter and get early notices on author signings, Urdu poetry journals, and discount codes.
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
