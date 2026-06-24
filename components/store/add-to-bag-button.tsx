// components/store/add-to-bag-button.tsx
"use client";

import React from "react";
import { toast } from "sonner";

interface AddToBagButtonProps {
  book: any;
  coverImage: string;
}

export function AddToBagButton({ book, coverImage }: AddToBagButtonProps) {
  return (
    <button
      onClick={() => {
        const addFn = (window as any).addToCartDirectly;
        if (typeof addFn === "function") {
          addFn(book, coverImage);
        } else {
          toast.error("Cart module is initializing. Please refresh.");
        }
      }}
      className="bg-gold hover:bg-gold-dim text-void font-bold px-8 h-12 rounded-[var(--radius-btn)] transition-colors inline-flex items-center gap-2 shadow-md hover:shadow-gold/15 cursor-pointer text-sm"
    >
      Add to Shopping Bag
    </button>
  );
}
export default AddToBagButton;
