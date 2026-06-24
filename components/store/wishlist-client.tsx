// components/store/wishlist-client.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { BookGrid } from "@/components/store/book-grid";
import { serializeProduct } from "@/lib/utils";

interface WishlistClientProps {
  initialBooks: any[];
}

export function WishlistClient({ initialBooks }: WishlistClientProps) {
  const { wishlistItems, isLoading } = useWishlist(initialBooks);

  // Even if loading, if we have server-rendered initialBooks, display them!
  const displayBooks = wishlistItems.length > 0 ? wishlistItems : (isLoading ? [] : []);

  if (wishlistItems.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="p-3 bg-elevated rounded-full text-muted border border-border/40">
          <Heart size={32} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink">Your wishlist is empty</h4>
          <p className="text-xs text-muted mt-1 max-w-[240px]">
            Explore our collections and hit the heart icon to save your favorite products here.
          </p>
        </div>
        <Link href="/books">
          <button className="inline-flex items-center justify-center bg-gold hover:bg-gold-dim text-void font-bold transition-colors text-xs h-9 px-5 rounded-[var(--radius-btn)] cursor-pointer">
            Explore Shop
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-2">
      <BookGrid books={wishlistItems.map(serializeProduct)} />
    </div>
  );
}
export default WishlistClient;
