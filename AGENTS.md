# AGENTS.md — Book Depot

> **AI Agent Build Specification**
> Full-stack ecommerce platform for a Book Depot with WooCommerce-compatible REST API for POS sync, animated modern storefront, and a feature-complete admin panel.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Versions](#2-tech-stack--versions)
3. [Design System](#3-design-system)
4. [Architecture](#4-architecture)
5. [Environment Variables](#5-environment-variables)
6. [Database Schema](#6-database-schema)
7. [Authentication](#7-authentication)
8. [File & Folder Structure](#8-file--folder-structure)
9. [WooCommerce-Compatible API Layer](#9-woocommerce-compatible-api-layer)
10. [Public Store — Pages & UI](#10-public-store--pages--ui)
11. [Admin Panel — Pages & UI](#11-admin-panel--pages--ui)
12. [Animation System](#12-animation-system)
13. [State Management](#13-state-management)
14. [Data Fetching Strategy](#14-data-fetching-strategy)
15. [Image Uploads](#15-image-uploads)
16. [Payments](#16-payments)
17. [Reusable Components](#17-reusable-components)
18. [Agent Task Assignments](#18-agent-task-assignments)
19. [Coding Conventions](#19-coding-conventions)
20. [Deployment](#20-deployment)

---

## 1. Project Overview

**Product Name:** Book Depot  
**Tagline:** *Every page, a new world.*

A modern full-stack ecommerce platform for an online bookstore. Ships three distinct layers:

| Layer | Description |
|---|---|
| **Public Store** | Animated customer-facing bookstore — browse, search, cart, checkout, account |
| **Admin Panel** | Full CRUD management for books, categories, orders, customers, API keys |
| **WooCommerce API** | Drop-in REST API at `/wp-json/wc/v3/...` so any POS software syncs products without modification |

---

## 2. Tech Stack & Versions

### Initialize Project

```bash
npx create-next-app@latest book-depot \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"
```

### Install All Dependencies

```bash
# Core
npm install next@16.2.9 react@19 react-dom@19

# Auth
npm install next-auth@beta @auth/prisma-adapter@2.11.2 bcryptjs@3.0.3
npm install -D @types/bcryptjs@3.0.0

# Database
npm install @prisma/client@7.8.0 prisma@7.8.0
npm install -D prisma

# Animation
npm install framer-motion@12.41.0

# Tailwind ecosystem
npm install tailwindcss@4.3.1 @tailwindcss/postcss@4.3.1
npm install tailwind-merge@3.6.0 class-variance-authority@0.7.1 clsx@2.1.1

# Forms & Validation
npm install react-hook-form@7.80.0 @hookform/resolvers@5.4.0 zod@4.4.3

# State
npm install zustand@5.0.14

# Data Fetching
npm install @tanstack/react-query@5.101.1

# UI Primitives
npm install @radix-ui/react-dialog@1.1.17 \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-select \
  @radix-ui/react-tabs \
  @radix-ui/react-tooltip \
  @radix-ui/react-popover \
  @radix-ui/react-checkbox \
  @radix-ui/react-switch \
  @radix-ui/react-slider \
  sonner@2.0.7 \
  lucide-react@1.21.0

# Payments
npm install stripe@22.2.3 @stripe/stripe-js@9.8.0

# File Uploads
npm install uploadthing@7.7.4 @uploadthing/react@7.3.3

# Utilities
npm install slugify@1.6.9 sharp@0.35.2 date-fns
```

### Version Reference Table

| Package | Version |
|---|---|
| `next` | 16.2.9 |
| `react` / `react-dom` | 19.x |
| `typescript` | 5.x |
| `framer-motion` | 12.41.0 |
| `tailwindcss` | 4.3.1 |
| `@prisma/client` | 7.8.0 |
| `next-auth` (Auth.js v5) | 5.0.0-beta.31 |
| `zustand` | 5.0.14 |
| `zod` | 4.4.3 |
| `stripe` | 22.2.3 |
| `uploadthing` | 7.7.4 |
| `@tanstack/react-query` | 5.101.1 |
| `react-hook-form` | 7.80.0 |
| `sonner` | 2.0.7 |
| `lucide-react` | 1.21.0 |

---

## 3. Design System

### Visual Identity

**Concept:** A sophisticated late-night bookshop — the kind with dim amber lamps, dark oak shelves, and the smell of old paper. Modern layout, editorial typography, deliberate luxury.

**Signature Element:** Animated "book spine stack" that morphs into the hero section on page load. Books tilt, align, and reveal the headline with staggered motion.

### Color Palette

```css
/* Defined in app/globals.css using Tailwind 4 @theme */
@theme {
  /* Backgrounds */
  --color-void:      #080A12;  /* Page background — near black */
  --color-surface:   #0F1120;  /* Cards, panels */
  --color-elevated:  #161929;  /* Elevated surfaces, inputs */
  --color-border:    #252A40;  /* Borders, dividers */

  /* Accent — Antique Gold */
  --color-gold:      #E8A83E;  /* Primary CTA, active states */
  --color-gold-dim:  #A87028;  /* Hover darken */
  --color-gold-glow: #E8A83E33;/* Glow/shadow */

  /* Accent 2 — Spine Red */
  --color-crimson:   #C0392B;  /* Sale badges, alerts */
  --color-crimson-dim: #922B21;

  /* Text */
  --color-ink:       #F5F0E8;  /* Primary text — warm white */
  --color-muted:     #8A8FA8;  /* Secondary text */
  --color-faint:     #3D4260;  /* Disabled, placeholder */

  /* Typography scale */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
}
```

### Google Fonts Setup

```tsx
// app/layout.tsx
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});
```

### Tailwind 4 Config (`app/globals.css`)

```css
@import "tailwindcss";

@theme {
  --color-void:         #080A12;
  --color-surface:      #0F1120;
  --color-elevated:     #161929;
  --color-border:       #252A40;
  --color-gold:         #E8A83E;
  --color-gold-dim:     #A87028;
  --color-gold-glow:    #E8A83E33;
  --color-crimson:      #C0392B;
  --color-crimson-dim:  #922B21;
  --color-ink:          #F5F0E8;
  --color-muted:        #8A8FA8;
  --color-faint:        #3D4260;

  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  --radius-card: 12px;
  --radius-btn:  8px;

  --shadow-glow: 0 0 40px var(--color-gold-glow);
  --shadow-card: 0 8px 32px rgba(0,0,0,0.4);
}

/* Tailwind 4 base layer overrides */
@layer base {
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    background-color: var(--color-void);
    color: var(--color-ink);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3, h4, h5 {
    font-family: var(--font-display);
    font-weight: 700;
  }
  ::selection {
    background-color: var(--color-gold-glow);
    color: var(--color-gold);
  }
}

/* Custom utilities */
@layer utilities {
  .text-display  { font-family: var(--font-display); }
  .bg-surface    { background-color: var(--color-surface); }
  .bg-elevated   { background-color: var(--color-elevated); }
  .border-default { border-color: var(--color-border); }
  .text-ink      { color: var(--color-ink); }
  .text-muted    { color: var(--color-muted); }
  .text-gold     { color: var(--color-gold); }
  .bg-gold       { background-color: var(--color-gold); }
  .glow-gold     { box-shadow: var(--shadow-glow); }
  .card-shadow   { box-shadow: var(--shadow-card); }
  .font-mono     { font-family: var(--font-mono); }
}
```

### Typography Scale

| Role | Class | Specs |
|---|---|---|
| Hero headline | `.text-hero` | Playfair Display, 72–96px, italic |
| Section title | `.text-section` | Playfair Display, 48px, 700 |
| Card title | `.text-card` | Inter, 18px, 600 |
| Body | `.text-body` | Inter, 16px, 400 |
| Caption | `.text-caption` | Inter, 13px, 400 |
| Price | `.text-price` | Inter, 20px, 700 |
| Badge | `.text-badge` | Inter, 11px, 700, uppercase, letter-spacing |

### Motion Tokens

```ts
// lib/motion.ts
export const spring = {
  gentle:  { type: "spring", stiffness: 120, damping: 20 },
  snappy:  { type: "spring", stiffness: 300, damping: 30 },
  bounce:  { type: "spring", stiffness: 400, damping: 15 },
  slow:    { type: "spring", stiffness: 60,  damping: 20 },
};

export const ease = {
  in:      [0.4, 0, 1, 1],
  out:     [0, 0, 0.2, 1],
  inOut:   [0.4, 0, 0.2, 1],
  expo:    [0.16, 1, 0.3, 1],
};

export const duration = { fast: 0.15, base: 0.3, slow: 0.6, slower: 1.0 };

// Reusable variants
export const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ease.expo } },
};

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const stagger = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren, delayChildren } },
});

export const scaleIn = {
  hidden:  { scale: 0.92, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { ...spring.gentle } },
};

export const slideLeft = {
  hidden:  { x: 60, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.5, ease: ease.expo } },
};
```

---

## 4. Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Next.js 16 App                        │
│                                                           │
│  ┌─────────────────┐  ┌────────────────┐  ┌───────────┐ │
│  │   Public Store  │  │  Admin Panel   │  │  WC API   │ │
│  │  (RSC + Client) │  │  (Protected)   │  │  Layer    │ │
│  └────────┬────────┘  └───────┬────────┘  └─────┬─────┘ │
│           │                   │                  │        │
│  ┌────────▼──────────────────▼──────────────────▼──────┐ │
│  │               Server Actions / Route Handlers         │ │
│  └────────────────────────┬─────────────────────────────┘ │
│                           │                               │
│  ┌────────────────────────▼──────────┐  ┌─────────────┐ │
│  │         Prisma ORM v7             │  │  Uploadthing │ │
│  └────────────────────────┬──────────┘  └─────────────┘ │
│                           │                               │
└───────────────────────────┼───────────────────────────────┘
                            │
                   ┌────────▼─────────┐
                   │   PostgreSQL DB   │
                   └──────────────────┘
```

### Request Flow

```
POS (WooCommerce client)
  → POST /wp-json/wc/v3/products/batch
  → Basic Auth middleware (wc-auth.ts)
  → Route Handler (app/wp-json/...)
  → Prisma upsert
  → 200 { create: [...], update: [...] }

Customer
  → GET /books
  → RSC page (Prisma query, no client overhead)
  → hydrated with Framer animations client-side

Admin
  → /admin/books
  → Auth.js v5 session check (ROLE: ADMIN)
  → Server component data + client mutations via TanStack Query
```

---

## 5. Environment Variables

```env
# .env.local

# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/book_depot"

# Auth.js v5
AUTH_SECRET="your-32-char-secret-here"
AUTH_TRUST_HOST=true

# Uploadthing
UPLOADTHING_TOKEN="ut_..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# App
NEXT_PUBLIC_APP_URL="https://bookdepot.com"
NEXT_PUBLIC_APP_NAME="Book Depot"

# Admin (first admin seed)
ADMIN_EMAIL="admin@bookdepot.com"
ADMIN_PASSWORD="StrongPass123!"
```

---

## 6. Database Schema

**File:** `prisma/schema.prisma`

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  passwordHash  String?
  role          Role      @default(CUSTOMER)
  phone         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts    Account[]
  sessions    Session[]
  orders      Order[]
  addresses   Address[]
  wishlist    WishlistItem[]

  @@map("users")
}

enum Role {
  ADMIN
  CUSTOMER
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ─────────────────────────────────────────────
// Catalog
// ─────────────────────────────────────────────

model Category {
  id          Int       @id @default(autoincrement())
  name        String
  slug        String    @unique
  parentId    Int?
  description String    @default("")
  imageUrl    String?
  displayOrder Int      @default(0)
  isActive    Boolean   @default(true)
  count       Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children Category[] @relation("CategoryTree")
  products Product[]  @relation("ProductCategories")

  @@map("categories")
}

model Product {
  id               Int       @id @default(autoincrement())
  name             String
  slug             String    @unique
  type             String    @default("simple")  // simple | variable
  status           String    @default("publish") // publish | draft | trash
  description      String    @default("") @db.Text
  shortDescription String    @default("") @db.Text
  sku              String?   @unique
  isbn             String?   @unique
  author           String?
  publisher        String?
  publishYear      Int?
  pages            Int?
  language         String    @default("English")
  regularPrice     Decimal   @default(0) @db.Decimal(10, 2)
  salePrice        Decimal?  @db.Decimal(10, 2)
  manageStock      Boolean   @default(false)
  stockQuantity    Int?
  stockStatus      String    @default("instock") // instock | outofstock | onbackorder
  weight           Decimal?  @db.Decimal(8, 2)
  isFeatured       Boolean   @default(false)
  totalSales       Int       @default(0)
  averageRating    Decimal   @default(0) @db.Decimal(3, 2)
  ratingCount      Int       @default(0)
  images           Json      @default("[]")   // [{id, src, alt, position}]
  attributes       Json      @default("[]")   // [{name, options, visible, variation}]
  metaTitle        String?
  metaDescription  String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  categories   Category[]     @relation("ProductCategories")
  variations   Variation[]
  orderItems   OrderItem[]
  reviews      Review[]
  wishlistItems WishlistItem[]
  tags         Tag[]          @relation("ProductTags")

  @@index([status])
  @@index([isFeatured])
  @@index([sku])
  @@map("products")
}

model Variation {
  id            Int      @id @default(autoincrement())
  productId     Int
  sku           String?  @unique
  regularPrice  Decimal  @db.Decimal(10, 2)
  salePrice     Decimal? @db.Decimal(10, 2)
  stockQuantity Int?
  stockStatus   String   @default("instock")
  imageUrl      String?
  attributes    Json     @default("[]")  // [{name: "Color", option: "Red"}]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  product    Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  orderItems OrderItem[]

  @@map("variations")
}

model Tag {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  slug     String    @unique
  products Product[] @relation("ProductTags")

  @@map("tags")
}

// ─────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique // e.g. "BD-2024-0001"
  userId          String?
  guestEmail      String?
  status          OrderStatus @default(PENDING)
  paymentStatus   PaymentStatus @default(UNPAID)
  paymentMethod   String      @default("stripe")
  stripePaymentId String?
  currency        String      @default("PKR")
  subtotal        Decimal     @db.Decimal(10, 2)
  discount        Decimal     @default(0) @db.Decimal(10, 2)
  shippingCost    Decimal     @default(0) @db.Decimal(10, 2)
  tax             Decimal     @default(0) @db.Decimal(10, 2)
  total           Decimal     @db.Decimal(10, 2)
  notes           String?     @db.Text
  billingAddress  Json        // {name, email, phone, address, city, state, zip, country}
  shippingAddress Json        // same shape
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user  User?       @relation(fields: [userId], references: [id])
  items OrderItem[]

  @@index([userId])
  @@index([status])
  @@map("orders")
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  UNPAID
  PAID
  PARTIALLY_REFUNDED
  REFUNDED
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  productId   Int
  variationId Int?
  name        String
  sku         String?
  quantity    Int
  price       Decimal  @db.Decimal(10, 2)
  total       Decimal  @db.Decimal(10, 2)
  imageUrl    String?

  order     Order      @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product    @relation(fields: [productId], references: [id])
  variation Variation? @relation(fields: [variationId], references: [id])

  @@map("order_items")
}

// ─────────────────────────────────────────────
// Customer
// ─────────────────────────────────────────────

model Address {
  id         String  @id @default(cuid())
  userId     String
  isDefault  Boolean @default(false)
  label      String  @default("Home") // Home | Office | Other
  name       String
  phone      String?
  address    String
  city       String
  state      String?
  zip        String?
  country    String  @default("Pakistan")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("addresses")
}

model WishlistItem {
  id        String   @id @default(cuid())
  userId    String
  productId Int
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([userId, productId])
  @@map("wishlist_items")
}

model Review {
  id        String   @id @default(cuid())
  productId Int
  name      String
  email     String
  rating    Int      // 1–5
  title     String?
  comment   String   @db.Text
  isVerified Boolean @default(false)
  isApproved Boolean @default(false)
  createdAt DateTime @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("reviews")
}

// ─────────────────────────────────────────────
// WooCommerce API Credentials
// ─────────────────────────────────────────────

model ApiCredential {
  id             String   @id @default(cuid())
  description    String   @default("POS Integration")
  consumerKey    String   @unique // ck_xxxxx
  consumerSecret String           // cs_xxxxx
  permissions    String   @default("read_write") // read | write | read_write
  lastUsedAt     DateTime?
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())

  @@map("api_credentials")
}

// ─────────────────────────────────────────────
// Settings
// ─────────────────────────────────────────────

model Setting {
  key       String @id
  value     Json
  updatedAt DateTime @updatedAt

  @@map("settings")
}
```

### Prisma Commands

```bash
# Initial setup
npx prisma generate
npx prisma db push

# Seed data
npx prisma db seed

# Migrations (production)
npx prisma migrate dev --name init
npx prisma migrate deploy
```

---

## 7. Authentication

### Auth.js v5 Setup

**File:** `auth.ts` (project root)

```ts
// auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.passwordHash) return null;
        const valid = await compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});
```

**File:** `app/api/auth/[...nextauth]/route.ts`

```ts
export { GET, POST } from "@/auth";
```

**File:** `proxy.ts`

```ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isAuthRoute = ["/login", "/register"].includes(req.nextUrl.pathname);
  const session = req.auth;

  if (isAdminRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if ((session.user as any)?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/login", "/register"],
};
```

### Seed Admin User

**File:** `prisma/seed.ts`

```ts
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash(process.env.ADMIN_PASSWORD!, 12);

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL! },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL!,
      name: "Admin",
      role: "ADMIN",
      passwordHash,
    },
  });

  // Seed categories
  const categories = [
    { name: "Fiction", slug: "fiction", description: "Stories of imagination" },
    { name: "Non-Fiction", slug: "non-fiction", description: "Truth told brilliantly" },
    { name: "Science", slug: "science", description: "How the universe works" },
    { name: "History", slug: "history", description: "The past, preserved" },
    { name: "Self Help", slug: "self-help", description: "Better every day" },
    { name: "Children", slug: "children", description: "Wonder for young readers" },
    { name: "Urdu", slug: "urdu", description: "اردو ادب" },
    { name: "Islamic", slug: "islamic", description: "دینی کتب" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log("✅ Seed complete");
}

main().finally(() => prisma.$disconnect());
```

```json
// package.json — add to scripts
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

---

## 8. File & Folder Structure

```
book-depot/
├── app/
│   ├── (store)/                          # Public store routes (route group)
│   │   ├── layout.tsx                    # Store layout: header + footer
│   │   ├── page.tsx                      # Homepage
│   │   ├── books/
│   │   │   ├── page.tsx                  # Books listing + filters
│   │   │   └── [slug]/
│   │   │       └── page.tsx              # Book detail page
│   │   ├── categories/
│   │   │   └── [slug]/
│   │   │       └── page.tsx              # Category listing
│   │   ├── cart/
│   │   │   └── page.tsx                  # Cart page
│   │   ├── checkout/
│   │   │   ├── page.tsx                  # Checkout form
│   │   │   └── success/
│   │   │       └── page.tsx              # Order success
│   │   ├── account/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  # Profile
│   │   │   ├── orders/
│   │   │   │   └── page.tsx
│   │   │   ├── wishlist/
│   │   │   │   └── page.tsx
│   │   │   └── addresses/
│   │   │       └── page.tsx
│   │   └── search/
│   │       └── page.tsx
│   │
│   ├── (auth)/                           # Auth pages
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── admin/                            # Admin panel (protected)
│   │   ├── layout.tsx                    # Admin layout: sidebar + topbar
│   │   ├── page.tsx                      # Dashboard
│   │   ├── books/
│   │   │   ├── page.tsx                  # Books list + CRUD
│   │   │   └── [id]/
│   │   │       └── page.tsx              # Edit book
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── customers/
│   │   │   └── page.tsx
│   │   ├── reviews/
│   │   │   └── page.tsx
│   │   ├── api-keys/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   │
│   ├── wp-json/                          # WooCommerce API layer
│   │   └── wc/
│   │       └── v3/
│   │           └── products/
│   │               ├── route.ts          # GET list, POST create
│   │               ├── batch/
│   │               │   └── route.ts
│   │               ├── [id]/
│   │               │   └── route.ts      # GET, PUT, DELETE
│   │               └── categories/
│   │                   ├── route.ts
│   │                   ├── batch/
│   │                   │   └── route.ts
│   │                   └── [id]/
│   │                       └── route.ts
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── admin/
│   │   │   ├── credentials/
│   │   │   │   └── route.ts
│   │   │   ├── stats/
│   │   │   │   └── route.ts
│   │   │   └── upload/
│   │   │       └── route.ts
│   │   ├── store/
│   │   │   ├── checkout/
│   │   │   │   └── route.ts
│   │   │   └── reviews/
│   │   │       └── route.ts
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts
│   │
│   ├── layout.tsx                        # Root layout
│   └── globals.css                       # Tailwind 4 + CSS custom props
│
├── components/
│   ├── ui/                               # Headless primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown.tsx
│   │   ├── skeleton.tsx
│   │   ├── spinner.tsx
│   │   └── toast.tsx                     # Sonner wrapper
│   │
│   ├── motion/                           # Framer wrappers
│   │   ├── fade-up.tsx
│   │   ├── stagger-list.tsx
│   │   ├── page-transition.tsx
│   │   ├── book-card-hover.tsx
│   │   └── count-up.tsx
│   │
│   ├── store/                            # Public store components
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── hero.tsx
│   │   ├── book-card.tsx
│   │   ├── book-grid.tsx
│   │   ├── category-strip.tsx
│   │   ├── search-bar.tsx
│   │   ├── cart-drawer.tsx
│   │   ├── price-display.tsx
│   │   ├── star-rating.tsx
│   │   ├── review-form.tsx
│   │   └── filter-sidebar.tsx
│   │
│   └── admin/                            # Admin components
│       ├── admin-sidebar.tsx
│       ├── admin-topbar.tsx
│       ├── stats-card.tsx
│       ├── data-table.tsx
│       ├── book-form.tsx
│       ├── category-form.tsx
│       ├── order-status-badge.tsx
│       └── image-uploader.tsx
│
├── lib/
│   ├── prisma.ts                         # Singleton Prisma client
│   ├── auth.ts                           # Auth helpers
│   ├── wc-auth.ts                        # WooCommerce Basic Auth
│   ├── wc-response.ts                    # WC-shaped response helpers
│   ├── wc-formatters.ts                  # Product/category → WC shape
│   ├── motion.ts                         # Motion tokens & variants
│   ├── utils.ts                          # cn(), formatPrice(), etc.
│   ├── validations.ts                    # Zod 4 schemas
│   └── constants.ts
│
├── store/                                # Zustand stores
│   ├── cart.ts
│   └── ui.ts
│
├── hooks/
│   ├── use-cart.ts
│   ├── use-wishlist.ts
│   └── use-debounce.ts
│
├── actions/                              # Server Actions
│   ├── auth.ts
│   ├── books.ts
│   ├── categories.ts
│   ├── orders.ts
│   └── cart.ts
│
├── types/
│   └── index.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── auth.ts                               # Auth.js v5 root config
├── proxy.ts
└── next.config.ts
```

---

## 9. WooCommerce-Compatible API Layer

### Auth Middleware

**File:** `lib/wc-auth.ts`

```ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function wcAuthenticate(req: NextRequest): Promise<boolean> {
  // 1. Basic Auth header
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    const decoded = Buffer.from(auth.slice(6), "base64").toString("utf-8");
    const [key, secret] = decoded.split(":");
    if (key && secret) return verifyKey(key, secret, req);
  }

  // 2. Query string (some POS software)
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("consumer_key");
  const secret = searchParams.get("consumer_secret");
  if (key && secret) return verifyKey(key, secret, req);

  return false;
}

async function verifyKey(key: string, secret: string, req: NextRequest): Promise<boolean> {
  const cred = await prisma.apiCredential.findUnique({
    where: { consumerKey: key },
  });

  if (!cred || !cred.isActive || cred.consumerSecret !== secret) return false;

  // Update last used
  await prisma.apiCredential.update({
    where: { id: cred.id },
    data: { lastUsedAt: new Date() },
  });

  return true;
}
```

**File:** `lib/wc-response.ts`

```ts
import { NextResponse } from "next/server";

export const wcError = (code: string, message: string, status: number) =>
  NextResponse.json({ code, message, data: { status } }, { status });

export const wcUnauthorized = () =>
  wcError("woocommerce_rest_authentication_error", "Invalid consumer key or secret.", 401);

export const wcNotFound = (resource = "Resource") =>
  wcError(`woocommerce_rest_${resource.toLowerCase()}_invalid_id`, `Invalid ${resource} ID.`, 404);
```

**File:** `lib/wc-formatters.ts`

```ts
// Converts DB product → WooCommerce REST shape
export function formatWcProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    type: p.type,
    status: p.status,
    featured: p.isFeatured,
    description: p.description,
    short_description: p.shortDescription,
    sku: p.sku ?? "",
    price: String(p.salePrice ?? p.regularPrice),
    regular_price: String(p.regularPrice),
    sale_price: p.salePrice ? String(p.salePrice) : "",
    on_sale: !!p.salePrice,
    manage_stock: p.manageStock,
    stock_quantity: p.stockQuantity,
    stock_status: p.stockStatus,
    total_sales: p.totalSales,
    categories: p.categories?.map((c: any) => ({
      id: c.id, name: c.name, slug: c.slug,
    })) ?? [],
    images: Array.isArray(p.images) ? p.images : [],
    attributes: Array.isArray(p.attributes) ? p.attributes : [],
    variations: p.variations?.map((v: any) => v.id) ?? [],
    meta_data: [
      { key: "isbn", value: p.isbn ?? "" },
      { key: "author", value: p.author ?? "" },
      { key: "publisher", value: p.publisher ?? "" },
      { key: "publish_year", value: p.publishYear ?? "" },
    ],
    date_created: p.createdAt?.toISOString(),
    date_modified: p.updatedAt?.toISOString(),
  };
}

export function formatWcCategory(c: any) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    parent: c.parentId ?? 0,
    description: c.description,
    display: "default",
    image: c.imageUrl ? { src: c.imageUrl, alt: c.name } : null,
    menu_order: c.displayOrder,
    count: c.count,
  };
}

export function parseWcProduct(body: any) {
  return {
    name: body.name,
    type: body.type ?? "simple",
    status: body.status ?? "publish",
    description: body.description ?? "",
    shortDescription: body.short_description ?? "",
    sku: body.sku || null,
    regularPrice: parseFloat(body.regular_price ?? "0"),
    salePrice: body.sale_price ? parseFloat(body.sale_price) : null,
    manageStock: body.manage_stock ?? false,
    stockQuantity: body.stock_quantity ?? null,
    stockStatus: body.stock_status ?? "instock",
    isFeatured: body.featured ?? false,
    images: body.images ?? [],
    attributes: body.attributes ?? [],
    author: body.meta_data?.find((m: any) => m.key === "author")?.value,
    isbn: body.meta_data?.find((m: any) => m.key === "isbn")?.value,
    publisher: body.meta_data?.find((m: any) => m.key === "publisher")?.value,
  };
}
```

### Products Route

**File:** `app/wp-json/wc/v3/products/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { wcAuthenticate, wcUnauthorized } from "@/lib/wc-auth";
import { formatWcProduct, parseWcProduct } from "@/lib/wc-formatters";
import slugify from "slugify";

export async function GET(req: NextRequest) {
  if (!await wcAuthenticate(req)) return wcUnauthorized();

  const { searchParams } = new URL(req.url);
  const perPage = Math.min(Number(searchParams.get("per_page") ?? 10), 100);
  const page = Number(searchParams.get("page") ?? 1);
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const status = searchParams.get("status") ?? "publish";
  const after = searchParams.get("after"); // modified_after

  const where: any = { status };
  if (search) where.OR = [
    { name: { contains: search, mode: "insensitive" } },
    { sku: { contains: search, mode: "insensitive" } },
  ];
  if (category) where.categories = { some: { id: Number(category) } };
  if (after) where.updatedAt = { gte: new Date(after) };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      take: perPage,
      skip: (page - 1) * perPage,
      include: { categories: true, variations: { select: { id: true } } },
      orderBy: { id: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return NextResponse.json(products.map(formatWcProduct), {
    headers: {
      "X-WP-Total": String(total),
      "X-WP-TotalPages": String(totalPages),
      "Link": buildLinkHeader(req, page, totalPages),
    },
  });
}

export async function POST(req: NextRequest) {
  if (!await wcAuthenticate(req)) return wcUnauthorized();

  const body = await req.json();
  const data = parseWcProduct(body);
  const slug = body.slug ?? slugify(body.name, { lower: true, strict: true });

  const product = await prisma.product.create({
    data: {
      ...data,
      slug,
      categories: {
        connect: body.categories?.map((c: any) => ({ id: c.id })) ?? [],
      },
    },
    include: { categories: true, variations: true },
  });

  return NextResponse.json(formatWcProduct(product), { status: 201 });
}

function buildLinkHeader(req: NextRequest, page: number, totalPages: number): string {
  const base = req.url.split("?")[0];
  const links = [];
  if (page > 1) links.push(`<${base}?page=${page - 1}>; rel="prev"`);
  if (page < totalPages) links.push(`<${base}?page=${page + 1}>; rel="next"`);
  return links.join(", ");
}
```

**File:** `app/wp-json/wc/v3/products/[id]/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { wcAuthenticate, wcUnauthorized, wcNotFound } from "@/lib/wc-auth";
import { formatWcProduct, parseWcProduct } from "@/lib/wc-formatters";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  if (!await wcAuthenticate(req)) return wcUnauthorized();
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { categories: true, variations: true },
  });

  if (!product) return wcNotFound("Product");
  return NextResponse.json(formatWcProduct(product));
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!await wcAuthenticate(req)) return wcUnauthorized();
  const { id } = await params;
  const body = await req.json();
  const data = parseWcProduct(body);

  const product = await prisma.product.update({
    where: { id: Number(id) },
    data: {
      ...data,
      ...(body.categories && {
        categories: { set: body.categories.map((c: any) => ({ id: c.id })) },
      }),
    },
    include: { categories: true, variations: true },
  });

  return NextResponse.json(formatWcProduct(product));
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!await wcAuthenticate(req)) return wcUnauthorized();
  const { id } = await params;
  const force = new URL(req.url).searchParams.get("force") === "true";

  const product = force
    ? await prisma.product.delete({ where: { id: Number(id) }, include: { categories: true, variations: true } })
    : await prisma.product.update({ where: { id: Number(id) }, data: { status: "trash" }, include: { categories: true, variations: true } });

  return NextResponse.json(formatWcProduct(product));
}
```

**File:** `app/wp-json/wc/v3/products/batch/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { wcAuthenticate, wcUnauthorized } from "@/lib/wc-auth";
import { formatWcProduct, parseWcProduct } from "@/lib/wc-formatters";
import slugify from "slugify";

export async function POST(req: NextRequest) {
  if (!await wcAuthenticate(req)) return wcUnauthorized();

  const { create = [], update = [], delete: del = [] } = await req.json();

  // Process in parallel — Prisma v7 handles transactions well
  const [created, updated, deleted] = await Promise.all([
    Promise.all(
      create.map(async (item: any) => {
        const data = parseWcProduct(item);
        const slug = item.slug ?? slugify(item.name, { lower: true, strict: true });
        return prisma.product.create({
          data: {
            ...data,
            slug,
            categories: { connect: item.categories?.map((c: any) => ({ id: c.id })) ?? [] },
          },
          include: { categories: true, variations: true },
        });
      })
    ),
    Promise.all(
      update.map((item: any) =>
        prisma.product.update({
          where: { id: item.id },
          data: {
            ...parseWcProduct(item),
            ...(item.categories && { categories: { set: item.categories.map((c: any) => ({ id: c.id })) } }),
          },
          include: { categories: true, variations: true },
        })
      )
    ),
    Promise.all(
      del.map((id: number) =>
        prisma.product.delete({ where: { id }, include: { categories: true, variations: true } })
      )
    ),
  ]);

  return NextResponse.json({
    create: created.map(formatWcProduct),
    update: updated.map(formatWcProduct),
    delete: deleted.map(formatWcProduct),
  });
}
```

### Categories Routes

**File:** `app/wp-json/wc/v3/products/categories/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { wcAuthenticate, wcUnauthorized } from "@/lib/wc-auth";
import { formatWcCategory } from "@/lib/wc-formatters";
import slugify from "slugify";

export async function GET(req: NextRequest) {
  if (!await wcAuthenticate(req)) return wcUnauthorized();

  const { searchParams } = new URL(req.url);
  const perPage = Number(searchParams.get("per_page") ?? 10);
  const page = Number(searchParams.get("page") ?? 1);
  const hideEmpty = searchParams.get("hide_empty") === "true";

  const where: any = {};
  if (hideEmpty) where.count = { gt: 0 };

  const [cats, total] = await Promise.all([
    prisma.category.findMany({
      where,
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: { displayOrder: "asc" },
    }),
    prisma.category.count({ where }),
  ]);

  return NextResponse.json(cats.map(formatWcCategory), {
    headers: { "X-WP-Total": String(total), "X-WP-TotalPages": String(Math.ceil(total / perPage)) },
  });
}

export async function POST(req: NextRequest) {
  if (!await wcAuthenticate(req)) return wcUnauthorized();
  const body = await req.json();

  const cat = await prisma.category.create({
    data: {
      name: body.name,
      slug: body.slug ?? slugify(body.name, { lower: true, strict: true }),
      parentId: body.parent ?? null,
      description: body.description ?? "",
      imageUrl: body.image?.src ?? null,
      displayOrder: body.menu_order ?? 0,
    },
  });

  return NextResponse.json(formatWcCategory(cat), { status: 201 });
}
```

### Generate API Keys (Admin)

**File:** `app/api/admin/credentials/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const creds = await prisma.apiCredential.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(creds);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { description } = await req.json();
  const consumerKey = "ck_" + crypto.randomBytes(20).toString("hex");
  const consumerSecret = "cs_" + crypto.randomBytes(20).toString("hex");

  const cred = await prisma.apiCredential.create({
    data: { description, consumerKey, consumerSecret },
  });

  return NextResponse.json(cred, { status: 201 });
}
```

---

## 10. Public Store — Pages & UI

### Homepage (`app/(store)/page.tsx`)

**Sections in order — all RSC, motion on client:**

```
1. Hero Section
   ├── Full-viewport dark panel
   ├── Animated book spine stack (SVG, framer-motion stagger)
   │   — 5 colored spines slide in from left, tilt 12°, settle
   ├── Headline: "Every page, a new world." (Playfair, 80px)
   ├── Sub: "Pakistan's finest curated bookshop"
   ├── CTA: "Browse Books" (gold button) + "View Deals" (ghost)
   └── Floating particle dust (subtle, CSS animation)

2. Category Strip (horizontal scroll)
   ├── 8 genre pills with icon + name
   └── Entrance: stagger left-to-right, 80ms each

3. Featured Books (4-column grid, RSC data)
   ├── where: { isFeatured: true, status: "publish" }
   ├── BookCard: cover image, title, author, price, "Add to Cart"
   └── Hover: 3D tilt (transform-style: preserve-3d), gold border glow

4. New Arrivals (horizontal scroll ribbon)
   ├── 8 latest books
   └── Scroll indicator arrows (framer drag)

5. Promo Banner
   ├── Full-width dark-crimson panel
   ├── "Up to 40% off — Urdu & Islamic titles"
   └── CTA: "Shop Sale" (ghost crimson border)

6. Bestsellers (grid, 6 books)

7. About Strip
   ├── 3 columns: 10K+ Titles | Lahore Delivery | Secure Checkout
   └── Count-up animation on viewport entry

8. Newsletter Signup
   ├── Email input + "Join" button
   └── 12,000+ readers already subscribed
```

### Book Card (`components/store/book-card.tsx`)

```tsx
"use client";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { PriceDisplay } from "./price-display";

export function BookCard({ book }: { book: Book }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-8, 8]), { stiffness: 300, damping: 30 });

  const { addItem } = useCart();

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      whileHover={{ scale: 1.02 }}
      className="group relative bg-surface rounded-[var(--radius-card)] overflow-hidden 
                 border border-border card-shadow cursor-pointer"
    >
      {/* Sale badge */}
      {book.salePrice && (
        <span className="absolute top-3 left-3 z-10 bg-crimson text-ink 
                         text-badge px-2 py-0.5 rounded font-mono">
          SALE
        </span>
      )}

      {/* Cover image */}
      <Link href={`/books/${book.slug}`}>
        <div className="relative aspect-[2/3] bg-elevated overflow-hidden">
          <Image
            src={book.images?.[0]?.src ?? "/placeholder-book.jpg"}
            alt={book.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-void/60 to-transparent 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 space-y-2">
        <p className="text-muted text-caption line-clamp-1">{book.author}</p>
        <Link href={`/books/${book.slug}`}>
          <h3 className="text-ink font-semibold text-[15px] line-clamp-2 
                         hover:text-gold transition-colors">{book.name}</h3>
        </Link>
        <PriceDisplay regular={book.regularPrice} sale={book.salePrice} />

        {/* Add to Cart */}
        <motion.button
          onClick={() => addItem(book)}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-2 py-2 bg-gold text-void font-semibold text-sm 
                     rounded-[var(--radius-btn)] hover:bg-gold-dim transition-colors 
                     opacity-0 group-hover:opacity-100 translate-y-2 
                     group-hover:translate-y-0 transition-all duration-200"
        >
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
}
```

### Books Listing (`app/(store)/books/page.tsx`)

```
Layout: 2-panel (sidebar + grid)

Left Sidebar (240px, sticky):
  ├── "Filter Books" heading
  ├── Category checkboxes (from DB)
  ├── Price range slider (Radix)
  ├── Language checkboxes (English, Urdu, Arabic...)
  ├── Availability toggle (In Stock only)
  └── "Clear Filters" button

Main Grid:
  ├── Top bar: "{N} results" | Sort dropdown | View toggle (grid/list)
  ├── BookGrid (responsive: 2→3→4 cols)
  ├── Skeleton loading state (8 placeholders)
  └── Pagination (numbered, with prev/next)
```

**URL query params:** `?category=fiction&minPrice=100&maxPrice=2000&lang=urdu&instock=true&sort=newest&page=2`

### Book Detail (`app/(store)/books/[slug]/page.tsx`)

```
Left (60%):
  ├── Image gallery (main image + 4 thumbnails)
  ├── Lightbox on click (dialog)
  └── Zoom on hover

Right (40%):
  ├── Breadcrumbs (Home > Fiction > Book Name)
  ├── Title (Playfair 36px)
  ├── Author + Publisher + Year
  ├── Star rating + "(N reviews)"
  ├── Price display (with sale strikethrough)
  ├── Stock status badge
  ├── Quantity selector (−/+)
  ├── "Add to Cart" (gold, full-width)
  ├── "Add to Wishlist" (ghost)
  ├── Quick details: ISBN, Pages, Language, Genre
  └── Share buttons

Below fold:
  ├── Tabs: Description | Details | Reviews
  └── Related Books (4-grid, same category)
```

### Cart Drawer (`components/store/cart-drawer.tsx`)

```
- Slides in from right (framer AnimatePresence, x: 400→0)
- Backdrop overlay (opacity 0→0.6)
- Items list: image, title, author, qty controls, remove
- Subtotal + "Checkout" CTA
- "Continue Shopping" close
- Empty state: animated book SVG + "Your cart is empty"
```

### Checkout (`app/(store)/checkout/page.tsx`)

```
Step 1: Contact Info (email, name, phone)
Step 2: Shipping Address
Step 3: Payment (Stripe Elements)
Step 4: Review & Place Order

- Animated step indicator (4 dots, active = gold)
- Each step slides left/right on transition (framer)
- Order summary sidebar (sticky on desktop)
```

---

## 11. Admin Panel — Pages & UI

### Admin Layout (`app/admin/layout.tsx`)

```tsx
// Sidebar (fixed, 240px) + main content
// Sidebar sections:
//  Dashboard
//  ─ Catalog: Books | Categories | Tags
//  ─ Orders
//  ─ Customers | Reviews
//  ─ POS Sync: API Keys
//  ─ Settings
// Active state: gold left border + gold text
// Logo: "📚 Book Depot" top-left
// Bottom: user avatar + logout
```

### Dashboard (`app/admin/page.tsx`)

```
Stats Row (4 cards, animated count-up):
  ├── Total Revenue (PKR)
  ├── Orders Today
  ├── Total Books
  └── Active Customers

Charts Row:
  ├── Revenue Line Chart (last 30 days) — recharts
  └── Top Categories Donut Chart

Tables:
  ├── Recent Orders (last 10, with status badges)
  └── Low Stock Books (stockQty < 5)

Quick Actions:
  ├── "+ Add Book"
  └── "View All Orders"
```

**Stats API:** `GET /api/admin/stats`

```ts
// Returns:
{
  revenue: { total: 450000, today: 12500, growth: 8.2 },
  orders: { total: 1240, today: 14, pending: 23 },
  products: { total: 3200, outOfStock: 42 },
  customers: { total: 892, new: 15 }
}
```

### Books Management (`app/admin/books/page.tsx`)

```
DataTable:
  Columns: Cover | Title | Author | SKU | Price | Stock | Status | Actions
  Features:
    ├── Search input (debounced 300ms)
    ├── Status filter (Published | Draft | Trash)
    ├── Category filter
    ├── Bulk select + bulk delete/publish
    ├── Per-page selector (25/50/100)
    └── Sort on column headers

Row actions: Edit | Duplicate | Delete (confirm dialog)
"+ Add Book" button → opens slide-over form (not navigate)
```

### Book Form (`components/admin/book-form.tsx`)

```
Section 1: Basic Info
  ├── Title (required)
  ├── Author
  ├── ISBN
  ├── Publisher
  ├── Publish Year
  ├── Language (select)
  └── Description (rich text — simple textarea, bold/italic/lists)

Section 2: Pricing & Inventory
  ├── Regular Price (PKR)
  ├── Sale Price (optional)
  ├── SKU (auto-generate button)
  ├── Manage Stock? (toggle)
  └── Stock Quantity (if manage stock)

Section 3: Categories & Tags
  ├── Category multi-select (searchable)
  └── Tags (chip input)

Section 4: Images
  ├── Drag-and-drop upload (Uploadthing)
  ├── Multiple images, reorderable
  └── First image = cover

Section 5: SEO
  ├── Meta Title
  └── Meta Description

Section 6: Publishing
  ├── Status (Published | Draft)
  ├── Featured toggle
  └── Save / Save Draft
```

### Orders Management (`app/admin/orders/page.tsx`)

```
DataTable:
  Columns: Order # | Date | Customer | Items | Total | Payment | Status | Actions
  Filters: Status | Date Range | Payment Status

Order Detail Page:
  ├── Order header (number, date, status badge + edit)
  ├── Items table (cover, name, qty, price, total)
  ├── Totals breakdown (subtotal, shipping, tax, total)
  ├── Customer & billing info
  ├── Shipping address
  ├── Payment info (Stripe payment ID)
  └── Order notes (internal)

Status workflow: PENDING → PROCESSING → SHIPPED → DELIVERED
```

### API Keys (`app/admin/api-keys/page.tsx`)

```
Table:
  Description | Consumer Key | Created | Last Used | Status | Actions
  
Generate New Key:
  ├── Description input
  └── "Generate" → shows key + secret ONCE (copy buttons)
  ⚠️ "Store this secret safely — it won't be shown again."

Revoke = toggle isActive = false
```

---

## 12. Animation System

### Page Transitions (`components/motion/page-transition.tsx`)

```tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### FadeUp Wrapper (`components/motion/fade-up.tsx`)

```tsx
"use client";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

### Stagger List (`components/motion/stagger-list.tsx`)

```tsx
"use client";
import { motion } from "framer-motion";
import { stagger, fadeUp } from "@/lib/motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export function StaggerList({
  children,
  className,
  staggerDelay = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      variants={stagger(staggerDelay)}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}
```

### Count-Up (`components/motion/count-up.tsx`)

```tsx
"use client";
import { useInView, useMotionValue, useSpring, animate } from "framer-motion";
import { useEffect, useRef } from "react";

export function CountUp({
  target,
  prefix = "",
  suffix = "",
  duration = 2,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate(v) {
        if (ref.current) {
          ref.current.textContent =
            prefix + Math.floor(v).toLocaleString() + suffix;
        }
      },
    });
    return controls.stop;
  }, [inView, target, prefix, suffix, duration]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}
```

### Hero Book Spine Animation

```tsx
// components/store/hero.tsx — signature animation
"use client";
import { motion } from "framer-motion";

const SPINES = [
  { color: "#C0392B", title: "Fiction",    width: 28, height: 180 },
  { color: "#E8A83E", title: "History",    width: 22, height: 210 },
  { color: "#2980B9", title: "Science",    width: 32, height: 195 },
  { color: "#27AE60", title: "Self Help",  width: 24, height: 170 },
  { color: "#8E44AD", title: "Urdu",       width: 30, height: 220 },
];

export function HeroSpines() {
  return (
    <motion.div
      className="flex items-end gap-1"
      variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      initial="hidden"
      animate="visible"
    >
      {SPINES.map((spine, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { y: 80, opacity: 0, rotate: 15 },
            visible: { y: 0, opacity: 1, rotate: -4 + i * 2,
              transition: { type: "spring", stiffness: 200, damping: 22 } },
          }}
          whileHover={{ rotate: 0, scale: 1.08, y: -8 }}
          style={{
            width: spine.width,
            height: spine.height,
            background: spine.color,
            borderRadius: "3px 6px 6px 3px",
            boxShadow: "inset -4px 0 8px rgba(0,0,0,0.3), 4px 4px 16px rgba(0,0,0,0.5)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            writingMode: "vertical-rl",
            fontSize: "9px",
            fontFamily: "var(--font-display)",
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "0.1em",
            userSelect: "none",
          }}
        >
          {spine.title}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Cart Drawer Animation

```tsx
// Wrap with AnimatePresence in navbar/root
<AnimatePresence>
  {cartOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setCartOpen(false)}
        className="fixed inset-0 z-40 bg-void/70 backdrop-blur-sm"
      />
      {/* Drawer */}
      <motion.aside
        key="drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[400px] 
                   bg-surface border-l border-border overflow-y-auto"
      >
        {/* Cart content */}
      </motion.aside>
    </>
  )}
</AnimatePresence>
```

---

## 13. State Management

### Cart Store (`store/cart.ts`)

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: number;
  name: string;
  slug: string;
  author?: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  variationId?: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
        get().openCart();
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "book-depot-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
```

### UI Store (`store/ui.ts`)

```ts
import { create } from "zustand";

interface UIStore {
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  toggleSearch: () => void;
  toggleMenu: () => void;
  closeAll: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  searchOpen: false,
  mobileMenuOpen: false,
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen, mobileMenuOpen: false })),
  toggleMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen, searchOpen: false })),
  closeAll: () => set({ searchOpen: false, mobileMenuOpen: false }),
}));
```

---

## 14. Data Fetching Strategy

### Provider Setup

```tsx
// app/layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, gcTime: 5 * 60_000 },
  },
});

