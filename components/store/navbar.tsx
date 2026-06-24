// components/store/navbar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Search, ShoppingBag, User, Menu, X, Heart, LogOut, ChevronDown, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { useUiStore } from "@/store/ui";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { itemCount, setIsOpen: setCartOpen } = useCart();
  const { toggleSearch, isMobileMenuOpen, toggleMobileMenu, setMobileMenuOpen } = useUiStore();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/books" },
    { label: "Categories", href: "/categories" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-void/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-lg sm:text-2xl font-bold tracking-wide text-ink">
            📚 {APP_NAME}
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-gold ${
                  isActive ? "text-gold" : "text-muted"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Trigger */}
          <button
            onClick={toggleSearch}
            className="p-2 text-muted hover:text-gold transition-colors rounded-full hover:bg-elevated"
            aria-label="Search Catalog"
          >
            <Search size={20} />
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 text-muted hover:text-gold transition-colors rounded-full hover:bg-elevated"
            aria-label="Open Shopping Cart"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-void glow-gold">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Account Controls */}
          <div className="relative">
            {session ? (
              <div className="hidden sm:block">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 px-3 text-sm text-muted hover:text-gold transition-colors rounded-full hover:bg-elevated"
                >
                  <User size={18} />
                  <span className="max-w-[80px] truncate">{session.user?.name || "Account"}</span>
                  <ChevronDown size={14} className={`transform transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsUserDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 origin-top-right rounded-md border border-border bg-surface p-1 shadow-card ring-1 ring-black/5 z-40"
                      >
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-ink hover:bg-elevated"
                          >
                            <LayoutDashboard size={16} className="text-gold" />
                            Admin Panel
                          </Link>
                        )}
                        <Link
                          href="/account"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-ink hover:bg-elevated"
                        >
                          <User size={16} />
                          My Profile
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-ink hover:bg-elevated"
                        >
                          <ShoppingBag size={16} />
                          My Orders
                        </Link>
                        <Link
                          href="/account/wishlist"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-ink hover:bg-elevated"
                        >
                          <Heart size={16} />
                          Wishlist
                        </Link>
                        <hr className="my-1 border-border" />
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-crimson hover:bg-elevated cursor-pointer"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:block">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hover:text-gold">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={toggleMobileMenu}
            className="p-2 text-muted hover:text-gold transition-colors rounded-full hover:bg-elevated md:hidden"
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-t border-border bg-surface overflow-hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded px-3 py-2 text-base font-medium hover:bg-elevated hover:text-gold ${
                    pathname === link.href ? "text-gold bg-elevated" : "text-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-border" />
              {session ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded px-3 py-2 text-base font-medium text-gold hover:bg-elevated"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded px-3 py-2 text-base font-medium text-ink hover:bg-elevated"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded px-3 py-2 text-base font-medium text-ink hover:bg-elevated"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/account/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded px-3 py-2 text-base font-medium text-ink hover:bg-elevated"
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-base font-medium text-crimson hover:bg-elevated"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="pt-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full text-center py-3">
                      Sign In / Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
export default Navbar;
