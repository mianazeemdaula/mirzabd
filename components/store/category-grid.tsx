// components/store/category-grid.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  GraduationCap,
  Scroll,
  Bookmark,
  Compass,
  Library,
  Search,
} from "lucide-react";
import { stagger, scaleIn } from "@/lib/motion";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  productCount: number;
}

interface CategoryGridProps {
  categories: Category[];
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

function CircularCategoryCard({ category }: { category: Category }) {
  const [imgError, setImgError] = useState(false);
  const FallbackIcon = getCategoryFallbackIcon(category.name, category.slug);

  return (
    <motion.div variants={scaleIn} className="w-full flex justify-center">
      <Link
        href={`/categories/${category.slug}`}
        className="group flex flex-col items-center w-full max-w-[180px] focus:outline-none select-none text-center"
      >
        {/* 1. Circular Avatar Container */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full p-[2.5px] border-2 border-border/80 group-hover:border-gold group-hover:shadow-[0_0_30px_rgba(232,168,62,0.4)] group-hover:-translate-y-2 transition-all duration-300">
          <div className="w-full h-full rounded-full bg-gradient-to-b from-elevated via-surface to-void p-3.5 sm:p-4 flex items-center justify-center relative overflow-hidden shadow-card">
            {category.imageUrl && !imgError ? (
              <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 160px"
                  className="object-contain p-1 rounded-full group-hover:scale-110 transition-transform duration-500 ease-out"
                  onError={() => setImgError(true)}
                  unoptimized={category.imageUrl.startsWith("http")}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gold group-hover:scale-110 transition-transform duration-300">
                <FallbackIcon size={42} className="stroke-[1.6]" />
              </div>
            )}

            {/* Inner radial halo on hover */}
            <div className="absolute inset-0 rounded-full bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </div>

        {/* 2. Bottom Line Title Container */}
        <div className="mt-4 flex flex-col items-center w-full px-2">
          {/* Title Text */}
          <h3 className="font-display text-sm sm:text-base md:text-lg font-bold text-ink group-hover:text-gold transition-colors duration-200 line-clamp-2 max-w-[140px] sm:max-w-[170px] leading-snug">
            {category.name}
          </h3>

          {/* Bottom Line Accent */}
          <div className="h-[2.5px] w-7 group-hover:w-16 bg-gold/45 group-hover:bg-gold transition-all duration-300 rounded-full mt-2" />

          {/* Product Count Badge */}
          <span className="text-[11px] text-muted font-semibold mt-2 px-2.5 py-0.5 rounded-full bg-surface border border-border/80 group-hover:border-gold/30 transition-colors">
            {category.productCount} {category.productCount === 1 ? "Product" : "Products"}
          </span>

          {/* Short description teaser if present */}
          {category.description && (
            <p className="text-[11px] text-muted/70 line-clamp-2 mt-1.5 hidden sm:block max-w-[160px]">
              {category.description}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const [search, setSearch] = useState("");

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 w-full">
      {/* Search & Filter Bar */}
      <div className="max-w-md mx-auto relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories & departments..."
          className="w-full bg-surface border border-border rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-ink focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 placeholder:text-faint transition-all shadow-sm"
        />
      </div>

      {/* Circular Categories Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface/50 border border-border rounded-[var(--radius-card)] max-w-lg mx-auto">
          <p className="text-sm text-muted">No categories match &quot;{search}&quot;</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger(0.04)}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8 md:gap-10 justify-items-center"
        >
          {filtered.map((category) => (
            <CircularCategoryCard key={category.id} category={category} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default CategoryGrid;
