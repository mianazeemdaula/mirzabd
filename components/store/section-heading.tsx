// components/store/section-heading.tsx
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeUp } from "@/components/motion/fade-up";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel = "View all",
  icon,
  className,
}: SectionHeadingProps) {
  return (
    <FadeUp className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-3", className)}>
      <div className="space-y-1 max-w-2xl">
        {eyebrow && (
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-gold">
            {icon}
            {eyebrow}
          </span>
        )}
        <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-ink leading-tight">
          {title}
        </h2>
        {subtitle && <p className="text-[13px] sm:text-sm text-muted leading-relaxed">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1.5 self-start sm:self-auto rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-ink transition-all hover:border-gold hover:text-gold"
        >
          {linkLabel}
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </FadeUp>
  );
}

export default SectionHeading;
