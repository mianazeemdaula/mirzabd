// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import slugifyLib from "slugify";

/**
 * Merge Tailwind classes with clsx — resolves conflicts intelligently.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Pakistani Rupees.
 * @example formatPKR(1250) → "Rs. 1,250"
 */
export function formatPKR(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "Rs. 0";

  return `Rs. ${num.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Generate a URL-safe slug from a string.
 * @example slugify_safe("Harry Potter & the Goblet") → "harry-potter-and-the-goblet"
 */
export function slugify_safe(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

/**
 * Format a WhatsApp phone number or URL into a valid https://wa.me/... link
 */
export function formatWhatsAppUrl(input?: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("wa.me/")) {
    return `https://${trimmed}`;
  }
  // Strip all non-digit characters
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) {
    return `https://wa.me/92${digits.slice(1)}`;
  }
  if (digits.startsWith("92")) {
    return `https://wa.me/${digits}`;
  }
  return `https://wa.me/${digits}`;
}

/**
 * Truncate a string to a given length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

/**
 * Generate a unique order number.
 * @example generateOrderNumber() → "MBD-2024-0001"
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `MBD-${year}-${random}`;
}

/**
 * Sleep utility for async operations.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Serialize a database Product object to be safe for Next.js Client Components (serializes Decimals to Numbers).
 */
export function serializeProduct(book: any) {
  if (!book) return null;
  return {
    ...book,
    regularPrice: book.regularPrice ? Number(book.regularPrice) : 0,
    salePrice: book.salePrice !== null && book.salePrice !== undefined ? Number(book.salePrice) : null,
    weight: book.weight !== null && book.weight !== undefined ? Number(book.weight) : null,
    averageRating: book.averageRating !== null && book.averageRating !== undefined ? Number(book.averageRating) : 0,
  };
}
