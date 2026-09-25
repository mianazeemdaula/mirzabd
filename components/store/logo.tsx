// components/store/logo.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

interface LogoProps {
  variant?: "full" | "seal" | "text";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
}

export function Logo({
  variant = "full",
  size = "md",
  className,
  href = "/",
}: LogoProps) {
  const sizeMap = {
    sm: {
      sealPx: 34,
      sealClass: "w-8 h-8",
      textMirza: "text-base",
      textDepot: "text-base",
      sub: "text-[7.5px] tracking-[0.18em]",
    },
    md: {
      sealPx: 40,
      sealClass: "w-9 h-9 sm:w-10 sm:h-10",
      textMirza: "text-base sm:text-lg",
      textDepot: "text-base sm:text-lg",
      sub: "text-[7.5px] sm:text-[8px] tracking-[0.2em]",
    },
    lg: {
      sealPx: 68,
      sealClass: "w-16 h-16",
      textMirza: "text-xl sm:text-2xl",
      textDepot: "text-xl sm:text-2xl",
      sub: "text-[9.5px] sm:text-[10px] tracking-[0.22em]",
    },
  }[size];

  // User's custom seal logo image from public/images/logo.png
  const sealElement = (
    <div className={cn("relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105", sizeMap.sealClass)}>
      <Image
        src="/images/logo.png"
        alt={APP_NAME}
        width={sizeMap.sealPx}
        height={sizeMap.sealPx}
        priority
        className="w-full h-full object-contain"
      />
    </div>
  );

  if (variant === "seal") {
    if (!href) return <div className={cn("inline-flex", className)}>{sealElement}</div>;
    return (
      <Link href={href} className={cn("group inline-flex items-center", className)}>
        {sealElement}
      </Link>
    );
  }

  const content = (
    <div className={cn("flex items-center gap-2.5 sm:gap-3 group select-none", className)}>
      {sealElement}
      <div className="flex flex-col leading-none justify-center">
        <div className="flex items-baseline gap-1.5 font-display font-black tracking-tight">
          <span className={cn("text-ink tracking-wide font-extrabold", sizeMap.textMirza)}>MIRZA</span>
          <span className={cn("text-gold font-extrabold", sizeMap.textDepot)}>BOOK DEPOT</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="h-[1px] w-2.5 sm:w-3 bg-border" />
          <span className={cn("text-muted font-bold uppercase", sizeMap.sub)}>
            DEPALPUR • EST. 1981
          </span>
          <span className="h-[1px] w-2.5 sm:w-3 bg-border" />
        </div>
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-block group focus:outline-none">
      {content}
    </Link>
  );
}
