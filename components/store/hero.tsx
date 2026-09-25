// components/store/hero.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Search, ArrowRight, BadgePercent, Truck, Banknote, ShieldCheck } from "lucide-react";
import { spring, ease } from "@/lib/motion";
import { getCategoryVisual } from "@/lib/category-visuals";

interface HeroProps {
  productCount?: number;
  categoryCount?: number;
  dealCount?: number;
}

// Category showcase spines linked directly to catalog filters
const SHOWCASE = [
  { title: "Textbooks", slug: "school-and-college-books", height: 190, rotate: -5 },
  { title: "Notebooks", slug: "school-registers-and-account-books", height: 222, rotate: 3 },
  { title: "Stationery", slug: "school-stationery", height: 204, rotate: -2 },
  { title: "Bags", slug: "school-and-college-bags", height: 214, rotate: 4 },
  { title: "Art Supplies", slug: "art-materials", height: 238, rotate: -4 },
];

const QUICK_SEARCHES = ["Quran", "Past Papers", "Registers", "Geometry Box", "Urdu Novel"];

export function Hero({ productCount = 0, categoryCount = 0, dealCount = 0 }: HeroProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");

  const search = (q: string) => {
    const term = q.trim();
    router.push(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
  };

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: ease.expo },
  });

  const stats = [
    { value: productCount > 0 ? `${productCount.toLocaleString()}+` : "10,000+", label: "Products in stock" },
    { value: categoryCount > 0 ? String(categoryCount) : "16", label: "Departments" },
    { value: "1981", label: "Serving since" },
  ];

  return (
    <section className="theme-navy relative isolate overflow-hidden bg-navy-deep">
      {/* Brand backdrop */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_85%_10%,#1B5FB5_0%,transparent_55%),radial-gradient(90%_80%_at_0%_100%,#0A9BDB55_0%,transparent_60%),linear-gradient(160deg,#0E2A6B_0%,#081C4A_70%)]" />
      <div className="absolute inset-0 -z-10 bg-dots opacity-60" />
      <Image
        src="/images/logo.png"
        alt=""
        aria-hidden
        width={620}
        height={620}
        className="pointer-events-none absolute -right-40 -bottom-48 -z-10 w-[560px] opacity-[0.05] rotate-12 select-none"
      />

      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 md:px-12 lg:px-16 pt-8 pb-10 sm:pt-10 sm:pb-12 lg:pt-12 lg:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left: message, search, CTAs */}
          <div className="lg:col-span-7 space-y-5">
            <motion.div {...rise(0)}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1 text-[11px] font-semibold tracking-wide text-white/85 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
                Depalpur&apos;s trusted book depot · Est. 1981
              </span>
            </motion.div>

            {/* Urdu dialogue */}
            <motion.div {...rise(0.08)}>
              <h1 dir="rtl" lang="ur" className="font-urdu select-none space-y-1 sm:space-y-2 w-fit max-w-full">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-base sm:text-lg md:text-xl leading-loose">
                  <span className="text-white/60 font-normal">خزانہ کیسے ملا؟</span>
                  <span className="text-white/35 font-sans text-base" aria-hidden>←</span>
                  <span className="text-white font-semibold">علم حاصل کرنے سے</span>
                </span>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-base sm:text-lg md:text-xl leading-loose">
                  <span className="text-white/60 font-normal">علم کہاں سے ملا؟</span>
                  <span className="text-white/35 font-sans text-base" aria-hidden>←</span>
                  <span className="text-white font-semibold">کتابوں سے</span>
                </span>
                <span className="block h-px w-full max-w-xl bg-gradient-to-l from-amber/60 via-white/15 to-transparent my-1" aria-hidden />
                <span className="flex flex-wrap items-baseline gap-x-5 gap-y-1 pt-1">
                  <span className="text-white/85 text-lg sm:text-xl md:text-2xl font-medium leading-relaxed">
                    کتابیں کہاں سے ملیں؟
                  </span>
                  <span className="text-amber text-3xl sm:text-4xl md:text-[2.6rem] font-bold leading-relaxed drop-shadow-[0_4px_24px_rgba(245,165,36,0.35)]">
                    مرزا بک ڈپو سے
                  </span>
                </span>
              </h1>
            </motion.div>

            <motion.p {...rise(0.16)} className="max-w-xl text-sm sm:text-[15px] text-white/75 leading-relaxed">
              Textbooks, Quran &amp; Islamic books, past papers, stationery and school essentials,
              all under one roof and delivered across Pakistan.
            </motion.p>

            {/* Search */}
            <motion.form
              {...rise(0.22)}
              onSubmit={(e) => {
                e.preventDefault();
                search(query);
              }}
              className="max-w-xl"
              role="search"
            >
              <div className="flex items-center gap-2 rounded-xl bg-white p-1 pl-3.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/10 focus-within:ring-4 focus-within:ring-azure/40 transition-shadow">
                <Search size={18} className="shrink-0 text-[#5A6680]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search books, stationery, class or subject…"
                  aria-label="Search products"
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#0F1B35] placeholder:text-[#8A96AC] focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-[#1B5FB5] px-4 sm:px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#154A93] cursor-pointer"
                >
                  Search
                </button>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs">
                <span className="text-white/55">Popular:</span>
                {QUICK_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => search(term)}
                    className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-0.5 text-white/80 transition-colors hover:border-amber/60 hover:text-white cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.form>

            {/* CTAs */}
            <motion.div {...rise(0.28)} className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 rounded-xl bg-amber px-5 py-2.5 text-sm font-bold text-[#1F1300] shadow-[0_10px_30px_-10px_rgba(245,165,36,0.7)] transition-all hover:bg-[#FFB93F] hover:-translate-y-0.5"
              >
                Shop All Products
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/products?on_sale=true&sort=newest"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/[0.12] hover:border-white/40"
              >
                <BadgePercent size={16} className="text-amber" />
                {dealCount > 0 ? `${dealCount.toLocaleString()} Deals` : "View Deals"}
              </Link>
            </motion.div>
          </div>

          {/* Right: shelf of category spines + treasure sack */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute inset-0 bg-[radial-gradient(55%_50%_at_60%_60%,rgba(245,165,36,0.22)_0%,transparent_70%)]" aria-hidden />

              <div className="relative flex items-end justify-center gap-3 sm:gap-5">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } } }}
                  className="flex items-end gap-1.5 sm:gap-2"
                >
                  {SHOWCASE.map((item) => {
                    const { icon: Icon, tone } = getCategoryVisual(item.title, item.slug);
                    return (
                      <Link
                        key={item.slug}
                        href={`/products?category=${encodeURIComponent(item.slug)}`}
                        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded-lg"
                        aria-label={`Shop ${item.title}`}
                      >
                        <motion.div
                          variants={{
                            hidden: { y: reduceMotion ? 0 : 120, opacity: 0, rotate: 0 },
                            visible: {
                              y: 0,
                              opacity: 1,
                              rotate: item.rotate,
                              transition: { y: spring.gentle, opacity: { duration: 0.4 } },
                            },
                          }}
                          whileHover={{ y: -18, rotate: 0, transition: spring.snappy }}
                          className="relative flex w-10 sm:w-12 flex-col items-center justify-between rounded-md rounded-r-lg py-4 text-white shadow-[6px_10px_24px_rgba(0,0,0,0.45)] cursor-pointer"
                          style={{
                            height: `clamp(${Math.round(item.height * 0.6)}px, 18vw, ${Math.round(item.height * 0.82)}px)`,
                            background: `linear-gradient(90deg, ${tone.to} 0%, ${tone.from} 45%, ${tone.to} 100%)`,
                            transformOrigin: "bottom center",
                          }}
                        >
                          <span className="absolute inset-x-0 top-3 h-px bg-white/30" aria-hidden />
                          <span className="absolute inset-x-0 bottom-3 h-px bg-white/30" aria-hidden />
                          <Icon size={14} className="opacity-90" aria-hidden />
                          <span
                            className="font-display text-[10px] sm:text-[11px] font-bold tracking-wider"
                            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                          >
                            {item.title}
                          </span>
                          <span className="h-1.5 w-1.5 rounded-full bg-amber" aria-hidden />
                        </motion.div>
                      </Link>
                    );
                  })}
                </motion.div>

                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, y: reduceMotion ? 0 : [-6, 6, -6] }}
                  transition={{
                    scale: { duration: 0.8, delay: 0.2, ease: ease.expo },
                    opacity: { duration: 0.8, delay: 0.2 },
                    y: { duration: 4.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
                  }}
                  whileHover={{ scale: 1.06, transition: spring.snappy }}
                  className="relative w-28 sm:w-36 lg:w-40 xl:w-44 aspect-square shrink-0 select-none"
                >
                  <Image
                    src="/images/gold-coin-sack.png"
                    alt="Treasure sack of gold coins: knowledge is the real treasure"
                    fill
                    sizes="(max-width: 640px) 128px, 224px"
                    className="object-contain drop-shadow-[0_18px_30px_rgba(245,165,36,0.35)]"
                    priority
                  />
                </motion.div>
              </div>

              {/* Shelf */}
              <div className="relative mt-1 h-3 rounded-full bg-gradient-to-b from-white/25 to-white/5 shadow-[0_12px_24px_rgba(0,0,0,0.4)]" aria-hidden />
            </div>
          </div>
        </div>

        {/* Stats + service promises */}
        <motion.div
          {...rise(0.35)}
          className="mt-9 grid grid-cols-3 lg:grid-cols-6 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10"
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-navy-deep/80 px-4 py-3 sm:px-5">
              <div className="font-display text-lg sm:text-xl font-bold text-white">{s.value}</div>
              <div className="text-[11px] text-white/60">{s.label}</div>
            </div>
          ))}
          {[
            { icon: Truck, title: "24-Hour Delivery", text: "Within Depalpur" },
            { icon: Banknote, title: "Cash on Delivery", text: "Pay at your door" },
            { icon: ShieldCheck, title: "Secure Checkout", text: "Card or COD" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="hidden lg:flex items-center gap-3 bg-navy-deep/80 px-4 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-amber">
                <Icon size={17} />
              </span>
              <div>
                <div className="text-[13px] font-semibold text-white">{title}</div>
                <div className="text-[11px] text-white/60">{text}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
export default Hero;
