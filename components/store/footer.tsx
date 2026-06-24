// components/store/footer.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Instagram, Send, Book } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE, APP_ADDRESS, APP_CONTACT, APP_LANDLINE, APP_EMAIL } from "@/lib/constants";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Thank you for subscribing to our newsletter!");
    setEmail("");
  };

  return (
    <footer className="w-full bg-surface border-t border-border mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Book className="text-gold" size={20} />
              <h3 className="font-display text-xl font-bold tracking-wide text-ink">
                {APP_NAME}
              </h3>
            </div>
            <p className="text-sm font-medium italic text-gold">{APP_TAGLINE}</p>
            <div className="space-y-3 pt-2 text-sm text-muted">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 flex-shrink-0 text-gold" />
                <span>{APP_ADDRESS}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0 text-gold" />
                <div className="flex flex-col">
                  <a href={`tel:${APP_CONTACT}`} className="hover:text-gold transition-colors">
                    {APP_CONTACT} (Mobile)
                  </a>
                  <a href={`tel:${APP_LANDLINE}`} className="hover:text-gold transition-colors">
                    {APP_LANDLINE} (Landline)
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="flex-shrink-0 text-gold" />
                <a href={`mailto:${APP_EMAIL}`} className="hover:text-gold transition-colors">
                  {APP_EMAIL}
                </a>
              </div>
            </div>
            {/* Social Icons */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://facebook.com/mirzabookdepot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-gold transition-colors p-1.5 rounded-full bg-void"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://instagram.com/mirzabookdepot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-gold transition-colors p-1.5 rounded-full bg-void"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-ink mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>
                <Link href="/" className="hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/books" className="hover:text-gold transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-gold transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-ink mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>
                <Link href="/books?category=fiction" className="hover:text-gold transition-colors">
                  Fiction
                </Link>
              </li>
              <li>
                <Link href="/books?category=non-fiction" className="hover:text-gold transition-colors">
                  Non-Fiction
                </Link>
              </li>
              <li>
                <Link href="/books?category=urdu-literature" className="hover:text-gold transition-colors">
                  Urdu Literature
                </Link>
              </li>
              <li>
                <Link href="/books?category=islamic-books" className="hover:text-gold transition-colors">
                  Islamic Books
                </Link>
              </li>
              <li>
                <Link href="/books?category=self-help-philosophy" className="hover:text-gold transition-colors">
                  Self Help & Philosophy
                </Link>
              </li>
              <li>
                <Link href="/books?category=childrens-books" className="hover:text-gold transition-colors">
                  Children's Books
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-ink mb-4">
              Newsletter
            </h4>
            <p className="text-sm text-muted mb-4 leading-relaxed">
              Subscribe to receive weekly updates on newly stocked titles, literary blogs, and special promotions.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] h-10 pl-3 pr-10 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 placeholder:text-faint"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-[var(--radius-btn)] bg-gold hover:bg-gold-dim text-void transition-colors cursor-pointer"
                  aria-label="Subscribe button"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>

        <hr className="my-8 border-border" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gold transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
