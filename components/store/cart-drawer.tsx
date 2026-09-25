// components/store/cart-drawer.tsx
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ProductCover } from "@/components/store/product-cover";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/utils";
import { spring } from "@/lib/motion";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal, total, discount } = useCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm cursor-pointer"
          />

          {/* Cart Sidebar panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ ...spring.gentle }}
            className="fixed top-0 right-0 bottom-0 z-50 flex flex-col w-full max-w-[440px] bg-surface border-l border-border shadow-card"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-gold" />
                <h3 className="text-lg font-bold text-ink">Your Cart</h3>
                {items.length > 0 && (
                  <span className="bg-gold/15 text-gold text-xs px-2 py-0.5 rounded-full font-bold">
                    {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-elevated text-muted hover:text-ink transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="p-4 rounded-full bg-elevated border border-border/40 text-muted">
                    <ShoppingBag size={48} />
                  </div>
                  <h4 className="text-base font-semibold text-ink">Your cart is empty</h4>
                  <p className="text-xs text-muted max-w-[200px]">
                    Looks like you haven't added any books to your cart yet.
                  </p>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="primary"
                    className="px-6 text-xs h-9 rounded-[var(--radius-btn)]"
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-lg bg-elevated border border-border/50 relative group"
                  >
                    {/* Image */}
                    <div className="relative w-16 aspect-[2/3] flex-shrink-0 bg-surface rounded overflow-hidden">
                      <ProductCover
                    compact
                    name={item.name}
                    imageSrc={item.imageUrl && !item.imageUrl.includes("/images/placeholder") ? item.imageUrl : null}
                    sizes="80px"
                  />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="text-sm font-semibold text-ink leading-snug line-clamp-2 pr-6">
                          {item.name}
                        </h4>
                        {item.sku && (
                          <span className="text-[10px] text-muted font-mono block mt-0.5">
                            SKU: {item.sku}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Qty controls */}
                        <div className="flex items-center border border-border rounded-[var(--radius-btn)] overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 px-2 hover:bg-surface text-muted hover:text-ink transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2 text-xs font-semibold text-ink min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 px-2 hover:bg-surface text-muted hover:text-ink transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Prices */}
                        <div className="text-right">
                          <span className="text-sm font-bold text-gold block">
                            {formatPKR(item.price * item.quantity)}
                          </span>
                          {item.regularPrice > item.price && (
                            <span className="text-[10px] text-muted line-through">
                              {formatPKR(item.regularPrice * item.quantity)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2 right-2 text-muted hover:text-crimson transition-colors p-1 rounded hover:bg-surface opacity-0 group-hover:opacity-100 cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary (Sticky at bottom) */}
            {items.length > 0 && (
              <div className="p-5 border-t border-border bg-elevated space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted">
                    <span>Subtotal</span>
                    <span>{formatPKR(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-xs text-crimson font-medium">
                      <span>Discount</span>
                      <span>-{formatPKR(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-muted">
                    <span>Shipping</span>
                    <span className="italic">Calculated at checkout</span>
                  </div>
                  <hr className="border-border my-1" />
                  <div className="flex justify-between text-sm font-bold text-ink">
                    <span>Total</span>
                    <span className="text-gold font-mono">{formatPKR(total)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link href="/cart" className="w-full" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full text-xs h-11 rounded-[var(--radius-btn)] border-border hover:border-gold">
                      View Cart
                    </Button>
                  </Link>
                  <Link href="/checkout" className="w-full" onClick={() => setIsOpen(false)}>
                    <Button variant="primary" className="w-full text-xs h-11 rounded-[var(--radius-btn)] shadow-md hover:shadow-gold/20">
                      Checkout
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
export default CartDrawer;
