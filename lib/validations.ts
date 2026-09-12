// lib/validations.ts
import { z } from "zod";

// ─────────────────────────────────────────────
// Auth Schemas
// ─────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof RegisterSchema>;

// ─────────────────────────────────────────────
// Book / Product Schema
// ─────────────────────────────────────────────

export const BookSchema = z.object({
  name: z.string().min(1, "Book title is required"),
  slug: z.string().min(1, "Slug is required"),
  type: z.enum(["simple", "variable"]).default("simple"),
  status: z.enum(["publish", "draft", "trash"]).default("publish"),
  description: z.string().default(""),
  shortDescription: z.string().default(""),
  sku: z.string().optional().nullable(),
  isbn: z.string().optional().nullable(),
  author: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
  publishYear: z.coerce.number().int().optional().nullable(),
  pages: z.coerce.number().int().positive().optional().nullable(),
  language: z.string().default("English"),
  regularPrice: z.coerce.number().min(0, "Price must be positive"),
  salePrice: z.coerce.number().min(0).optional().nullable(),
  manageStock: z.boolean().default(false),
  stockQuantity: z.coerce.number().int().optional().nullable(),
  stockStatus: z.enum(["instock", "outofstock", "onbackorder"]).default("instock"),
  weight: z.coerce.number().optional().nullable(),
  isFeatured: z.boolean().default(false),
  images: z.array(z.object({
    id: z.number().optional(),
    src: z.string().url(),
    alt: z.string().default(""),
    position: z.number().default(0),
  })).default([]),
  attributes: z.array(z.object({
    name: z.string(),
    options: z.array(z.string()),
    visible: z.boolean().default(true),
    variation: z.boolean().default(false),
  })).default([]),
  categoryIds: z.array(z.coerce.number()).default([]),
  tagIds: z.array(z.coerce.number()).default([]),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

export type BookFormValues = z.infer<typeof BookSchema>;

// ─────────────────────────────────────────────
// Category Schema
// ─────────────────────────────────────────────

export const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  parentId: z.coerce.number().optional().nullable(),
  description: z.string().default(""),
  imageUrl: z.string().optional().nullable().or(z.literal("")),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof CategorySchema>;

// ─────────────────────────────────────────────
// Address Schema
// ─────────────────────────────────────────────

export const AddressSchema = z.object({
  label: z.enum(["Home", "Office", "Other"]).default("Home"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().default("Pakistan"),
  isDefault: z.boolean().default(false),
});

export type AddressFormValues = z.infer<typeof AddressSchema>;

// ─────────────────────────────────────────────
// Checkout Schema
// ─────────────────────────────────────────────

export const CheckoutSchema = z.object({
  // Contact
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),

  // Billing Address
  billing: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().default("Pakistan"),
  }),

  // Shipping Address (optional, defaults to billing)
  shippingSameAsBilling: z.boolean().default(true),
  shipping: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().default("Pakistan"),
  }).optional(),

  // Payment
  paymentMethod: z.enum(["stripe", "cod"]).default("stripe"),

  // Notes
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.shippingSameAsBilling) {
    if (!data.shipping?.name || data.shipping.name.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Shipping name is required",
        path: ["shipping", "name"],
      });
    }
    if (!data.shipping?.email || data.shipping.email.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Shipping email is required",
        path: ["shipping", "email"],
      });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.shipping.email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valid shipping email is required",
          path: ["shipping", "email"],
        });
      }
    }
    if (!data.shipping?.phone || data.shipping.phone.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Shipping phone number is required (min 10 digits)",
        path: ["shipping", "phone"],
      });
    }
    if (!data.shipping?.address || data.shipping.address.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Shipping address is required",
        path: ["shipping", "address"],
      });
    }
    if (!data.shipping?.city || data.shipping.city.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Shipping city is required",
        path: ["shipping", "city"],
      });
    }
  }
});

export type CheckoutFormValues = z.infer<typeof CheckoutSchema>;

// ─────────────────────────────────────────────
// Review Schema
// ─────────────────────────────────────────────

export const ReviewSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

export type ReviewFormValues = z.infer<typeof ReviewSchema>;

// ─────────────────────────────────────────────
// API Credential Schema
// ─────────────────────────────────────────────

export const ApiCredentialSchema = z.object({
  description: z.string().default("POS Integration"),
  permissions: z.enum(["read", "write", "read_write"]).default("read_write"),
});

export type ApiCredentialFormValues = z.infer<typeof ApiCredentialSchema>;
