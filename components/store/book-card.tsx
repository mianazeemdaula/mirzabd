// components/store/book-card.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Heart, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { PriceDisplay } from "@/components/store/price-display";
import { StarRating } from "@/components/store/star-rating";
import { ProductCover, getCoverSrc } from "@/components/store/product-cover";
import { cn } from "@/lib/utils";

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
    categories?: { name: string; slug: string }[];
  };
  className?: string;
}

export function BookCard({ book, className }: BookCardProps) {
  const { addItem, items } = useCart();
  const { hasItem, toggleWishlist } = useWishlist();

  const imageSrc = getCoverSrc(book.images);
  const category = book.categories?.[0] ?? null;

  const regular = Number(book.regularPrice);
  const sale = book.salePrice !== null ? Number(book.salePrice) : null;
  const isSale = sale !== null && sale < regular;
  const discount = isSale && regular > 0 ? Math.round(((regular - sale!) / regular) * 100) : 0;
  const isOutOfStock =
    book.stockStatus === "outofstock" ||
    (book.manageStock && book.stockQuantity !== null && book.stockQuantity <= 0);
  const inCart = items.some((i) => i.productId === book.id);
  const hasPrice = (sale ?? regular) > 0;
  const isWishlisted = hasItem(book.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("This item is currently out of stock");
      return;
    }

    addItem({
      id: `p-${book.id}`,
      productId: book.id,
      variationId: null,
      name: book.name,
      sku: null,
      price: sale !== null ? sale : regular,
      regularPrice: regular,
      imageUrl: imageSrc ?? "/images/placeholder-product.jpg",
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

  return (
    <div
      className={cn(
        "group relative flex flex-col h-full bg-white border border-border rounded-[var(--radius-card)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[var(--shadow-lift)]",
        className
      )}
    >
      {/* Cover */}
      <Link
        href={`/products/${book.slug}`}
        className="block relative aspect-[3/4] w-full overflow-hidden"
        aria-label={book.name}
      >
        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]">
          <ProductCover name={book.name} imageSrc={imageSrc} category={category} />
        </div>

        {isSale && !isOutOfStock && discount > 0 && (
          <span className="absolute top-2.5 left-2.5 z-10 rounded-full bg-crimson px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            -{discount}%
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75">
            <span className="rounded-full bg-ink/85 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Wishlist */}
      <button
        onClick={handleWishlistToggle}
        className={cn(
          "absolute top-2.5 right-2.5 z-20 grid place-items-center h-8 w-8 rounded-full bg-white shadow-sm transition-all cursor-pointer hover:scale-110",
          isWishlisted ? "text-crimson" : "text-muted hover:text-crimson"
        )}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart size={15} className={isWishlisted ? "fill-crimson" : ""} />
      </button>

      {/* Info */}
      <div className="flex flex-col flex-grow gap-1.5 p-3 sm:p-3.5">
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gold/90 truncate">
          {book.author || category?.name || "Mirza Book Depot"}
        </span>

        <Link href={`/products/${book.slug}`} className="flex-grow">
          <h3 className="text-[13px] sm:text-sm font-semibold text-ink leading-snug line-clamp-2 transition-colors group-hover:text-gold">
            {book.name}
          </h3>
        </Link>

        {book.ratingCount > 0 && (
          <div className="flex items-center gap-1">
            <StarRating rating={book.averageRating} size={11} />
            <span className="text-[10px] text-muted">({book.ratingCount})</span>
          </div>
        )}

        <div className="flex items-end justify-between gap-2 pt-1">
          <PriceDisplay regularPrice={book.regularPrice} salePrice={book.salePrice} size="sm" hideBadge />

          {!isOutOfStock && hasPrice && (
            <button
              onClick={handleAddToCart}
              className={cn(
                "shrink-0 grid place-items-center h-9 w-9 rounded-full transition-all cursor-pointer active:scale-90",
                inCart
                  ? "bg-emerald-600 text-white"
                  : "bg-gold/10 text-gold hover:bg-gold hover:text-white"
              )}
              aria-label={`Add ${book.name} to cart`}
              title="Add to cart"
            >
              {inCart ? <Check size={16} /> : <Plus size={17} strokeWidth={2.5} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
export default BookCard;
