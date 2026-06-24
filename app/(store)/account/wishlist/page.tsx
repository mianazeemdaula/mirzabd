// app/(store)/account/wishlist/page.tsx
import React from "react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { WishlistClient } from "@/components/store/wishlist-client";
import { serializeProduct } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Retrieve user wishlist items, including product details
  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          categories: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const products = wishlistItems.map((item) => serializeProduct(item.product));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-ink mb-1">My Wishlist</h2>
        <p className="text-xs text-muted">A collection of your favorite titles waiting to be read.</p>
      </div>

      <hr className="border-border" />

      <WishlistClient initialBooks={products} />
    </div>
  );
}
