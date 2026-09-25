// components/store/filter-sidebar.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface FilterCategoryItem {
  id: number;
  name: string;
  slug: string;
  count?: number;
  _count?: { products: number };
}

interface FilterSidebarProps {
  categories: FilterCategoryItem[];
}

export function FilterSidebar({ categories }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state initialized from search params
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Sync state with URL params on load or change
  useEffect(() => {
    const rawCat = searchParams.get("category");
    const cats = rawCat ? rawCat.split(",") : [];
    const min = searchParams.get("min_price") || "";
    const max = searchParams.get("max_price") || "";
    const stock = searchParams.get("in_stock") === "true";

    setSelectedCategories(cats.map((c) => c.trim().toLowerCase()).filter(Boolean));
    setMinPrice(min);
    setMaxPrice(max);
    setInStockOnly(stock);
  }, [searchParams]);

  // Apply filters to URL
  const applyFilters = (updates: {
    categories?: string[];
    minPrice?: string;
    maxPrice?: string;
    inStockOnly?: boolean;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    // Merge updates
    const finalCats = updates.categories !== undefined ? updates.categories : selectedCategories;
    const finalMin = updates.minPrice !== undefined ? updates.minPrice : minPrice;
    const finalMax = updates.maxPrice !== undefined ? updates.maxPrice : maxPrice;
    const finalStock = updates.inStockOnly !== undefined ? updates.inStockOnly : inStockOnly;

    // Categories
    if (finalCats.length > 0) {
      params.set("category", finalCats.join(","));
    } else {
      params.delete("category");
    }

    // Min Price
    if (finalMin) {
      params.set("min_price", finalMin);
    } else {
      params.delete("min_price");
    }

    // Max Price
    if (finalMax) {
      params.set("max_price", finalMax);
    } else {
      params.delete("max_price");
    }

    // In Stock
    if (finalStock) {
      params.set("in_stock", "true");
    } else {
      params.delete("in_stock");
    }

    // Reset pagination when filter changes
    params.delete("page");

    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (slug: string) => {
    const lowerSlug = slug.toLowerCase();
    const next = selectedCategories.includes(lowerSlug)
      ? selectedCategories.filter((s) => s !== lowerSlug)
      : [...selectedCategories, lowerSlug];
    setSelectedCategories(next);
    applyFilters({ categories: next });
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ minPrice, maxPrice });
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    
    // Clear all filters from URL
    router.push("/products");
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    c.slug.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    inStockOnly;

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 bg-surface border border-border p-5 rounded-[var(--radius-card)] sticky top-20 self-start space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2 font-bold text-ink">
          <Filter size={16} className="text-gold" />
          <span>Filters</span>
          {selectedCategories.length > 0 && (
            <span className="text-[10px] font-bold bg-gold/15 text-gold border border-gold/30 px-2 py-0.5 rounded-full">
              {selectedCategories.length} active
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-[11px] font-bold text-crimson hover:underline uppercase tracking-wide cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Category Filter with Real Product Counts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Categories
          </h4>
          <span className="text-[10px] text-faint">
            {categories.length} total
          </span>
        </div>

        {/* Quick search input for categories */}
        {categories.length > 8 && (
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Search category..."
              className="w-full bg-elevated/70 border border-border rounded-[var(--radius-btn)] pl-8 pr-2.5 py-1 text-xs text-ink placeholder:text-faint focus:outline-none focus:border-gold"
            />
          </div>
        )}

        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {filteredCategories.length === 0 ? (
            <p className="text-xs text-muted py-2 text-center">No categories found</p>
          ) : (
            filteredCategories.map((category) => {
              const count =
                category.count !== undefined
                  ? category.count
                  : (category as any)._count?.products ?? 0;
              const isSelected = selectedCategories.includes(category.slug.toLowerCase());

              return (
                <label
                  key={category.id}
                  className={`group flex items-center justify-between text-xs sm:text-sm cursor-pointer px-2 py-1.5 rounded-[var(--radius-btn)] transition-all select-none ${
                    isSelected
                      ? "bg-gold/15 text-gold font-semibold"
                      : "text-ink hover:text-gold hover:bg-elevated/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCategoryChange(category.slug)}
                      className="rounded border-border bg-void text-gold focus:ring-gold focus:ring-1 h-4 w-4 cursor-pointer flex-shrink-0"
                    />
                    <span className="truncate leading-tight">{category.name}</span>
                  </div>

                  {/* Real Count Badge */}
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex-shrink-0 transition-colors ${
                      isSelected
                        ? "bg-gold text-void font-bold border-gold"
                        : "bg-elevated text-muted border-border group-hover:border-gold/40 group-hover:text-gold"
                    }`}
                  >
                    {count.toLocaleString()}
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3 border-t border-border pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Price Range (PKR)
        </h4>
        <form onSubmit={handlePriceSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-elevated border border-border text-ink text-xs rounded-[var(--radius-btn)] h-9 px-2.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 placeholder:text-faint"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-elevated border border-border text-ink text-xs rounded-[var(--radius-btn)] h-9 px-2.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 placeholder:text-faint"
            />
          </div>
          <Button
            type="submit"
            variant="ghost"
            className="w-full text-xs h-8 border border-border hover:border-gold text-ink"
          >
            Apply Price
          </Button>
        </form>
      </div>

      {/* Stock Filter */}
      <div className="border-t border-border pt-4">
        <label className="flex items-center justify-between text-xs sm:text-sm text-ink cursor-pointer hover:text-gold transition-colors select-none">
          <span className="font-medium">In Stock Only</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              const val = e.target.checked;
              setInStockOnly(val);
              applyFilters({ inStockOnly: val });
            }}
            className="rounded border-border bg-void text-gold focus:ring-gold focus:ring-1 h-4 w-4"
          />
        </label>
      </div>
    </aside>
  );
}

export default FilterSidebar;
