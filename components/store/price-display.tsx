// components/store/price-display.tsx
import React from "react";
import { formatPKR } from "@/lib/utils";

interface PriceDisplayProps {
  regularPrice: number | any;
  salePrice: number | any | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PriceDisplay({
  regularPrice: rawRegularPrice,
  salePrice: rawSalePrice,
  className = "",
  size = "md",
}: PriceDisplayProps) {
  const regularPrice = typeof rawRegularPrice === "object" && rawRegularPrice !== null && "toNumber" in rawRegularPrice
    ? (rawRegularPrice as any).toNumber()
    : Number(rawRegularPrice || 0);

  const salePrice = typeof rawSalePrice === "object" && rawSalePrice !== null && "toNumber" in rawSalePrice
    ? (rawSalePrice as any).toNumber()
    : rawSalePrice !== null ? Number(rawSalePrice) : null;

  const hasSale = salePrice !== null && salePrice < regularPrice;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  const discountPercent = hasSale
    ? Math.round(((regularPrice - salePrice!) / regularPrice) * 100)
    : 0;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {hasSale ? (
        <>
          <span className={`text-gold font-bold ${sizeClasses[size]}`}>
            {formatPKR(salePrice!)}
          </span>
          <span className="text-muted line-through text-xs sm:text-sm">
            {formatPKR(regularPrice)}
          </span>
          <span className="bg-crimson/15 text-crimson text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
            {discountPercent}% OFF
          </span>
        </>
      ) : (
        <span className={`text-ink font-semibold ${sizeClasses[size]}`}>
          {formatPKR(regularPrice)}
        </span>
      )}
    </div>
  );
}
export default PriceDisplay;
