// app/(store)/account/wishlist/page.tsx
import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { BookGrid } from "@/components/store/book-grid";
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

  const products = wishlistItems.map((item) => item.product);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-ink mb-1">My Wishlist</h2>
        <p className="text-xs text-muted">A collection of your favorite titles waiting to be read.</p>
      </div>

      <hr className="border-border" />

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="p-3 bg-elevated rounded-full text-muted border border-border/40">
            <Heart size={32} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink">Your wishlist is empty</h4>
            <p className="text-xs text-muted mt-1 max-w-[240px]">
              Explore our collections and hit the heart icon to save your favorite products here.
            </p>
          </div>
          <Link href="/books">
            <button className="inline-flex items-center justify-center bg-gold hover:bg-gold-dim text-void font-bold transition-colors text-xs h-9 px-5 rounded-[var(--radius-btn)] cursor-pointer">
              Explore Shop
            </button>
          </Link>
        </div>
      ) : (
        <div className="pt-2">
          <BookGrid books={products.map(serializeProduct)} />
        </div>
      )}
    </div>
  );
}
