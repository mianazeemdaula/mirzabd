// components/store/tag-section.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Tag, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BookCard } from "@/components/store/book-card";
import { stagger, fadeUp } from "@/lib/motion";

interface TagWithProducts {
  id: number;
  name: string;
  slug: string;
  products: any[];
}

interface TagSectionProps {
  title: string;
  subtitle?: string;
  tags: TagWithProducts[];
}

export function TagSection({ title, subtitle, tags }: TagSectionProps) {
  const [activeTag, setActiveTag] = useState<string>(tags[0]?.slug || "");

  const activeTagData = tags.find((t) => t.slug === activeTag);

  if (!tags || tags.length === 0) return null;

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-gold" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-ink">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-sm text-muted max-w-lg">{subtitle}</p>
          )}
        </div>
        <Link
          href="/products"
          className="text-xs font-bold text-gold hover:underline uppercase tracking-wider flex items-center gap-1 shrink-0"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>

      {/* Tag Pills */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = activeTag === tag.slug;
          return (
            <button
              key={tag.id}
              onClick={() => setActiveTag(tag.slug)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                isActive
                  ? "bg-gold text-white border-gold shadow-md"
                  : "bg-surface border-border text-muted hover:border-gold/50 hover:text-ink"
              }`}
            >
              {tag.name}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-elevated text-faint"
                }`}
              >
                {tag.products.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Product Grid with Animation */}
      <AnimatePresence mode="wait">
        {activeTagData && activeTagData.products.length > 0 && (
          <motion.div
            key={activeTag}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              {activeTagData.products.slice(0, 8).map((book: any) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* View More link for active tag */}
            {activeTagData.products.length > 8 && (
              <div className="flex justify-center pt-6">
                <Link
                  href={`/products?tag=${activeTag}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full border border-gold/30 text-sm font-semibold text-gold hover:bg-gold hover:text-white transition-all duration-200"
                >
                  View All {activeTagData.name} Products
                  <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state for active tag */}
      {activeTagData && activeTagData.products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Tag size={32} className="text-faint mb-3" />
          <p className="text-muted text-sm">
            No products tagged with "{activeTagData.name}" yet.
          </p>
        </div>
      )}
    </section>
  );
}

export default TagSection;
