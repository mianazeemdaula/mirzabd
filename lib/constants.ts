// lib/constants.ts

export const APP_NAME = "Mirza Book Depot";
export const APP_TAGLINE = "Every page, a new world.";
export const APP_DESCRIPTION =
  "Mirza Book Depot — Pakistan's trusted online bookstore. Discover thousands of books across fiction, non-fiction, academic, and children's categories.";

// Contact & Address
export const APP_CONTACT = "03336566000";
export const APP_LANDLINE = "0444540357";
export const APP_EMAIL = "admin@mirzabd.com";
export const APP_ADDRESS = "Allah o Akbar Chowk, Mirza Plaza, Depalpur, Pakistan";
export const APP_CITY = "Depalpur";
export const APP_COUNTRY = "Pakistan";

// URLs
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Currency
export const DEFAULT_CURRENCY = "PKR";
export const CURRENCY_SYMBOL = "Rs.";

// Pagination
export const PRODUCTS_PER_PAGE = 12;
export const ORDERS_PER_PAGE = 10;
export const ADMIN_ITEMS_PER_PAGE = 20;

// Image Defaults
export const PLACEHOLDER_IMAGE = "/images/placeholder-product.jpg";
export const LOGO_URL = "/images/logo.png";

// Navigation Links
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Books", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "New Arrivals", href: "/products?sort=newest" },
  { label: "Best Sellers", href: "/products?sort=best-selling" },
  { label: "Contact", href: "/contact" },
] as const;

// Footer Links
export const FOOTER_LINKS = {
  shop: [
    { label: "All Books", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "New Arrivals", href: "/products?sort=newest" },
    { label: "Best Sellers", href: "/products?sort=best-selling" },
    { label: "Sale", href: "/products?on_sale=true" },
  ],
  account: [
    { label: "My Account", href: "/account" },
    { label: "Order History", href: "/account/orders" },
    { label: "Wishlist", href: "/account/wishlist" },
    { label: "Addresses", href: "/account/addresses" },
  ],
  info: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Return Policy", href: "/returns" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
} as const;

// Order Status Labels & Colors
export const ORDER_STATUS_MAP = {
  PENDING: { label: "Pending", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  PROCESSING: { label: "Processing", color: "text-blue-400", bg: "bg-blue-400/10" },
  SHIPPED: { label: "Shipped", color: "text-purple-400", bg: "bg-purple-400/10" },
  DELIVERED: { label: "Delivered", color: "text-green-400", bg: "bg-green-400/10" },
  CANCELLED: { label: "Cancelled", color: "text-red-400", bg: "bg-red-400/10" },
  REFUNDED: { label: "Refunded", color: "text-gray-400", bg: "bg-gray-400/10" },
} as const;

// Payment Status Labels
export const PAYMENT_STATUS_MAP = {
  UNPAID: { label: "Unpaid", color: "text-red-400" },
  PAID: { label: "Paid", color: "text-green-400" },
  PARTIALLY_REFUNDED: { label: "Partially Refunded", color: "text-yellow-400" },
  REFUNDED: { label: "Refunded", color: "text-gray-400" },
} as const;

// Stock Status Labels
export const STOCK_STATUS_MAP = {
  instock: { label: "In Stock", color: "text-green-400" },
  outofstock: { label: "Out of Stock", color: "text-red-400" },
  onbackorder: { label: "On Backorder", color: "text-yellow-400" },
} as const;

// Social Media
export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/mirzabookdepot",
  instagram: "https://instagram.com/mirzabookdepot",
  whatsapp: `https://wa.me/92${APP_CONTACT.slice(1)}`,
} as const;
