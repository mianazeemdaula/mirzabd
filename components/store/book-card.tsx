// components/store/book-card.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ProductImage } from "@/components/store/product-image";
import { ShoppingCart, Heart, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { PriceDisplay } from "@/components/store/price-display";
import { StarRating } from "@/components/store/star-rating";
import { BookCardHover } from "@/components/motion/book-card-hover";
import { Button } from "@/components/ui/button";

interface BookCardProps {
  book: {
    id: number;
    name: string;
    slug: string;
    author: string | null;
    regularPrice: number;
    salePrice: number | null;
    stockQuantity: number | null;
    manageStock: boolean;
    stockStatus: string;
    averageRating: number;
    ratingCount: number;
    images: any; // array or JSON string
  };
}

export function BookCard({ book }: BookCardProps) {
  const { addItem } = useCart();
  const { hasItem, toggleWishlist } = useWishlist();

  // Handle parsing images
  let coverImage = "/images/placeholder-product.jpg";
  if (book.images) {
    try {
      const parsedImages = typeof book.images === "string" ? JSON.parse(book.images) : book.images;
      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        coverImage = parsedImages[0].src;
      }
    } catch (e) {
      coverImage = "/images/placeholder-product.jpg";
    }
  }

  const isSale = book.salePrice !== null && book.salePrice < book.regularPrice;
  const isOutOfStock = book.stockStatus === "outofstock" || (book.manageStock && book.stockQuantity !== null && book.stockQuantity <= 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("This item is currently out of stock");
      return;
    }

    // Add to Zustand Cart
    addItem({
      id: `p-${book.id}`,
      productId: book.id,
      variationId: null,
      name: book.name,
      sku: null,
      price: book.salePrice !== null ? Number(book.salePrice) : Number(book.regularPrice),
      regularPrice: Number(book.regularPrice),
      imageUrl: coverImage,
      stockQuantity: book.stockQuantity,
      manageStock: book.manageStock,
    });

    toast.success(`${book.name} added to cart!`);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(book.id);
  };

  const isWishlisted = hasItem(book.id);

  return (
    <BookCardHover className="h-full">
      <div className="group relative flex flex-col h-full bg-surface border border-border rounded-lg sm:rounded-[var(--radius-card)] overflow-hidden transition-all duration-300 hover:border-gold/40 hover:shadow-card">
        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/70 text-muted hover:text-gold backdrop-blur-sm transition-colors border border-border/30 hover:border-gold/40 cursor-pointer shadow-xs"
          aria-label="Add to wishlist"
        >
          <Heart size={13} className={isWishlisted ? "fill-gold text-gold" : ""} />
        </button>

        {/* Sale badge */}
        {isSale && !isOutOfStock && (
          <div className="absolute top-2 left-2 z-20 bg-crimson text-ink font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded shadow-xs">
            Sale
          </div>
        )}

        {/* Out of stock badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center p-3">
            <span className="bg-border text-muted font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-border">
              Out of Stock
            </span>
          </div>
        )}

        {/* Book cover image link */}
        <Link href={`/products/${book.slug}`} className="block relative aspect-[3/4] sm:aspect-[2/3] w-full overflow-hidden bg-elevated border-b border-border">
          <ProductImage
            src={coverImage}
            alt={book.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
          {/* Card Hover Actions Overlay */}
          {!isOutOfStock && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2.5 px-2.5 z-10 pointer-events-none">
              <div className="w-full transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 pointer-events-auto">
                <Button
                  onClick={handleAddToCart}
                  variant="primary"
                  className="w-full flex items-center justify-center gap-1.5 text-[11px] h-8 py-1 rounded-[var(--radius-btn)] font-semibold"
                >
                  <ShoppingCart size={13} />
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
        </Link>

        {/* Card Metadata info */}
        <div className="p-2.5 sm:p-3 flex flex-col flex-grow space-y-1 sm:space-y-1.5">
          {/* Author name */}
          {book.author ? (
            <span className="text-[10px] sm:text-[11px] text-muted font-medium hover:text-gold transition-colors inline-flex items-center gap-1 truncate">
              <BookOpen size={10} className="text-gold/70 shrink-0" />
              <span className="truncate">{book.author}</span>
            </span>
          ) : (
            <span className="text-[10px] sm:text-[11px] text-muted truncate">Unknown Author</span>
          )}

          {/* Book Title */}
          <Link href={`/products/${book.slug}`} className="block group-hover:text-gold transition-colors flex-grow">
            <h4 className="text-xs sm:text-[13px] text-ink font-semibold line-clamp-2 leading-snug">
              {book.name}
            </h4>
          </Link>

          {/* Review Stars if count > 0 */}
          {book.ratingCount > 0 && (
            <div className="flex items-center gap-1 pt-0.5">
              <StarRating rating={book.averageRating} size={11} />
              <span className="text-[10px] text-muted">({book.ratingCount})</span>
            </div>
          )}

          {/* Pricing display */}
          <div className="pt-0.5 flex items-center justify-between">
            <PriceDisplay regularPrice={book.regularPrice} salePrice={book.salePrice} size="sm" />
          </div>
        </div>
      </div>
    </BookCardHover>
  );
}
export default BookCard;
