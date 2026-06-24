// hooks/use-cart.ts
"use client";

import { useEffect, useState } from "react";
import { useCartStore, CartItem } from "@/store/cart";

export function useCart() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const setIsOpen = useCartStore((state) => state.setIsOpen);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getDiscount = useCartStore((state) => state.getDiscount);
  const getTotal = useCartStore((state) => state.getTotal);

  return {
    items: isMounted ? items : [],
    isOpen: isMounted ? isOpen : false,
    itemCount: isMounted ? getItemCount() : 0,
    subtotal: isMounted ? getSubtotal() : 0,
    discount: isMounted ? getDiscount() : 0,
    total: isMounted ? getTotal() : 0,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setIsOpen,
    isMounted,
  };
}
