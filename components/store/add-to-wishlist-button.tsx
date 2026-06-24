// components/store/add-to-wishlist-button.tsx
"use client";

import React from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";

interface AddToWishlistButtonProps {
  productId: number;
}

export function AddToWishlistButton({ productId }: AddToWishlistButtonProps) {
  const { hasItem, toggleWishlist } = useWishlist();
  const isWishlisted = hasItem(productId);

  return (
    <button
      onClick={() => toggleWishlist(productId)}
      className={`h-12 px-6 rounded-[var(--radius-btn)] border font-semibold text-sm transition-all duration-300 inline-flex items-center gap-2 cursor-pointer shadow-sm ${
        isWishlisted
          ? "border-gold bg-[rgba(232,168,62,0.1)] text-gold hover:bg-[rgba(232,168,62,0.15)]"
          : "border-border bg-surface text-ink hover:text-gold hover:border-gold/40 hover:bg-elevated"
      }`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart size={16} className={isWishlisted ? "fill-gold text-gold" : ""} />
      {isWishlisted ? "In Wishlist" : "Add to Wishlist"}
    </button>
  );
}
export default AddToWishlistButton;
