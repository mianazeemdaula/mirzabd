// components/store/product-image.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface ProductImageProps extends Omit<ImageProps, "src" | "onError"> {
  src?: string | null | any;
  fallbackSrc?: string;
}

export function ProductImage({
  src,
  alt,
  fallbackSrc = "/images/placeholder-product.jpg",
  className = "object-cover",
  ...props
}: ProductImageProps) {
  // Determine initial source
  let initialSrc = fallbackSrc;
  if (src) {
    if (typeof src === "string") {
      initialSrc = src;
    } else if (Array.isArray(src) && src.length > 0 && src[0]?.src) {
      initialSrc = src[0].src;
    } else if (typeof src === "object" && src.src) {
      initialSrc = src.src;
    }
  }

  const [imgSrc, setImgSrc] = useState<string>(initialSrc);

  // Sync state when src changes
  useEffect(() => {
    let nextSrc = fallbackSrc;
    if (src) {
      if (typeof src === "string") {
        nextSrc = src;
      } else if (Array.isArray(src) && src.length > 0 && src[0]?.src) {
        nextSrc = src[0].src;
      } else if (typeof src === "object" && src.src) {
        nextSrc = src.src;
      }
    }
    setImgSrc(nextSrc);
  }, [src, fallbackSrc]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || "Product image"}
      className={className}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}

export default ProductImage;
