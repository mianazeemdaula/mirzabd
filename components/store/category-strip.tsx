// components/store/category-strip.tsx
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { slideRight } from "@/lib/motion";

interface CategoryStripProps {
  categories: {
    id: number;
    name: string;
    slug: string;
    count?: number;
  }[];
  activeCategorySlug?: string | null;
}

export function CategoryStrip({ categories, activeCategorySlug = null }: CategoryStripProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar scroll-smooth py-3 px-1">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.05,
            },
          },
        }}
        className="flex items-center gap-3 whitespace-nowrap min-w-max"
      >
        {/* "All" Category Pill */}
        <motion.div variants={slideRight}>
          <Link
            href="/products"
            className={`inline-block rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
              !activeCategorySlug
                ? "bg-gold/10 border-gold text-gold glow-gold"
                : "bg-surface border-border text-muted hover:border-gold/50 hover:text-ink"
            }`}
          >
            All Products
          </Link>
        </motion.div>

        {/* Dynamic Category Pills */}
        {categories.map((category) => {
          const isActive = activeCategorySlug === category.slug;
          return (
            <motion.div key={category.id} variants={slideRight}>
              <Link
                href={`/products?category=${category.slug}`}
                className={`inline-block rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? "bg-gold/10 border-gold text-gold glow-gold"
                    : "bg-surface border-border text-muted hover:border-gold/50 hover:text-ink"
                }`}
              >
                {category.name}
                {category.count !== undefined && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] ${
                    isActive ? "bg-gold text-white" : "bg-elevated text-faint"
                  }`}>
                    {category.count}
                  </span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
export default CategoryStrip;
