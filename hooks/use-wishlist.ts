// hooks/use-wishlist.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Guest local storage key
const GUEST_WISHLIST_KEY = "mirza-book-depot-wishlist";

export function useWishlist(initialData?: any[]) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [guestWishlist, setGuestWishlist] = useState<number[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (stored) {
      try {
        setGuestWishlist(JSON.parse(stored));
      } catch (e) {
        setGuestWishlist([]);
      }
    }
  }, []);

  // Sync guest wishlist to server on login
  useEffect(() => {
    if (isMounted && session && guestWishlist.length > 0 && !isLoading) {
      const syncWishlist = async () => {
        try {
          for (const productId of guestWishlist) {
            const isAlreadyOnServer = serverWishlist.some(
              (item: any) => item.id === productId || item.productId === productId
            );
            if (!isAlreadyOnServer) {
              await fetch("/api/store/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId }),
              });
            }
          }
          localStorage.removeItem(GUEST_WISHLIST_KEY);
          setGuestWishlist([]);
          queryClient.invalidateQueries({ queryKey: ["wishlist", session?.user?.id] });
          toast.success("Synced your wishlist!");
        } catch (err) {
          console.error("Failed to sync wishlist:", err);
        }
      };
      syncWishlist();
    }
  }, [isMounted, session, guestWishlist, serverWishlist, isLoading, queryClient]);

  // Fetch wishlist from server for authenticated user
  const { data: serverWishlist = initialData || [], isLoading } = useQuery<any[]>({
    queryKey: ["wishlist", session?.user?.id],
    queryFn: async () => {
      if (!session) return [];
      const res = await fetch("/api/store/wishlist");
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      return res.json(); // returns array of products
    },
    enabled: !!session,
    initialData,
  });

  // Mutate wishlist on server
  const toggleMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch("/api/store/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error("Failed to update wishlist");
      return res.json(); // returns { added: boolean }
    },
    onSuccess: (data, productId) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", session?.user?.id] });
      if (data.added) {
        toast.success("Added to wishlist");
      } else {
        toast.success("Removed from wishlist");
      }
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const toggleWishlist = (productId: number) => {
    if (!isMounted) return;

    if (session) {
      toggleMutation.mutate(productId);
    } else {
      // Guest local storage logic
      setGuestWishlist((prev) => {
        let next: number[];
        if (prev.includes(productId)) {
          next = prev.filter((id) => id !== productId);
          toast.success("Removed from wishlist");
        } else {
          next = [...prev, productId];
          toast.success("Added to wishlist");
        }
        localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(next));
        return next;
      });
    }
  };

  const hasItem = (productId: number) => {
    if (!isMounted) return false;
    if (session) {
      return serverWishlist.some((item: any) => item.id === productId || item.productId === productId);
    }
    return guestWishlist.includes(productId);
  };

  return {
    wishlistItems: session ? serverWishlist : [], // we'll fetch full products for display in the account page
    isLoading: session ? isLoading : false,
    toggleWishlist,
    hasItem,
  };
}
