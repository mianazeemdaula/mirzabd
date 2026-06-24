// components/store/filter-sidebar.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterSidebarProps {
  categories: {
    id: number;
    name: string;
    slug: string;
    count?: number;
  }[];
}

export function FilterSidebar({ categories }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state initialized from search params
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Sync state with URL params on load
  useEffect(() => {
    const cats = searchParams.get("category")?.split(",") || [];
    const min = searchParams.get("min_price") || "";
    const max = searchParams.get("max_price") || "";
    const langs = searchParams.get("language")?.split(",") || [];
    const stock = searchParams.get("in_stock") === "true";

    setSelectedCategories(cats.filter(Boolean));
    setMinPrice(min);
    setMaxPrice(max);
    setSelectedLanguages(langs.filter(Boolean));
    setInStockOnly(stock);
  }, [searchParams]);

  // Apply filters to URL
  const applyFilters = (updates: {
    categories?: string[];
    minPrice?: string;
    maxPrice?: string;
    languages?: string[];
    inStockOnly?: boolean;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    // Merge updates
    const finalCats = updates.categories !== undefined ? updates.categories : selectedCategories;
    const finalMin = updates.minPrice !== undefined ? updates.minPrice : minPrice;
    const finalMax = updates.maxPrice !== undefined ? updates.maxPrice : maxPrice;
    const finalLangs = updates.languages !== undefined ? updates.languages : selectedLanguages;
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

    // Languages
    if (finalLangs.length > 0) {
      params.set("language", finalLangs.join(","));
    } else {
      params.delete("language");
    }

    // In Stock
    if (finalStock) {
      params.set("in_stock", "true");
    } else {
      params.delete("in_stock");
    }

    // Reset pagination when filter changes
    params.delete("page");

    router.push(`/books?${params.toString()}`);
  };

  const handleCategoryChange = (slug: string) => {
    const next = selectedCategories.includes(slug)
      ? selectedCategories.filter((s) => s !== slug)
      : [...selectedCategories, slug];
    setSelectedCategories(next);
    applyFilters({ categories: next });
  };

  const handleLanguageChange = (lang: string) => {
    const next = selectedLanguages.includes(lang)
      ? selectedLanguages.filter((l) => l !== lang)
      : [...selectedLanguages, lang];
    setSelectedLanguages(next);
    applyFilters({ languages: next });
  };

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ minPrice, maxPrice });
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setSelectedLanguages([]);
    setInStockOnly(false);
    
    // Clear all filters from URL
    router.push("/books");
  };

  const languages = ["English", "Urdu", "Arabic", "Persian"];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 bg-surface border border-border p-5 rounded-[var(--radius-card)] sticky top-20 self-start space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2 font-bold text-ink">
          <Filter size={16} className="text-gold" />
          <span>Filters</span>
        </div>
        {(selectedCategories.length > 0 || minPrice || maxPrice || selectedLanguages.length > 0 || inStockOnly) && (
          <button
            onClick={handleClearAll}
            className="text-[11px] font-bold text-crimson hover:underline uppercase tracking-wide cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Categories</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center justify-between text-sm text-ink cursor-pointer hover:text-gold transition-colors"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.slug)}
                  onChange={() => handleCategoryChange(category.slug)}
                  className="rounded border-border bg-void text-gold focus:ring-gold focus:ring-offset-void focus:ring-1 h-4 w-4"
                />
                <span>{category.name}</span>
              </div>
              {category.count !== undefined && (
                <span className="text-[10px] text-muted">({category.count})</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Price Range (PKR)</h4>
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
          <Button type="submit" variant="ghost" className="w-full text-xs h-8 border-border hover:border-gold text-ink">
            Apply Price
          </Button>
        </form>
      </div>

      {/* Language Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Languages</h4>
        <div className="space-y-2">
          {languages.map((lang) => (
            <label
              key={lang}
              className="flex items-center gap-2 text-sm text-ink cursor-pointer hover:text-gold transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedLanguages.includes(lang.toLowerCase())}
                onChange={() => handleLanguageChange(lang.toLowerCase())}
                className="rounded border-border bg-void text-gold focus:ring-gold focus:ring-offset-void focus:ring-1 h-4 w-4"
              />
              <span>{lang}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stock Filter */}
      <div className="border-t border-border pt-4">
        <label className="flex items-center justify-between text-sm text-ink cursor-pointer hover:text-gold transition-colors">
          <span className="font-medium">In Stock Only</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              const val = e.target.checked;
              setInStockOnly(val);
              applyFilters({ inStockOnly: val });
            }}
            className="rounded border-border bg-void text-gold focus:ring-gold focus:ring-offset-void focus:ring-1 h-4 w-4"
          />
        </label>
      </div>
    </aside>
  );
}
export default FilterSidebar;
