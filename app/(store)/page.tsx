// app/(store)/page.tsx
import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Package,
  Truck,
  ShieldCheck,
  Mail,
  Flame,
  Sparkles,
  Star,
  LayoutGrid,
  TrendingUp,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { Hero } from "@/components/store/hero";
import { CategoryShowcase, type ShowcaseCategory } from "@/components/store/category-showcase";
import { BookGrid } from "@/components/store/book-grid";
import { ProductRail } from "@/components/store/product-rail";
import { SectionHeading } from "@/components/store/section-heading";
import { TagSection } from "@/components/store/tag-section";
import { NewsletterForm } from "@/components/store/newsletter-form";
import { CountUp } from "@/components/motion/count-up";
import { FadeUp } from "@/components/motion/fade-up";
import { getCategoryVisual } from "@/lib/category-visuals";
import { serializeProduct } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CONTAINER = "mx-auto w-full max-w-[1440px] px-4 sm:px-8 md:px-12 lg:px-16";
const productInclude = { categories: { select: { name: true, slug: true } } } as const;

/** Largest departments shown as scrollable rails, in order */
const RAIL_COUNT = 4;

export default async function HomePage() {
  let categories: ShowcaseCategory[] = [];
  let productCount = 0;
  let dealCount = 0;
  let maxDiscount = 0;
  let deals: any[] = [];
  let featured: any[] = [];
  let newArrivals: any[] = [];
  let bestsellers: any[] = [];
  let rails: { category: ShowcaseCategory; products: any[] }[] = [];
  let serializedTags: any[] = [];

  try {
    const [rawCategories, publishedCount, dealStats] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        include: { _count: { select: { products: { where: { status: "publish" } } } } },
        orderBy: { displayOrder: "asc" },
      }),
      prisma.product.count({ where: { status: "publish" } }),
      prisma.$queryRaw<{ n: bigint; maxPct: number | null }[]>`
        SELECT COUNT(*) AS n, MAX(ROUND((regularPrice - salePrice) / regularPrice * 100)) AS maxPct
        FROM products
        WHERE status = 'publish' AND regularPrice > 0 AND salePrice IS NOT NULL AND salePrice < regularPrice`,
    ]);

    productCount = publishedCount;
    dealCount = Number(dealStats[0]?.n ?? 0);
    maxDiscount = Number(dealStats[0]?.maxPct ?? 0);

    categories = rawCategories
      .map((c) => ({ id: c.id, name: c.name, slug: c.slug, imageUrl: c.imageUrl, count: c._count.products }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);

    // Deepest real discounts first
    const dealIds = await prisma.$queryRaw<{ id: number }[]>`
      SELECT id FROM products
      WHERE status = 'publish' AND regularPrice > 0 AND salePrice IS NOT NULL AND salePrice < regularPrice
      ORDER BY (regularPrice - salePrice) / regularPrice DESC, updatedAt DESC
      LIMIT 16`;
    const railCategories = categories.slice(0, RAIL_COUNT);

    const [dealRows, featuredRows, newRows, bestRows, railRows, tags] = await Promise.all([
      prisma.product.findMany({ where: { id: { in: dealIds.map((d) => d.id) } }, include: productInclude }),
      prisma.product.findMany({
        where: { status: "publish", isFeatured: true },
        include: productInclude,
        orderBy: { updatedAt: "desc" },
        take: 12,
      }),
      prisma.product.findMany({
        where: { status: "publish" },
        include: productInclude,
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      // Only meaningful once real sales exist
      prisma.product.findMany({
        where: { status: "publish", totalSales: { gt: 0 } },
        include: productInclude,
        orderBy: { totalSales: "desc" },
        take: 12,
      }),
      Promise.all(
        railCategories.map((cat) =>
          prisma.product.findMany({
            where: { status: "publish", categories: { some: { id: cat.id } } },
            include: productInclude,
            orderBy: { updatedAt: "desc" },
            take: 14,
          })
        )
      ),
      prisma.tag.findMany({
        where: { products: { some: { status: "publish" } } },
        include: {
          products: {
            where: { status: "publish" },
            include: productInclude,
            take: 12,
            orderBy: { updatedAt: "desc" },
          },
        },
        orderBy: { name: "asc" },
        take: 10,
      }),
    ]);

    const dealOrder = new Map(dealIds.map((d, i) => [d.id, i]));
    deals = dealRows.sort((a, b) => dealOrder.get(a.id)! - dealOrder.get(b.id)!).map(serializeProduct);
    featured = featuredRows.map(serializeProduct);
    newArrivals = newRows.map(serializeProduct);
    bestsellers = bestRows.map(serializeProduct);
    rails = railCategories.map((category, i) => ({ category, products: railRows[i].map(serializeProduct) }));
    serializedTags = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      products: tag.products.map(serializeProduct),
    }));
  } catch (err) {
    console.warn("Home page: database queries skipped or unreachable:", err);
  }

  const [firstRail, ...otherRails] = rails;

  const renderRail = (rail: (typeof rails)[number], tinted: boolean) => {
    const { icon: Icon, tone } = getCategoryVisual(rail.category.name, rail.category.slug);
    return (
      <section key={rail.category.id} className={tinted ? "bg-surface py-10 sm:py-12" : "py-10 sm:py-12"}>
        <div className={`${CONTAINER} space-y-5`}>
          <SectionHeading
            eyebrow={`${rail.category.count.toLocaleString()} products`}
            icon={
              <span className="grid h-5 w-5 place-items-center rounded-md" style={{ background: tone.soft, color: tone.text }}>
                <Icon size={12} />
              </span>
            }
            title={rail.category.name}
            href={`/products?category=${encodeURIComponent(rail.category.slug)}`}
            linkLabel={`Shop ${rail.category.name}`}
          />
          <ProductRail books={rail.products} />
        </div>
      </section>
    );
  };

  return (
    <div className="w-full">
      {/* 1. Hero */}
      <Hero productCount={productCount} categoryCount={categories.length} dealCount={dealCount} />

      {/* 2. Departments */}
      {categories.length > 0 && (
        <section className="py-10 sm:py-14">
          <div className={`${CONTAINER} space-y-6`}>
            <SectionHeading
              eyebrow={`${categories.length} departments`}
              icon={<LayoutGrid size={13} />}
              title="Shop by Department"
              href="/categories"
              linkLabel="All departments"
            />
            <CategoryShowcase categories={categories} />
          </div>
        </section>
      )}

      {/* 3. Deals */}
      {deals.length > 0 && (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF7E8] to-white py-10 sm:py-12">
          <div className="absolute inset-0 bg-dots-ink opacity-60" aria-hidden />
          <div className={`relative ${CONTAINER} space-y-5`}>
            <SectionHeading
              eyebrow={maxDiscount > 0 ? `Save up to ${maxDiscount}%` : "Limited offers"}
              icon={<Flame size={13} className="text-crimson" />}
              title="Today's Best Deals"
              subtitle={`${dealCount.toLocaleString()} products are on sale right now. Here are the biggest discounts.`}
              href="/products?on_sale=true"
              linkLabel="See all deals"
            />
            <ProductRail books={deals} />
          </div>
        </section>
      )}

      {/* 4. Featured (appears once products are marked featured in admin) */}
      {featured.length > 0 && (
        <section className="py-10 sm:py-12">
          <div className={`${CONTAINER} space-y-5`}>
            <SectionHeading
              eyebrow="Hand-picked"
              icon={<Star size={13} />}
              title="Featured Products"
              href="/products?featured=true"
            />
            <ProductRail books={featured} />
          </div>
        </section>
      )}

      {/* 5. Largest department */}
      {firstRail && renderRail(firstRail, featured.length > 0)}

      {/* 6. Promo banner */}
      <section className="py-4 sm:py-6">
        <div className={CONTAINER}>
          <FadeUp>
            <div className="theme-navy relative overflow-hidden rounded-3xl bg-navy p-7 sm:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(80%_120%_at_100%_0%,#1B5FB5_0%,transparent_60%),radial-gradient(60%_90%_at_0%_100%,#0A9BDB40_0%,transparent_60%)]" aria-hidden />
              <div className="absolute inset-0 bg-dots opacity-70" aria-hidden />
              <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] items-center">
                <div className="space-y-4 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#1F1300]">
                    <Sparkles size={12} /> Special Promotion
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-white">
                    Back to School Deals
                  </h3>
                  <p className="text-sm text-white/75 leading-relaxed max-w-lg">
                    Get ready for the new academic year! Enjoy up to{" "}
                    <span className="font-bold text-amber">40% off</span> on school books, stationery, and sports items.
                  </p>
                  <Link
                    href="/products?on_sale=true"
                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#0E2A6B] transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    Shop the Sale
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
                <div className="hidden lg:grid grid-cols-2 gap-3">
                  {categories.slice(0, 4).map((cat) => {
                    const { icon: Icon } = getCategoryVisual(cat.name, cat.slug);
                    return (
                      <Link
                        key={cat.id}
                        href={`/products?category=${encodeURIComponent(cat.slug)}&on_sale=true`}
                        className="group rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition-colors hover:bg-white/[0.12]"
                      >
                        <Icon size={20} className="text-amber" />
                        <p className="mt-3 text-sm font-bold text-white leading-snug line-clamp-2">{cat.name}</p>
                        <p className="mt-1 text-xs text-white/60 group-hover:text-white/80">Shop deals →</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* 7. More departments */}
      {otherRails.map((rail, i) => renderRail(rail, i % 2 === 0))}

      {/* 8. Tag-based school sections */}
      {serializedTags.length > 0 && (
        <section className="py-10 sm:py-12">
          <div className={CONTAINER}>
            <TagSection
              title="School Books"
              subtitle="Browse textbooks and guides organized by school — Allied School, AR Science School, and more."
              tags={serializedTags}
            />
          </div>
        </section>
      )}

      {/* 9. New arrivals */}
      {newArrivals.length > 0 && (
        <section className={otherRails.length % 2 === 1 ? "py-10 sm:py-12" : "bg-surface py-10 sm:py-12"}>
          <div className={`${CONTAINER} space-y-5`}>
            <SectionHeading
              eyebrow="Just added"
              icon={<Sparkles size={13} />}
              title="New Arrivals"
              subtitle="The latest additions to our shelves."
              href="/products?sort=newest"
            />
            <BookGrid books={newArrivals} />
          </div>
        </section>
      )}

      {/* 10. Bestsellers (appears once sales data exists) */}
      {bestsellers.length > 0 && (
        <section className="py-10 sm:py-12">
          <div className={`${CONTAINER} space-y-5`}>
            <SectionHeading
              eyebrow="Customer favourites"
              icon={<TrendingUp size={13} />}
              title="Bestselling Products"
              href="/products?sort=best-selling"
            />
            <ProductRail books={bestsellers} />
          </div>
        </section>
      )}

      {/* 11. Why shop with us */}
      <section className="py-10 sm:py-14">
        <div className={`${CONTAINER} space-y-6`}>
          <SectionHeading eyebrow="Why Mirza Book Depot" title="A neighbourhood bookshop, now online" className="justify-center text-center sm:flex-col sm:items-center" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Package,
                value: <CountUp target={productCount > 10000 ? productCount : 10000} suffix="+" />,
                label: "Products Available",
                text: "Extensive catalog spanning books, stationery, sports equipment, and academic supplies.",
              },
              {
                icon: Truck,
                value: <CountUp target={24} suffix=" Hours" />,
                label: "Depalpur Delivery",
                text: "Super-fast local shipping within Depalpur and quick courier shipping across Pakistan.",
              },
              {
                icon: ShieldCheck,
                value: <CountUp target={100} suffix="%" />,
                label: "Secure Checkout",
                text: "100% secure payments via Stripe credit/debit card, or convenient Cash on Delivery (COD).",
              },
            ].map(({ icon: Icon, value, label, text }, i) => (
              <FadeUp key={label} delay={i * 0.08}>
                <div className="group h-full rounded-[var(--radius-card)] border border-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/10 text-gold transition-colors group-hover:bg-gold group-hover:text-white">
                    <Icon size={22} />
                  </span>
                  <div className="mt-4 font-display text-2xl font-bold text-ink">{value}</div>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-gold">{label}</p>
                  <p className="mt-3 text-sm text-muted leading-relaxed">{text}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Newsletter */}
      <section className="pb-12 sm:pb-14">
        <div className={CONTAINER}>
          <FadeUp>
            <div className="theme-navy relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B5FB5] to-navy-deep p-7 sm:p-10">
              <div className="absolute inset-0 bg-dots opacity-70" aria-hidden />
              <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-start gap-4 max-w-xl">
                  <span className="hidden sm:grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-amber">
                    <Mail size={26} />
                  </span>
                  <div className="space-y-2">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white">Stay Updated</h3>
                    <p className="text-sm text-white/75 leading-relaxed">
                      Subscribe to our newsletter for new arrivals, school book updates, exclusive deals, and seasonal promotions.
                    </p>
                  </div>
                </div>
                <NewsletterForm />
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
