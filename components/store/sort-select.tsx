// components/store/sort-select.tsx
"use client";

import React from "react";

interface SortSelectProps {
  sort: string;
}

export function SortSelect({ sort }: SortSelectProps) {
  return (
    <div className="relative">
      <select
        defaultValue={sort}
        onChange={(e) => {
          const val = e.target.value;
          const search = new URLSearchParams(window.location.search);
          search.set("sort", val);
          search.delete("page"); // reset page
          window.location.href = `/books?${search.toString()}`;
        }}
        className="bg-elevated border border-border text-ink text-xs rounded-[var(--radius-btn)] h-9 px-3 focus:outline-none focus:border-gold pr-8 cursor-pointer appearance-none"
      >
        <option value="default">Default sorting</option>
        <option value="newest">Newest arrivals</option>
        <option value="best-selling">Bestsellers</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-xs">▼</span>
    </div>
  );
}