// Wrap children in <QueryClientProvider client={queryClient}>
```

### Server-Side (RSC — preferred for listings)

```ts
// app/(store)/books/page.tsx
import prisma from "@/lib/prisma";

// Direct Prisma — no API overhead, fully typed
const books = await prisma.product.findMany({
  where: { status: "publish" },
  include: { categories: true },
  orderBy: { createdAt: "desc" },
  take: 24,
});
```

### Client-Side (Admin mutations)

```ts
// hooks/use-books.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useBooks(params: BooksParams) {
  return useQuery({
    queryKey: ["admin", "books", params],
    queryFn: () => fetch(`/api/admin/books?${new URLSearchParams(params as any)}`).then((r) => r.json()),
  });
}

export function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => fetch(`/api/admin/books/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "books"] }),
  });
}
```

---

## 15. Image Uploads

### Uploadthing Config

**File:** `app/api/uploadthing/core.ts`

```ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  bookCoverUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async () => {
      const session = await auth();
      if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");
      return { userId: session!.user!.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),

  categoryImageUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");
      return {};
    })
    .onUploadComplete(async ({ file }) => ({ url: file.ufsUrl })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

**File:** `app/api/uploadthing/route.ts`

```ts
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";
export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
```

**Usage in Book Form:**

```tsx
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

<UploadButton<OurFileRouter, "bookCoverUploader">
  endpoint="bookCoverUploader"
  onClientUploadComplete={(files) => {
    setImages((prev) => [...prev, ...files.map((f) => ({ src: f.url, alt: "" }))]);
  }}
/>
```

---

## 16. Payments

### Stripe Checkout Flow

**File:** `app/api/store/checkout/route.ts`

```ts
import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const session = await auth();
  const { items, shippingAddress, billingAddress } = await req.json();

  // Create order in DB first
  const orderNumber = await generateOrderNumber();
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session?.user?.id,
      status: "PENDING",
      paymentStatus: "UNPAID",
      subtotal: calcSubtotal(items),
      total: calcTotal(items),
      billingAddress,
      shippingAddress,
      items: {
        create: items.map((item: any) => ({
          productId: item.id,
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          imageUrl: item.imageUrl,
        })),
      },
    },
  });

  // Create Stripe session
  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    currency: "pkr",
    line_items: items.map((item: any) => ({
      price_data: {
        currency: "pkr",
        product_data: { name: item.name, images: item.imageUrl ? [item.imageUrl] : [] },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    })),
    metadata: { orderId: order.id },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${order.orderNumber}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
  });

  return NextResponse.json({ url: stripeSession.url });
}
```

### Stripe Webhook

**File:** `app/api/webhooks/stripe/route.ts`

```ts
import Stripe from "stripe";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response("Webhook signature invalid", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.CheckoutSession;
    await prisma.order.update({
      where: { id: session.metadata!.orderId },
      data: {
        paymentStatus: "PAID",
        status: "PROCESSING",
        stripePaymentId: session.payment_intent as string,
      },
    });
  }

  return new Response("ok");
}
```

---

## 17. Reusable Components

### Button (`components/ui/button.tsx`)

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:  "bg-gold text-void hover:bg-gold-dim rounded-[var(--radius-btn)]",
        ghost:    "border border-border text-ink hover:border-gold hover:text-gold rounded-[var(--radius-btn)]",
        crimson:  "bg-crimson text-ink hover:bg-crimson-dim rounded-[var(--radius-btn)]",
        muted:    "bg-elevated text-muted hover:text-ink rounded-[var(--radius-btn)]",
        link:     "text-gold underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm:  "h-8 px-3 text-sm",
        md:  "h-10 px-5 text-sm",
        lg:  "h-12 px-7 text-base",
        xl:  "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(buttonVariants({ variant, size }), className)}
      {...(props as any)}
    />
  );
}
```

