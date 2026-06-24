"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-ink"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            "flex h-10 w-full bg-elevated border border-border text-ink rounded-[var(--radius-btn)] px-3 py-2 text-sm",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink",
            "placeholder:text-faint",
            "focus:border-gold focus:ring-1 focus:ring-gold/30 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-200",
            error && "border-crimson focus:border-crimson focus:ring-crimson/30",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-crimson mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
