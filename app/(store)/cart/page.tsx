// app/(store)/cart/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, total, discount } = useCart();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <ShoppingBag size={24} className="text-gold" />
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          Shopping Cart
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-surface border border-border rounded-[var(--radius-card)]">
          <div className="p-4 rounded-full bg-elevated border border-border/40 text-muted">
            <ShoppingBag size={48} />
          </div>
          <h2 className="text-xl font-bold text-ink">Your cart is currently empty</h2>
          <p className="text-sm text-muted max-w-md">
            Before you can proceed to checkout, you must add some products to your shopping cart. You will find a lot of interesting products on our shop page.
          </p>
          <div className="pt-2">
            <Link href="/books">
              <Button variant="primary" className="px-8 rounded-[var(--radius-btn)]">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart items list */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 p-4 bg-surface border border-border rounded-[var(--radius-card)] items-center"
              >
                {/* Image */}
                <div className="relative w-20 aspect-[2/3] bg-void rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={item.imageUrl || "/images/placeholder-book.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 text-center sm:text-left space-y-1 w-full">
                  <h3 className="text-base font-bold text-ink leading-snug line-clamp-2">
                    {item.name}
                  </h3>
                  {item.sku && (
                    <span className="text-[10px] text-muted font-mono block">
                      SKU: {item.sku}
                    </span>
                  )}
                  <span className="text-xs text-muted block">
                    Price: {formatPKR(item.price)}
                  </span>
                </div>

                {/* Quantity Editor */}
                <div className="flex items-center border border-border rounded-[var(--radius-btn)] overflow-hidden bg-elevated">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 px-3 hover:bg-surface text-muted hover:text-ink transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-sm font-semibold text-ink min-w-[36px] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 px-3 hover:bg-surface text-muted hover:text-ink transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Total and delete actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="text-right">
                    <span className="text-base font-bold text-gold block">
                      {formatPKR(item.price * item.quantity)}
                    </span>
                    {item.regularPrice > item.price && (
                      <span className="text-xs text-muted line-through">
                        {formatPKR(item.regularPrice * item.quantity)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-muted hover:text-crimson transition-colors p-2 rounded hover:bg-elevated cursor-pointer"
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {/* Back button */}
            <Link
              href="/books"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold hover:underline pt-2"
            >
              <ArrowLeft size={14} />
              Continue Shopping
            </Link>
          </div>

          {/* Cart Summary Panel */}
          <div className="lg:col-span-4 bg-surface border border-border p-6 rounded-[var(--radius-card)] space-y-6">
            <h3 className="font-display text-lg font-bold text-ink border-b border-border pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                <span>{formatPKR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-crimson font-semibold">
                  <span>Discount</span>
                  <span>-{formatPKR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="text-green-400 font-semibold">Calculated at checkout</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-base font-bold text-ink pt-1">
                <span>Total Amount</span>
                <span className="text-gold font-mono text-lg">{formatPKR(total)}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/checkout">
                <Button variant="primary" className="w-full h-12 rounded-[var(--radius-btn)] font-bold text-sm shadow-md hover:shadow-gold/15">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>

            {/* Guarantees info */}
            <div className="pt-4 border-t border-border space-y-2 text-[11px] text-muted leading-relaxed">
              <p>🔒 Secure payments via SSL encryption.</p>
              <p>📦 Delivery within 24 hours inside Depalpur city limits.</p>
              <p>🔄 Hassle-free 7-day exchange policy.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
