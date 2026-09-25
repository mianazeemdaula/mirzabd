// components/store/price-display.tsx
import React from "react";
import { formatPKR } from "@/lib/utils";

interface PriceDisplayProps {
  regularPrice: number | any;
  salePrice: number | any | null;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Hide the "% OFF" pill (e.g. when the card already shows a discount badge) */
  hideBadge?: boolean;
}

export function PriceDisplay({
  regularPrice: rawRegularPrice,
  salePrice: rawSalePrice,
  className = "",
  size = "md",
  hideBadge = false,
}: PriceDisplayProps) {
  const regularPrice = typeof rawRegularPrice === "object" && rawRegularPrice !== null && "toNumber" in rawRegularPrice
    ? (rawRegularPrice as any).toNumber()
    : Number(rawRegularPrice || 0);

  const salePrice = typeof rawSalePrice === "object" && rawSalePrice !== null && "toNumber" in rawSalePrice
    ? (rawSalePrice as any).toNumber()
    : rawSalePrice !== null ? Number(rawSalePrice) : null;

  const hasSale = salePrice !== null && salePrice < regularPrice;

  const sizeClasses = {
    sm: "text-xs sm:text-sm",
    md: "text-sm sm:text-base",
    lg: "text-lg sm:text-xl",
  };

  // Some synced products have no price yet
  if (regularPrice <= 0 && !(salePrice !== null && salePrice > 0)) {
    return (
      <span className={`text-muted font-semibold text-xs sm:text-[13px] ${className}`}>Price on request</span>
    );
  }

  const discountPercent = hasSale
    ? Math.round(((regularPrice - salePrice!) / regularPrice) * 100)
    : 0;

  return (
    <div className={`flex flex-wrap items-baseline gap-x-1.5 gap-y-0 ${className}`}>
      {hasSale ? (
        <>
          <span className={`text-ink font-extrabold ${sizeClasses[size]}`}>
            {formatPKR(salePrice!)}
          </span>
          <span className="text-muted line-through text-[10px] sm:text-xs">
            {formatPKR(regularPrice)}
          </span>
          {!hideBadge && (
            <span className="bg-crimson/10 text-crimson text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
              {discountPercent}% OFF
            </span>
          )}
        </>
      ) : (
        <span className={`text-ink font-extrabold ${sizeClasses[size]}`}>
          {formatPKR(regularPrice)}
        </span>
      )}
    </div>
  );
}
export default PriceDisplay;
