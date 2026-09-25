// components/store/navbar.tsx
"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Heart,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Phone,
  Truck,
  BadgePercent,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { useUiStore } from "@/store/ui";
import { APP_CONTACT } from "@/lib/constants";
import { Logo } from "@/components/store/logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Products", href: "/products" },
  { label: "Departments", href: "/categories" },
  { label: "New Arrivals", href: "/products?sort=newest" },
  { label: "Deals", href: "/products?on_sale=true" },
  { label: "Contact", href: "/contact" },
];

const QUICK_DEPARTMENTS = [
  { label: "School & College Books", slug: "school-and-college-books" },
  { label: "Holy Quran", slug: "holy-quran-and-tafseer" },
  { label: "Islamic Books", slug: "hadith-and-islamic-books" },
  { label: "Past Papers", slug: "model-papers-and-past-papers" },
  { label: "Stationery", slug: "school-stationery" },
  { label: "Office Supplies", slug: "office-supplies" },
  { label: "Registers", slug: "school-registers-and-account-books" },
  { label: "Art Materials", slug: "art-materials" },
];

function HeaderSearch({ className }: { className?: string }) {
  return (
    <Suspense fallback={<HeaderSearchForm className={className} />}>
      <HeaderSearchWithParams className={className} />
    </Suspense>
  );
}

function HeaderSearchWithParams({ className }: { className?: string }) {
  const q = useSearchParams().get("q") ?? "";
  return <HeaderSearchForm key={q} className={className} initialQuery={q} />;
}

