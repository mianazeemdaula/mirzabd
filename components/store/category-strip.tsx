// components/store/category-strip.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategoryVisual } from "@/lib/category-visuals";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Grid,
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


function CategoryCircleCard({
  category,
  isActive,
}: {
  category: CategoryItem;
  isActive: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const { icon: FallbackIcon, tone } = getCategoryVisual(category.name, category.slug);

  return (
    <Link
      href={`/products?category=${encodeURIComponent(category.slug)}`}
      className="group flex flex-col items-center flex-shrink-0 w-[76px] sm:w-[88px] focus:outline-none select-none transition-transform"
    >
      {/* 1. Circular Avatar Container */}
      <div
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] transition-all duration-300 ${
          isActive
            ? "border-2 border-gold shadow-[0_0_22px_rgba(27,95,181,0.35)] scale-105"
            : "border-2 border-border/80 group-hover:border-gold group-hover:shadow-[0_0_20px_rgba(27,95,181,0.25)] group-hover:-translate-y-1"
        }`}
      >
        <div className="w-full h-full rounded-full bg-white p-1 flex items-center justify-center relative overflow-hidden">
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
            <div
              className="w-full h-full rounded-full flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-300"
              style={{ background: tone.soft, color: tone.text }}
            >
              <FallbackIcon size={22} className="stroke-[1.8]" />
            </div>
          )}

          {/* Ambient inner rim glow on hover */}
          <div className="absolute inset-0 rounded-full bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </div>

      {/* 2. Bottom Line Title Container */}
      <div className="mt-2 flex flex-col items-center w-full px-0.5">
        {/* Title Text */}
        <span
          className={`text-[11px] sm:text-xs font-semibold text-center line-clamp-2 max-w-[76px] sm:max-w-[88px] leading-tight transition-colors duration-200 ${
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
              className="group flex flex-col items-center flex-shrink-0 w-[76px] sm:w-[88px] focus:outline-none select-none"
            >
              {/* Circle Avatar */}
              <div
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] transition-all duration-300 ${
                  !activeCategorySlug
                    ? "border-2 border-gold shadow-[0_0_22px_rgba(27,95,181,0.35)] scale-105"
                    : "border-2 border-border/80 group-hover:border-gold group-hover:shadow-[0_0_20px_rgba(27,95,181,0.25)] group-hover:-translate-y-1"
                }`}
              >
                <div className="w-full h-full rounded-full bg-white p-1 flex flex-col items-center justify-center relative overflow-hidden text-gold">
                  <Grid size={28} className="stroke-[1.8] group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted group-hover:text-gold mt-1">
                    Store
                  </span>
                  <div className="absolute inset-0 rounded-full bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              {/* Bottom Line Title */}
              <div className="mt-2 flex flex-col items-center w-full px-0.5">
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
