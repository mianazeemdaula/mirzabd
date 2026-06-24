// types/index.ts

export type Role = "ADMIN" | "CUSTOMER";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  description: string;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  count: number;
  createdAt: Date;
  updatedAt: Date;
  children?: Category[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface ProductImage {
  id?: number;
  src: string;
  alt?: string;
  position?: number;
}

export interface ProductAttribute {
  name: string;
  options: string[];
  visible?: boolean;
  variation?: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  type: string; // simple | variable
  status: string; // publish | draft
  description: string;
  shortDescription: string;
  sku: string | null;
  isbn: string | null;
  author: string | null;
  publisher: string | null;
  publishYear: number | null;
  pages: number | null;
  language: string;
  regularPrice: number;
  salePrice: number | null;
  manageStock: boolean;
  stockQuantity: number | null;
  stockStatus: "instock" | "outofstock" | "onbackorder";
  weight: number | null;
  isFeatured: boolean;
  totalSales: number;
  averageRating: number;
  ratingCount: number;
  images: ProductImage[];
  attributes: ProductAttribute[];
  categories?: Category[];
  tags?: Tag[];
  variations?: Variation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Variation {
  id: number;
  productId: number;
  sku: string | null;
  regularPrice: number;
  salePrice: number | null;
  stockQuantity: number | null;
  stockStatus: string;
  imageUrl: string | null;
  attributes: { name: string; option: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "UNPAID" | "PAID" | "PARTIALLY_REFUNDED" | "REFUNDED";

export interface Address {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: number;
  variationId: number | null;
  name: string;
  sku: string | null;
  quantity: number;
  price: number;
  total: number;
  imageUrl: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  guestEmail: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  stripePaymentId: string | null;
  currency: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  notes: string | null;
  billingAddress: Address;
  shippingAddress: Address;
  items?: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  productId: number;
  name: string;
  email: string;
  rating: number;
  title: string | null;
  comment: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: Date;
  product?: Product;
}

export interface ApiCredential {
  id: string;
  description: string;
  consumerKey: string;
  consumerSecret: string;
  permissions: "read" | "write" | "read_write";
  lastUsedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

export interface StoreSettings {
  storeName: string;
  currency: string;
  shippingFlatRate: number;
  contactEmail: string;
  contactPhone: string;
  storeAddress: string;
}