function HeaderSearchForm({ className, initialQuery = "" }: { className?: string; initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const term = query.trim();
        router.push(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
      }}
      className={cn(
        "flex items-center gap-2 rounded-full border border-border bg-surface pl-4 pr-1 h-10 transition-all focus-within:border-gold focus-within:bg-white focus-within:ring-4 focus-within:ring-gold/10",
        className
      )}
    >
      <Search size={17} className="shrink-0 text-muted" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search 8,000+ books, stationery & more…"
        aria-label="Search products"
        className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-gold px-4 h-8 text-xs font-semibold text-white transition-colors hover:bg-gold-dim cursor-pointer"
      >
        Search
      </button>
    </form>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { itemCount, setIsOpen: setCartOpen } = useCart();
  const { toggleSearch, isMobileMenuOpen, toggleMobileMenu, setMobileMenuOpen } = useUiStore();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Query-string links (Deals, New Arrivals) can't be matched without search params; the
  // nav row refines this inside a Suspense boundary.
  const isActive = (href: string) => !href.includes("?") && pathname === href;

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const iconBtn =
    "relative grid place-items-center h-9 w-9 rounded-full text-ink transition-colors hover:bg-surface hover:text-gold cursor-pointer";

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-navy-deep text-white/85 text-[11px] sm:text-xs">
        <div className="mx-auto flex h-8 w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8 md:px-12 lg:px-16">
          <p className="flex items-center gap-2 truncate">
            <Truck size={14} className="shrink-0 text-amber" />
            <span className="truncate">
              24-hour delivery in Depalpur · Cash on Delivery across Pakistan
            </span>
          </p>
          <div className="hidden sm:flex items-center gap-5 shrink-0">
            <Link href="/products?on_sale=true" className="flex items-center gap-1.5 hover:text-white">
              <BadgePercent size={14} className="text-amber" /> Today&apos;s deals
            </Link>
            <a href={`tel:${APP_CONTACT}`} className="flex items-center gap-1.5 font-semibold hover:text-white">
              <Phone size={13} /> {APP_CONTACT}
            </a>
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b bg-white transition-shadow",
          scrolled ? "border-border shadow-[0_6px_24px_-12px_rgba(14,42,107,0.25)]" : "border-transparent"
        )}
      >
        {/* Main row */}
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-4 lg:gap-8 px-4 sm:px-8 md:px-12 lg:px-16">
          <Logo size="md" href="/" />

          <HeaderSearch className="hidden lg:flex flex-1 max-w-2xl mx-auto" />

          <div className="ml-auto lg:ml-0 flex items-center gap-1 sm:gap-2">
            <button onClick={toggleSearch} className={cn(iconBtn, "lg:hidden")} aria-label="Search catalog">
              <Search size={20} />
            </button>

            <Link href="/account/wishlist" className={cn(iconBtn, "hidden sm:grid")} aria-label="Wishlist">
              <Heart size={20} />
            </Link>

            <div className="relative hidden sm:block">
              {session ? (
                <>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-full text-[13px] font-semibold text-ink hover:bg-surface transition-colors cursor-pointer"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-gold/10 text-gold">
                      <User size={16} />
                    </span>
                    <span className="max-w-[90px] truncate">{session.user?.name || "Account"}</span>
                    <ChevronDown size={14} className={cn("transition-transform", isUserDropdownOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setIsUserDropdownOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-52 origin-top-right rounded-2xl border border-border bg-white p-1.5 shadow-[var(--shadow-lift)] z-40"
                        >
                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface"
                            >
                              <LayoutDashboard size={16} className="text-gold" /> Admin Panel
                            </Link>
                          )}
                          {[
                            { href: "/account", label: "My Profile", icon: User },
                            { href: "/account/orders", label: "My Orders", icon: ShoppingBag },
                            { href: "/account/wishlist", label: "Wishlist", icon: Heart },
                          ].map(({ href, label, icon: Icon }) => (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface"
                            >
                              <Icon size={16} className="text-muted" /> {label}
                            </Link>
                          ))}
                          <hr className="my-1 border-border" />
                          <button
                            onClick={() => {
                              setIsUserDropdownOpen(false);
                              handleLogout();
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-crimson hover:bg-crimson/5 cursor-pointer"
                          >
                            <LogOut size={16} /> Sign Out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 h-9 px-3.5 rounded-full text-[13px] font-semibold text-ink hover:bg-surface transition-colors"
                >
                  <User size={18} /> Sign In
                </Link>
              )}
            </div>

            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 h-9 pl-3 pr-3 sm:pr-3.5 rounded-full bg-gold text-white transition-colors hover:bg-gold-dim cursor-pointer"
              aria-label="Open shopping cart"
            >
              <ShoppingBag size={18} />
              <span className="hidden sm:inline text-[13px] font-semibold">Cart</span>
              {itemCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-amber px-1 text-[10px] font-extrabold text-[#1F1300]">
                  {itemCount}
                </span>
              )}
            </button>

            <button onClick={toggleMobileMenu} className={cn(iconBtn, "md:hidden")} aria-label="Toggle menu">
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Nav row */}
        <Suspense fallback={<NavRow isActive={isActive} />}>
          <NavRowWithParams />
        </Suspense>

        {/* Mobile drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden border-t border-border bg-white overflow-hidden"
            >
              <div className="max-h-[75vh] overflow-y-auto px-4 py-4 space-y-5">
                <nav className="grid gap-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "rounded-xl px-3 py-2.5 text-[15px] font-semibold",
                        isActive(link.href) ? "bg-gold/10 text-gold" : "text-ink hover:bg-surface"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div>
                  <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted">Departments</p>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_DEPARTMENTS.map((d) => (
                      <Link
                        key={d.slug}
                        href={`/products?category=${d.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-ink hover:border-gold hover:text-gold"
                      >
                        {d.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="grid gap-1 border-t border-border pt-4">
                  {session ? (
                    <>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-gold hover:bg-surface">
                          Admin Panel
                        </Link>
                      )}
                      <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface">
                        My Profile
                      </Link>
                      <Link href="/account/orders" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface">
                        My Orders
                      </Link>
                      <Link href="/account/wishlist" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface">
                        Wishlist
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-crimson hover:bg-crimson/5"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl bg-gold py-3 text-center text-sm font-bold text-white"
                    >
                      Sign In / Register
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
export default Navbar;

function NavRowWithParams() {
  const pathname = usePathname();
  const params = useSearchParams().toString();
  const currentUrl = `${pathname}${params ? `?${params}` : ""}`;
  return <NavRow isActive={(href) => (href.includes("?") ? currentUrl === href : pathname === href)} />;
}

function NavRow({ isActive }: { isActive: (href: string) => boolean }) {
  return (
    <nav className="hidden md:block border-t border-border/70">
      <div className="mx-auto flex h-10 w-full max-w-[1440px] items-center gap-1 px-4 sm:px-8 md:px-12 lg:px-16">
        <Link
          href="/categories"
          className="mr-3 flex items-center gap-2 rounded-full bg-navy px-3.5 h-7 text-xs font-semibold text-white hover:bg-navy-deep transition-colors"
        >
          <LayoutGrid size={14} /> Browse Departments
        </Link>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative px-3 h-10 flex items-center text-[13px] font-medium transition-colors",
              isActive(link.href) ? "text-gold" : "text-ink/75 hover:text-gold"
            )}
          >
            {link.label}
            {link.label === "Deals" && (
              <span className="ml-1.5 rounded-full bg-crimson px-1.5 py-px text-[9px] font-bold uppercase text-white">Hot</span>
            )}
            {isActive(link.href) && (
              <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gold" />
            )}
          </Link>
        ))}
        <div className="ml-auto hidden xl:flex items-center gap-4 text-xs text-muted">
          {QUICK_DEPARTMENTS.slice(0, 4).map((d) => (
            <Link key={d.slug} href={`/products?category=${d.slug}`} className="hover:text-gold transition-colors">
              {d.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
