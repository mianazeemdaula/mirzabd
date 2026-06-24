// app/(store)/layout.tsx
import React from "react";
import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { CartDrawer } from "@/components/store/cart-drawer";
import { SearchBar } from "@/components/store/search-bar";
import { PageTransition } from "@/components/motion/page-transition";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-void text-ink">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <CartDrawer />
      <SearchBar />
    </div>
  );
}
