// components/store/search-bar.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUiStore } from "@/store/ui";
import { ease } from "@/lib/motion";

export function SearchBar() {
  const router = useRouter();
  const { isSearchOpen, setSearchOpen } = useUiStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSearchOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 z-50 bg-void/80 backdrop-blur-md cursor-pointer"
          />

          {/* Search Header Drawer */}
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.35, ease: ease.expo }}
            className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border shadow-card px-4 py-6"
          >
            <div className="mx-auto max-w-3xl relative">
              <form onSubmit={handleSubmit} className="flex items-center relative">
                <Search size={22} className="absolute left-4 text-muted pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search books by title, author, publisher or ISBN..."
                  className="w-full bg-elevated border border-border text-ink text-base rounded-[var(--radius-btn)] h-14 pl-12 pr-12 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 placeholder:text-faint"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 p-1 text-muted hover:text-gold transition-colors rounded-full hover:bg-surface cursor-pointer"
                  aria-label="Close search overlay"
                >
                  <X size={20} />
                </button>
              </form>

              {/* Suggestions Helper */}
              <div className="mt-4 flex items-center justify-between text-xs text-muted">
                <span>Press Enter to search catalog</span>
                <span className="flex gap-2">
                  Try:{" "}
                  <button
                    onClick={() => {
                      setQuery("Peer-e-Kamil");
                      inputRef.current?.focus();
                    }}
                    className="text-gold hover:underline cursor-pointer"
                  >
                    Peer-e-Kamil
                  </button>
                  ,{" "}
                  <button
                    onClick={() => {
                      setQuery("Nemrah Ahmed");
                      inputRef.current?.focus();
                    }}
                    className="text-gold hover:underline cursor-pointer"
                  >
                    Nemrah Ahmed
                  </button>
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
export default SearchBar;
