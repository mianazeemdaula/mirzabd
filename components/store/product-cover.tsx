// components/store/product-cover.tsx
// Shows the product photo when there is one; otherwise renders a designed, category-colored
// cover with the product name, so a catalog without photos still looks intentional.
import React from "react";
import { ProductImage } from "@/components/store/product-image";
import { getCategoryVisual } from "@/lib/category-visuals";
import { cn } from "@/lib/utils";

interface ProductCoverProps {
  name: string;
  imageSrc?: string | null;
  category?: { name: string; slug: string } | null;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  /** Thumbnail mode (cart, checkout): color + icon only, no text */
  compact?: boolean;
}

/** First image src from a product's `images` JSON (array or string), or null. */
export function getCoverSrc(images: unknown): string | null {
  try {
    const parsed = typeof images === "string" ? JSON.parse(images) : images;
    if (Array.isArray(parsed) && typeof parsed[0]?.src === "string" && parsed[0].src) {
      return parsed[0].src;
    }
  } catch {
    // invalid JSON — treat as no image
  }
  return null;
}

export function ProductCover({
  name,
  imageSrc,
  category,
  sizes = "(max-width: 640px) 50vw, 20vw",
  priority = false,
  className,
  imageClassName = "object-cover",
  compact = false,
}: ProductCoverProps) {
  if (imageSrc) {
    return (
      <div className={cn("relative w-full h-full bg-elevated", className)}>
        <ProductImage src={imageSrc} alt={name} fill sizes={sizes} priority={priority} className={imageClassName} />
      </div>
    );
  }

  const { icon: Icon, tone } = getCategoryVisual(category?.name, category?.slug);

  if (compact) {
    return (
      <div
        className={cn("relative grid w-full h-full place-items-center overflow-hidden", className)}
        style={{ background: `linear-gradient(150deg, ${tone.from} 0%, ${tone.to} 100%)` }}
        role="img"
        aria-label={name}
      >
        <div className="absolute inset-y-0 left-0 w-[8%] bg-black/20" />
        <Icon className="w-2/5 h-auto text-white/85" strokeWidth={1.75} aria-hidden />
      </div>
    );
  }

  return (
    <div
      className={cn("@container relative w-full h-full overflow-hidden select-none", className)}
      style={{ background: `linear-gradient(150deg, ${tone.from} 0%, ${tone.to} 100%)` }}
      role="img"
      aria-label={name}
    >
      {/* Texture + light */}
      <div className="absolute inset-0 bg-dots opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_90%_0%,rgba(255,255,255,0.22)_0%,transparent_70%)]" />

      {/* Spine */}
      <div className="absolute inset-y-0 left-0 w-[7%] bg-black/20 shadow-[inset_-1px_0_0_rgba(255,255,255,0.15)]" />

      {/* Watermark icon */}
      <Icon
        className="absolute -bottom-[8%] -right-[10%] w-[62%] h-auto text-white/[0.13] rotate-[-12deg]"
        strokeWidth={1.25}
        aria-hidden
      />

      <div className="relative h-full flex flex-col pl-[14%] pr-[9%] pt-[24%] pb-[9%]">
        {category?.name && (
          <span className="text-[9px] @[180px]:text-[10px] @[320px]:text-xs font-bold uppercase tracking-[0.14em] text-white/70 line-clamp-1">
            {category.name}
          </span>
        )}
        <span className="mt-2 h-[2px] w-6 @[320px]:w-10 rounded-full bg-amber" />

        <p className="mt-3 font-display font-bold text-white leading-snug line-clamp-4 text-[13px] @[180px]:text-[15px] @[260px]:text-lg @[380px]:text-2xl @[520px]:text-3xl [text-wrap:balance]">
          {name}
        </p>

        <div className="mt-auto flex items-center gap-1.5 text-white/60">
          <Icon className="w-3.5 h-3.5 @[320px]:w-4 @[320px]:h-4" strokeWidth={2} aria-hidden />
          <span className="text-[9px] @[320px]:text-[11px] font-bold tracking-[0.2em]">MBD</span>
        </div>
      </div>
    </div>
  );
}

export default ProductCover;
