// components/store/category-grid.tsx
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Box, BookOpen, Layers } from "lucide-react";
import { fadeUp, stagger, scaleIn } from "@/lib/motion";

interface Category {
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

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger(0.08)}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {categories.map((category) => (
        <motion.div
          key={category.id}
          variants={scaleIn}
          className="group relative bg-surface border border-border hover:border-gold/30 rounded-[var(--radius-card)] overflow-hidden transition-all duration-300 shadow-card hover:shadow-gold-glow flex flex-col h-full"
        >
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Card Header & Content */}
          <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-badge text-gold bg-gold-glow/5 border border-gold/15 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 font-bold uppercase">
                  <Box size={10} /> Department
                </span>
                <span className="text-xs text-muted font-bold tracking-wide">
                  {category.productCount} {category.productCount === 1 ? "Product" : "Products"}
                </span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-ink group-hover:text-gold transition-colors duration-200">
                {category.name}
              </h3>
              <p className="text-sm text-muted line-clamp-3 leading-relaxed">
                {category.description || "Explore our premium selection of curated products and essentials."}
              </p>
            </div>

            {/* Bottom link CTA */}
            <div className="pt-2 flex items-center text-xs font-bold text-gold uppercase tracking-wider gap-1.5 group-hover:underline">
              Explore Department <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </div>

          {/* Link Overlay */}
          <Link href={`/categories/${category.slug}`} className="absolute inset-0 z-10">
            <span className="sr-only">View {category.name}</span>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
