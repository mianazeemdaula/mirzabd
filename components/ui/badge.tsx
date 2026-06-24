import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-mono text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full transition-colors",
  {
    variants: {
      variant: {
        default: "bg-elevated text-muted",
        gold: "bg-gold/20 text-gold",
        crimson: "bg-crimson/20 text-crimson",
        green: "bg-green-900/30 text-green-400",
        blue: "bg-blue-900/30 text-blue-400",
        outline: "border border-border text-muted bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
