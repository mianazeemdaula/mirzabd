// components/store/category-showcase.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getCategoryVisual } from "@/lib/category-visuals";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";

export interface ShowcaseCategory {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  count: number;
}

/** Compact, uniform department tiles — 16 departments fill 2 rows of 8 on desktop. */
export function CategoryShowcase({ categories }: { categories: ShowcaseCategory[] }) {
  return (
    <StaggerList
      className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3"
      staggerChildren={0.03}
    >
      {categories.slice(0, 16).map((cat) => {
        const { icon: Icon, tone } = getCategoryVisual(cat.name, cat.slug);
        return (
          <StaggerItem key={cat.id}>
            <Link
              href={`/products?category=${encodeURIComponent(cat.slug)}`}
              className="group flex h-full flex-col items-center gap-2 rounded-xl border border-border bg-white px-2 py-3.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[var(--shadow-card)]"
            >
              <span
                className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full transition-transform duration-200 group-hover:scale-105"
                style={{ background: tone.soft, color: tone.text }}
              >
                {cat.imageUrl ? (
                  <Image src={cat.imageUrl} alt="" fill sizes="44px" className="object-cover" unoptimized />
                ) : (
                  <Icon size={19} strokeWidth={1.9} />
                )}
              </span>
              <span className="text-xs font-semibold leading-snug text-ink line-clamp-2 group-hover:text-gold transition-colors">
                {cat.name}
              </span>
              <span className="mt-auto text-[10.5px] text-muted">{cat.count.toLocaleString()} items</span>
            </Link>
          </StaggerItem>
        );
      })}
    </StaggerList>
  );
}

export default CategoryShowcase;
