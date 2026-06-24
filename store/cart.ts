// store/cart.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // combination of productId and variationId: "p1" or "p1-v2"
  productId: number;
  variationId: number | null;
  name: string;
  sku: string | null;
  quantity: number;
  price: number; // as number for easy client UI calculations
  regularPrice: number;
  imageUrl: string | null;
  stockQuantity: number | null;
  manageStock: boolean;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (newItem, quantity = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex((item) => item.id === newItem.id);
          
          let updatedItems = [...state.items];
          
          if (existingItemIndex > -1) {
            const existingItem = state.items[existingItemIndex];
            const newQty = existingItem.quantity + quantity;
            
            // Check stock limit if managed
            if (newItem.manageStock && newItem.stockQuantity !== null) {
              if (newQty > newItem.stockQuantity) {
                // cap at stock quantity
                updatedItems[existingItemIndex] = {
                  ...existingItem,
                  quantity: newItem.stockQuantity,
                };
                return { items: updatedItems, isOpen: true };
              }
            }
            
            updatedItems[existingItemIndex] = {
              ...existingItem,
              quantity: newQty,
            };
          } else {
            // Check stock limit
            let qty = quantity;
            if (newItem.manageStock && newItem.stockQuantity !== null && qty > newItem.stockQuantity) {
              qty = newItem.stockQuantity;
            }
            updatedItems.push({ ...newItem, quantity: qty });
          }
          
          return { items: updatedItems, isOpen: true };
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      updateQuantity: (id, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== id) };
          }
          
          return {
            items: state.items.map((item) => {
              if (item.id !== id) return item;
              
              let targetQty = quantity;
              if (item.manageStock && item.stockQuantity !== null && targetQty > item.stockQuantity) {
                targetQty = item.stockQuantity;
              }
              
              return { ...item, quantity: targetQty };
            }),
          };
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      setIsOpen: (isOpen) => set({ isOpen }),
      
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.regularPrice * item.quantity, 0);
      },

      getDiscount: () => {
        return get().items.reduce((total, item) => {
          const discountPerItem = Math.max(0, item.regularPrice - item.price);
          return total + discountPerItem * item.quantity;
        }, 0);
      },
      
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: "mirza-book-depot-cart",
    }
  )
);