### Badge (`components/ui/badge.tsx`)

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded font-mono text-[11px] font-bold uppercase tracking-wider px-2 py-0.5",
  {
    variants: {
      variant: {
        default:   "bg-elevated text-muted",
        gold:      "bg-gold/20 text-gold",
        crimson:   "bg-crimson/20 text-crimson",
        green:     "bg-green-900/30 text-green-400",
        blue:      "bg-blue-900/30 text-blue-400",
        outline:   "border border-border text-muted",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
```

### Price Display (`components/store/price-display.tsx`)

```tsx
export function PriceDisplay({ regular, sale }: { regular: number; sale?: number | null }) {
  const formatPKR = (n: number) =>
    `PKR ${n.toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  if (sale) {
    return (
      <div className="flex items-baseline gap-2">
        <span className="text-gold font-bold text-lg">{formatPKR(sale)}</span>
        <span className="text-muted line-through text-sm">{formatPKR(regular)}</span>
        <span className="text-crimson text-xs font-mono">
          -{Math.round((1 - sale / regular) * 100)}%
        </span>
      </div>
    );
  }
  return <span className="text-ink font-bold text-lg">{formatPKR(regular)}</span>;
}
```

### Utilities (`lib/utils.ts`)

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatPKR = (amount: number) =>
  `PKR ${amount.toLocaleString("en-PK", { minimumFractionDigits: 0 })}`;

export const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.order.count();
  return `BD-${year}-${String(count + 1).padStart(4, "0")}`;
};

export const slugify_safe = (text: string) =>
  text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").trim();
```

### Validations (`lib/validations.ts`)

```ts
// Zod 4 schemas
import { z } from "zod";

export const BookSchema = z.object({
  name: z.string().min(1, "Title is required"),
  author: z.string().optional(),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  publishYear: z.number().int().min(1000).max(2100).optional(),
  language: z.string().default("English"),
  regularPrice: z.number().positive("Price must be positive"),
  salePrice: z.number().positive().optional(),
  sku: z.string().optional(),
  description: z.string().default(""),
  shortDescription: z.string().default(""),
  manageStock: z.boolean().default(false),
  stockQuantity: z.number().int().nonnegative().optional(),
  categoryIds: z.array(z.number()).min(1, "Select at least one category"),
  images: z.array(z.object({ src: z.string().url(), alt: z.string().default("") })).default([]),
  isFeatured: z.boolean().default(false),
  status: z.enum(["publish", "draft"]).default("publish"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const CategorySchema = z.object({
  name: z.string().min(1),
  parentId: z.number().optional(),
  description: z.string().default(""),
  imageUrl: z.string().url().optional(),
  displayOrder: z.number().int().default(0),
});

export const CheckoutSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  phone: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().optional(),
  zip: z.string().optional(),
  notes: z.string().optional(),
});
```

---

## 18. Agent Task Assignments

Follow this order. Do not proceed to the next task until the current one is complete, committed, and tested.

### Phase 1 — Foundation

| Task | File(s) | Notes |
|---|---|---|
| 1.1 Init project | `package.json`, `next.config.ts` | Run `create-next-app` + install deps |
| 1.2 Tailwind 4 design tokens | `app/globals.css` | Paste CSS variables from Section 3 |
| 1.3 Fonts | `app/layout.tsx` | Google Fonts: Playfair + Inter + JetBrains |
| 1.4 Prisma schema | `prisma/schema.prisma` | Full schema from Section 6 |
| 1.5 DB migrate | Terminal | `npx prisma migrate dev --name init` |
| 1.6 Prisma seed | `prisma/seed.ts` | Admin user + 8 categories |
| 1.7 Auth.js v5 | `auth.ts`, `proxy.ts` | Credentials + JWT callbacks |
| 1.8 Motion tokens | `lib/motion.ts` | All variants from Section 3 |
| 1.9 Utilities | `lib/utils.ts`, `lib/validations.ts` | cn(), Zod schemas |

### Phase 2 — WooCommerce API

| Task | File(s) | Notes |
|---|---|---|
| 2.1 WC auth | `lib/wc-auth.ts` | Basic Auth + query string |
| 2.2 WC formatters | `lib/wc-formatters.ts` | format/parse product + category |
| 2.3 Products routes | `app/wp-json/wc/v3/products/...` | GET, POST, PUT, DELETE, batch |
| 2.4 Category routes | `app/wp-json/wc/v3/products/categories/...` | GET, POST, batch |
| 2.5 API key routes | `app/api/admin/credentials/route.ts` | Generate + list |
| 2.6 Test with Postman | — | Verify POS-compatible shapes |

### Phase 3 — Admin Panel

| Task | File(s) | Notes |
|---|---|---|
| 3.1 Admin layout | `app/admin/layout.tsx` + `components/admin/admin-sidebar.tsx` | Sidebar nav + topbar |
| 3.2 Dashboard stats | `app/admin/page.tsx`, `app/api/admin/stats/route.ts` | Count-up, recharts |
| 3.3 Uploadthing | `app/api/uploadthing/...` | Image upload config |
| 3.4 Book form | `components/admin/book-form.tsx` | Full form with RHF + Zod 4 |
| 3.5 Books table | `app/admin/books/page.tsx` | DataTable + search + filters |
| 3.6 Categories CRUD | `app/admin/categories/page.tsx` | Table + inline form |
| 3.7 Orders table | `app/admin/orders/page.tsx` | Listing + status update |
| 3.8 Order detail | `app/admin/orders/[id]/page.tsx` | Full order view |
| 3.9 Customers table | `app/admin/customers/page.tsx` | User listing |
| 3.10 API Keys page | `app/admin/api-keys/page.tsx` | Generate + revoke |
| 3.11 Settings | `app/admin/settings/page.tsx` | Store name, currency, shipping |

### Phase 4 — Public Store

| Task | File(s) | Notes |
|---|---|---|
| 4.1 Store layout | `app/(store)/layout.tsx` | Navbar + footer + cart drawer |
| 4.2 Navbar | `components/store/navbar.tsx` | Logo, nav, search, cart icon, account |
| 4.3 Hero | `components/store/hero.tsx` | Book spine animation (signature element) |
| 4.4 Homepage | `app/(store)/page.tsx` | All 8 sections |
| 4.5 BookCard | `components/store/book-card.tsx` | 3D tilt, add to cart |
| 4.6 Cart store | `store/cart.ts` | Zustand + persist |
| 4.7 Cart drawer | `components/store/cart-drawer.tsx` | Slide-in animation |
| 4.8 Books listing | `app/(store)/books/page.tsx` | Grid + filter sidebar |
| 4.9 Book detail | `app/(store)/books/[slug]/page.tsx` | Gallery + info + reviews |
| 4.10 Category page | `app/(store)/categories/[slug]/page.tsx` | Filtered grid |
| 4.11 Search | `app/(store)/search/page.tsx` | Full-text search |
| 4.12 Auth pages | `app/(auth)/login/page.tsx`, `register/page.tsx` | Animated panels |
| 4.13 Account area | `app/(store)/account/...` | Profile, orders, wishlist |

### Phase 5 — Payments & Polish

| Task | File(s) | Notes |
|---|---|---|
| 5.1 Checkout page | `app/(store)/checkout/page.tsx` | Multi-step with Stripe Elements |
| 5.2 Checkout API | `app/api/store/checkout/route.ts` | Create order + Stripe session |
| 5.3 Stripe webhook | `app/api/webhooks/stripe/route.ts` | Update order on payment |
| 5.4 Success page | `app/(store)/checkout/success/page.tsx` | Order confirm + confetti |
| 5.5 Mobile responsive | All pages | Test at 375px |
| 5.6 SEO | `app/(store)/books/[slug]/page.tsx` | generateMetadata |
| 5.7 Loading states | All pages | Skeleton components |
| 5.8 Error boundaries | All pages | error.tsx + not-found.tsx |
| 5.9 Footer | `components/store/footer.tsx` | Links, newsletter, socials |

---

## 19. Coding Conventions

### General

- **All components:** TypeScript strict mode — no `any` except WC formatter raw inputs
- **Server vs Client:** Prefer RSC for data fetching; add `"use client"` only for interactivity or hooks
- **Imports:** Absolute with `@/` alias always
- **Formatting:** Prettier defaults, single quotes, no semicolons in JSX
- **Naming:** PascalCase components, camelCase functions, kebab-case files
- **Error handling:** try/catch with `console.error` in all API routes; return proper HTTP status codes

### Framer Motion

- **Always** respect `prefers-reduced-motion` using `useReducedMotion()`
- Wrap reduced-motion check in a utility:

```ts
// lib/motion.ts
import { useReducedMotion } from "framer-motion";
export function useMotion() {
  const reduce = useReducedMotion();
  return { shouldAnimate: !reduce };
}
```

### Prisma v7

- Use singleton pattern in `lib/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export default prisma;
```

### Zod 4

- Use `.safeParse()` for form validation — never `.parse()` in API routes
- Export all schemas from `lib/validations.ts`
- Use `z.infer<typeof Schema>` for TypeScript types

### Next.js 16 App Router

- Use `Promise<{ params: ... }>` for dynamic route params (Next 16 async params)
- Use `generateMetadata` for all public-facing pages
- Never use `getServerSideProps` or `getStaticProps`
- Prefer Server Actions for mutations over separate API routes when within the store

### Tailwind 4

- Use `@theme` block in `globals.css` — no `tailwind.config.ts`
- Use CSS variable names directly in `cn()` utilities
- Custom utility classes go in `@layer utilities`

---

## 20. Deployment

### Production Checklist

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed production (once)
npx prisma db seed

# Build
npm run build

# Start
npm start
```

### Vercel (Recommended)

1. Connect GitHub repo to Vercel
2. Set all environment variables in Vercel dashboard
3. Set `DATABASE_URL` to Neon/Supabase PostgreSQL connection string
4. Add Stripe webhook URL: `https://yourdomain.com/api/webhooks/stripe`
5. Add Uploadthing token via dashboard

### Next.js Config (`next.config.ts`)

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },          // Uploadthing
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "covers.openlibrary.org" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
```

### POS Integration Setup

Once deployed, configure your POS software:

```
Store URL:       https://your-book-depot.com
Consumer Key:    ck_xxxx   ← Generated in /admin/api-keys
Consumer Secret: cs_xxxx   ← Generated in /admin/api-keys
WooCommerce:     Yes / Enabled
API Version:     v3
```

The POS will sync to your custom Next.js app as if it were WooCommerce — no POS modification needed.

---

*End of AGENTS.md — Book Depot v1.0*
*Total spec: ~1,400 lines | Covers: API, DB, Auth, UI, Animations, Payments, Deployment*
