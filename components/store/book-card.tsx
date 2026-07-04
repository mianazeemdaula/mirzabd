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
      <div className="group relative flex flex-col h-full bg-surface border border-border rounded-[var(--radius-card)] overflow-hidden transition-all duration-300 hover:border-gold/40 hover:shadow-card">
        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/60 text-muted hover:text-gold backdrop-blur-sm transition-colors border border-border/30 hover:border-gold/40 cursor-pointer"
          aria-label="Add to wishlist"
        >
          <Heart size={16} className={isWishlisted ? "fill-gold text-gold" : ""} />
        </button>

        {/* Sale badge */}
        {isSale && !isOutOfStock && (
          <div className="absolute top-3 left-3 z-20 bg-crimson text-ink font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow-md">
            Sale
          </div>
        )}

        {/* Out of stock badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center p-4">
            <span className="bg-border text-muted font-bold text-xs uppercase tracking-widest px-3 py-1 rounded border border-border">
              Out of Stock
            </span>
          </div>
        )}

        {/* Book cover image link */}
        <Link href={`/products/${book.slug}`} className="block relative aspect-[2/3] w-full overflow-hidden bg-elevated border-b border-border">
          <ProductImage
            src={coverImage}
            alt={book.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
          {/* Card Hover Actions Overlay */}
          {!isOutOfStock && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 px-4 z-10 pointer-events-none">
              <div className="w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 pointer-events-auto">
                <Button
                  onClick={handleAddToCart}
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2 text-xs py-2.5 rounded-[var(--radius-btn)]"
                >
                  <ShoppingCart size={14} />
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
        </Link>

        {/* Card Metadata info */}
        <div className="p-4 flex flex-col flex-grow space-y-2">
          {/* Author name */}
          {book.author ? (
            <span className="text-xs text-muted font-medium hover:text-gold transition-colors inline-flex items-center gap-1">
              <BookOpen size={11} className="text-gold/60" />
              {book.author}
            </span>
          ) : (
            <span className="text-xs text-muted">Unknown Author</span>
          )}

          {/* Book Title */}
          <Link href={`/products/${book.slug}`} className="block group-hover:text-gold transition-colors flex-grow">
            <h4 className="text-card-title text-ink font-semibold line-clamp-2 leading-tight">
              {book.name}
            </h4>
          </Link>

          {/* Review Stars if count > 0 */}
          {book.ratingCount > 0 && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <StarRating rating={book.averageRating} size={13} />
              <span className="text-[11px] text-muted">({book.ratingCount})</span>
            </div>
          )}

          {/* Pricing display */}
          <div className="pt-1 flex items-center justify-between">
            <PriceDisplay regularPrice={book.regularPrice} salePrice={book.salePrice} size="md" />
          </div>
        </div>
      </div>
    </BookCardHover>
  );
}
export default BookCard;
