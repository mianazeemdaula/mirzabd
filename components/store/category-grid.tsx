// components/store/category-grid.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategoryVisual } from "@/lib/category-visuals";
import { motion } from "framer-motion";
import {
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


function CircularCategoryCard({ category }: { category: Category }) {
  const [imgError, setImgError] = useState(false);
  const { icon: FallbackIcon, tone } = getCategoryVisual(category.name, category.slug);

  return (
    <motion.div variants={scaleIn} className="w-full flex justify-center">
      <Link
        href={`/categories/${encodeURIComponent(category.slug)}`}
        className="group flex flex-col items-center w-full max-w-[150px] focus:outline-none select-none text-center"
      >
        {/* 1. Circular Avatar Container */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[2px] border-2 border-border/80 group-hover:border-gold group-hover:shadow-[0_0_20px_rgba(27,95,181,0.25)] group-hover:-translate-y-1 transition-all duration-300">
          <div className="w-full h-full rounded-full bg-white p-1 flex items-center justify-center relative overflow-hidden shadow-card">
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
              <div
              className="w-full h-full rounded-full flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-300"
              style={{ background: tone.soft, color: tone.text }}
            >
                <FallbackIcon size={30} className="stroke-[1.7]" />
              </div>
            )}

            {/* Inner radial halo on hover */}
            <div className="absolute inset-0 rounded-full bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </div>

        {/* 2. Bottom Line Title Container */}
        <div className="mt-3 flex flex-col items-center w-full px-1">
          {/* Title Text */}
          <h3 className="text-[13px] sm:text-sm font-semibold text-ink group-hover:text-gold transition-colors duration-200 line-clamp-2 max-w-[140px] leading-snug">
            {category.name}
          </h3>

          {/* Bottom Line Accent */}
          <div className="h-[2.5px] w-7 group-hover:w-16 bg-gold/45 group-hover:bg-gold transition-all duration-300 rounded-full mt-2" />

          {/* Product Count Badge */}
          <span className="text-[10.5px] text-muted font-medium mt-1.5 px-2 py-0.5 rounded-full bg-surface border border-border/80 group-hover:border-gold/30 transition-colors">
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
        <div className="text-center py-12 bg-surface/50 border border-border rounded-[var(--radius-card)] max-w-lg mx-auto">
          <p className="text-sm text-muted">No categories match &quot;{search}&quot;</p>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger(0.04)}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-3 gap-y-6 sm:gap-y-8 justify-items-center"
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
