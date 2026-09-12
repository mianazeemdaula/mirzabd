// components/store/category-strip.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  GraduationCap,
  Scroll,
  Bookmark,
  Compass,
  Grid,
  Library,
} from "lucide-react";
import { scaleIn, stagger } from "@/lib/motion";

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  count?: number;
}

interface CategoryStripProps {
  categories: CategoryItem[];
  activeCategorySlug?: string | null;
}

// Helper to determine a thematic icon when no logo/image is provided
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

function CategoryCircleCard({
  category,
  isActive,
}: {
  category: CategoryItem;
  isActive: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const FallbackIcon = getCategoryFallbackIcon(category.name, category.slug);

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group flex flex-col items-center flex-shrink-0 w-24 sm:w-28 md:w-32 focus:outline-none select-none transition-transform"
    >
      {/* 1. Circular Avatar Container */}
      <div
        className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full p-[2px] transition-all duration-300 ${
          isActive
            ? "border-2 border-gold shadow-[0_0_22px_rgba(232,168,62,0.45)] scale-105"
            : "border-2 border-border/80 group-hover:border-gold group-hover:shadow-[0_0_20px_rgba(232,168,62,0.3)] group-hover:-translate-y-1.5"
        }`}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-b from-elevated via-surface to-void p-2.5 flex items-center justify-center relative overflow-hidden">
          {category.imageUrl && !imgError ? (
            <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                className="object-contain p-1 rounded-full group-hover:scale-110 transition-transform duration-500 ease-out"
                onError={() => setImgError(true)}
                unoptimized={category.imageUrl.startsWith("http")}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gold group-hover:scale-110 transition-transform duration-300">
              <FallbackIcon size={30} className="stroke-[1.6]" />
            </div>
          )}

          {/* Ambient inner rim glow on hover */}
          <div className="absolute inset-0 rounded-full bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </div>

      {/* 2. Bottom Line Title Container */}
      <div className="mt-3 flex flex-col items-center w-full px-1">
        {/* Title Text */}
        <span
          className={`text-xs sm:text-sm font-semibold text-center line-clamp-2 max-w-[90px] sm:max-w-[110px] leading-tight transition-colors duration-200 ${
            isActive ? "text-gold font-bold" : "text-ink/90 group-hover:text-gold"
          }`}
        >
          {category.name}
        </span>

        {/* Bottom Line Accent */}
        <div
          className={`h-[2px] rounded-full transition-all duration-300 mt-1.5 ${
            isActive
              ? "w-10 bg-gold shadow-[0_0_8px_rgba(232,168,62,0.6)]"
              : "w-5 group-hover:w-10 bg-gold/40 group-hover:bg-gold"
          }`}
        />

        {/* Optional Item Count */}
        {category.count !== undefined && (
          <span className="text-[10px] text-muted font-medium mt-1">
            {category.count} {category.count === 1 ? "item" : "items"}
          </span>
        )}
      </div>
    </Link>
  );
}

export function CategoryStrip({
  categories,
  activeCategorySlug = null,
}: CategoryStripProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -320 : 320;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="relative w-full py-2 group/slider">
      {/* Left scroll navigation arrow */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll("left")}
          aria-label="Scroll left"
          className="absolute -left-2 sm:-left-4 top-1/3 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-elevated/90 border border-gold/40 text-gold hover:bg-gold hover:text-void shadow-lg backdrop-blur-sm flex items-center justify-center transition-all cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Right scroll navigation arrow */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => handleScroll("right")}
          aria-label="Scroll right"
          className="absolute -right-2 sm:-right-4 top-1/3 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-elevated/90 border border-gold/40 text-gold hover:bg-gold hover:text-void shadow-lg backdrop-blur-sm flex items-center justify-center transition-all cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Horizontal Scrollable Circular Categories Track */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="w-full overflow-x-auto no-scrollbar scroll-smooth py-3 px-2 sm:px-4"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger(0.04)}
          className="flex items-start gap-4 sm:gap-6 md:gap-8 min-w-max pb-2"
        >
          {/* 1. "All Products / Categories" Circle */}
          <motion.div variants={scaleIn}>
            <Link
              href="/products"
              className="group flex flex-col items-center flex-shrink-0 w-24 sm:w-28 md:w-32 focus:outline-none select-none"
            >
              {/* Circle Avatar */}
              <div
                className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full p-[2px] transition-all duration-300 ${
                  !activeCategorySlug
                    ? "border-2 border-gold shadow-[0_0_22px_rgba(232,168,62,0.45)] scale-105"
                    : "border-2 border-border/80 group-hover:border-gold group-hover:shadow-[0_0_20px_rgba(232,168,62,0.3)] group-hover:-translate-y-1.5"
                }`}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-b from-elevated via-surface to-void p-2.5 flex flex-col items-center justify-center relative overflow-hidden text-gold">
                  <Grid size={28} className="stroke-[1.8] group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted group-hover:text-gold mt-1">
                    Store
                  </span>
                  <div className="absolute inset-0 rounded-full bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              {/* Bottom Line Title */}
              <div className="mt-3 flex flex-col items-center w-full px-1">
                <span
                  className={`text-xs sm:text-sm font-semibold text-center leading-tight transition-colors duration-200 ${
                    !activeCategorySlug ? "text-gold font-bold" : "text-ink/90 group-hover:text-gold"
                  }`}
                >
                  All Products
                </span>

                <div
                  className={`h-[2px] rounded-full transition-all duration-300 mt-1.5 ${
                    !activeCategorySlug
                      ? "w-10 bg-gold shadow-[0_0_8px_rgba(232,168,62,0.6)]"
                      : "w-5 group-hover:w-10 bg-gold/40 group-hover:bg-gold"
                  }`}
                />

                <span className="text-[10px] text-muted font-medium mt-1">
                  Browse All
                </span>
              </div>
            </Link>
          </motion.div>

          {/* 2. Dynamic Categories in Circular Form with Bottom Line Title */}
          {categories.map((category) => (
            <motion.div key={category.id} variants={scaleIn}>
              <CategoryCircleCard
                category={category}
                isActive={activeCategorySlug === category.slug}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default CategoryStrip;
