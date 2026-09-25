// components/store/product-rail.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BookCard } from "@/components/store/book-card";
import { cn } from "@/lib/utils";

interface ProductRailProps {
  books: React.ComponentProps<typeof BookCard>["book"][];
  className?: string;
}

/** Horizontally scrollable, snap-aligned product row with arrow controls. */
export function ProductRail({ books, className }: ProductRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (books.length === 0) return null;

  const arrow =
    "absolute top-[38%] -translate-y-1/2 z-10 hidden md:grid place-items-center h-11 w-11 rounded-full bg-white text-ink border border-border shadow-[var(--shadow-lift)] transition-all hover:bg-gold hover:text-white hover:border-gold cursor-pointer disabled:opacity-0 disabled:pointer-events-none";

  return (
    <div className={cn("relative", className)}>
      <button onClick={() => scrollBy(-1)} disabled={!canPrev} className={cn(arrow, "-left-4")} aria-label="Scroll left">
        <ChevronLeft size={20} />
      </button>

      <div
        ref={trackRef}
        className="no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 pt-1"
      >
        {books.map((book) => (
          <div key={book.id} className="snap-start shrink-0 w-[44%] sm:w-[30%] md:w-[23%] lg:w-[18.5%] xl:w-[15.5%]">
            <BookCard book={book} />
          </div>
        ))}
      </div>

      <button onClick={() => scrollBy(1)} disabled={!canNext} className={cn(arrow, "-right-4")} aria-label="Scroll right">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

export default ProductRail;
