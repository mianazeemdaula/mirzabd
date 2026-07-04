"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gold text-white hover:bg-gold-dim active:bg-gold-dim rounded-[var(--radius-btn)] font-semibold",
        ghost:
          "border border-border text-ink hover:border-gold hover:text-gold rounded-[var(--radius-btn)] bg-transparent",
        crimson:
          "bg-crimson text-white hover:bg-crimson-dim active:bg-crimson-dim rounded-[var(--radius-btn)] font-semibold",
        muted:
          "bg-elevated text-muted hover:text-ink hover:bg-elevated/80 rounded-[var(--radius-btn)]",
        link: "text-gold underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-[var(--radius-btn)]",
        md: "h-10 px-4 text-sm rounded-[var(--radius-btn)]",
        lg: "h-12 px-6 text-base rounded-[var(--radius-btn)]",
        xl: "h-14 px-8 text-base rounded-[var(--radius-btn)]",
        icon: "h-10 w-10 rounded-[var(--radius-btn)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "color">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
