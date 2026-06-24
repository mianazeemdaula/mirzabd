// app/(store)/books/[slug]/page.tsx
import React from "react";
import Script from "next/script";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Calendar, Globe, FileText, CheckCircle2, ChevronRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { PriceDisplay } from "@/components/store/price-display";
import { StarRating } from "@/components/store/star-rating";
import { BookGrid } from "@/components/store/book-grid";
import { ReviewForm } from "@/components/store/review-form";
import { Button } from "@/components/ui/button";
import { AddToBagButton } from "@/components/store/add-to-bag-button";
import { formatPKR, serializeProduct } from "@/lib/utils";
import { toast } from "sonner";

interface BookDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BookDetailPageProps) {
  const { slug } = await params;
  const book = await prisma.product.findUnique({
    where: { slug },
  });

  if (!book) return { title: "Product Not Found" };

  return {
    title: `${book.name} by ${book.author || "Unknown Author"}`,
    description: book.shortDescription || book.description?.slice(0, 160),
  };
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { slug } = await params;

  // 1. Fetch book details including categories and reviews
  const book = await prisma.product.findUnique({
    where: { slug },
    include: {
      categories: {
        where: { isActive: true },
      },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!book || book.status !== "publish") {
    notFound();
  }

  const serializedBook = serializeProduct(book);

  // Parse images JSON
  let coverImage = "/images/placeholder-book.png";
  if (book.images) {
    try {
      const parsedImages = typeof book.images === "string" ? JSON.parse(book.images) : book.images;
      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        coverImage = parsedImages[0].src;
      }
    } catch (e) {
      coverImage = "/images/placeholder-book.png";
    }
  }

  // Check stock availability
  const isOutOfStock = book.stockStatus === "outofstock" || (book.manageStock && book.stockQuantity !== null && book.stockQuantity <= 0);

  // 2. Fetch related books (books sharing the same categories, excluding the current book)
  const categoryIds = book.categories.map((c) => c.id);
  const relatedBooks = await prisma.product.findMany({
    where: {
      status: "publish",
      id: { not: book.id },
      categories: {
        some: {
          id: { in: categoryIds },
        },
      },
    },
    include: {
      categories: true,
    },
    take: 4,
    orderBy: { totalSales: "desc" },
  });

  // Calculate average review rating
  const reviewsCount = book.reviews.length;
  const ratingAverage = reviewsCount > 0 
    ? Number((book.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1))
    : Number(book.averageRating || 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted">
        <Link href="/" className="hover:text-gold transition-colors">Home</Link>
        <ChevronRight size={14} />
        <Link href="/books" className="hover:text-gold transition-colors">Shop</Link>
        {book.categories.length > 0 && (
          <>
            <ChevronRight size={14} />
            <Link
              href={`/books?category=${book.categories[0].slug}`}
              className="hover:text-gold transition-colors"
            >
              {book.categories[0].name}
            </Link>
          </>
        )}
        <ChevronRight size={14} />
        <span className="text-ink truncate max-w-[200px] sm:max-w-none">{book.name}</span>
      </nav>

      {/* Book Primary Column Info */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Book Cover Image */}
        <div className="md:col-span-5 lg:col-span-4 flex justify-center">
          <div className="relative aspect-[2/3] w-full max-w-[320px] rounded-[var(--radius-card)] overflow-hidden bg-surface border border-border shadow-card">
            <Image
              src={coverImage}
              alt={book.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Right Column: Book Metadata & Buying Panel */}
        <div className="md:col-span-7 lg:col-span-8 space-y-6">
          <div className="space-y-3">
            {/* Author */}
            {book.author && (
              <span className="text-sm text-gold font-semibold uppercase tracking-wider">
                {book.author}
              </span>
            )}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink leading-tight">
              {book.name}
            </h1>

            {/* Ratings & reviews sum */}
            <div className="flex items-center gap-3">
              <StarRating rating={ratingAverage} size={16} />
              <span className="text-sm font-semibold text-ink">{ratingAverage}</span>
              <span className="text-xs text-muted">({reviewsCount} customer reviews)</span>
            </div>
          </div>

          <hr className="border-border" />

          {/* Pricing */}
          <div className="space-y-1">
            <PriceDisplay regularPrice={book.regularPrice} salePrice={book.salePrice} size="lg" />
            <span className="text-xs text-muted">Inclusive of all local sales taxes</span>
          </div>

          {/* Short description */}
          {book.shortDescription && (
            <p className="text-sm text-muted leading-relaxed font-body">
              {book.shortDescription}
            </p>
          )}

          {/* Core Spec strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 px-4 bg-surface border border-border rounded-[var(--radius-card)]">
            <div className="flex items-center gap-2.5 text-xs">
              <BookOpen size={16} className="text-gold" />
              <div>
                <span className="text-muted block">Publisher</span>
                <span className="text-ink font-semibold">{book.publisher || "N/A"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <Calendar size={16} className="text-gold" />
              <div>
                <span className="text-muted block">Year</span>
                <span className="text-ink font-semibold">{book.publishYear || "N/A"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <Globe size={16} className="text-gold" />
              <div>
                <span className="text-muted block">Language</span>
                <span className="text-ink font-semibold">{book.language}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <FileText size={16} className="text-gold" />
              <div>
                <span className="text-muted block">Pages</span>
                <span className="text-ink font-semibold">{book.pages || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Stock / Buy Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 size={16} className={isOutOfStock ? "text-crimson" : "text-green-500"} />
              <span className="font-semibold text-ink">
                {isOutOfStock 
                  ? "Out of Stock" 
                  : book.manageStock && book.stockQuantity !== null
                    ? `In Stock (${book.stockQuantity} copies remaining)`
                    : "In Stock"
                }
              </span>
            </div>

            {/* Simulated Form for checkout add actions */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <AddToBagButton book={serializedBook} coverImage={coverImage} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs description / specs / reviews */}
      <div className="border-t border-border pt-12 space-y-8">
        <div className="border-b border-border">
          <div className="flex gap-8 text-sm font-semibold uppercase tracking-wider pb-3">
            <span className="text-gold border-b-2 border-gold pb-3 cursor-pointer">Product Description</span>
          </div>
        </div>

        {/* Tab content: Description & Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left panel: Description details */}
          <div className="lg:col-span-8 space-y-6">
            <div className="prose prose-invert max-w-none text-muted text-sm sm:text-base leading-relaxed space-y-4 font-body">
              <p>{book.description || "No full description available for this title."}</p>
            </div>

            {/* Review Listings */}
            <div className="pt-8 border-t border-border space-y-6">
              <h3 className="font-display text-xl font-bold text-ink">
                Customer Reviews ({reviewsCount})
              </h3>

              {reviewsCount === 0 ? (
                <p className="text-sm text-muted">There are no reviews for this product yet. Be the first to share your thoughts!</p>
              ) : (
                <div className="space-y-4">
                  {book.reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-surface border border-border/60 rounded-[var(--radius-card)] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-ink">{review.name}</span>
                        <span className="text-[10px] text-muted">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} size={12} />
                        {review.title && <span className="text-xs font-bold text-ink">{review.title}</span>}
                      </div>
                      <p className="text-xs sm:text-sm text-muted leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Sidebar write review form */}
          <div className="lg:col-span-4">
            <ReviewForm productId={book.id} />
          </div>
        </div>
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <div className="border-t border-border pt-12 space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">
            Related Collections
          </h2>
          <BookGrid books={relatedBooks.map(serializeProduct)} />
        </div>
      )}

      {/* Add Client-Side Handler binding script for dynamic add to cart from Server Components */}
      <Script
        id="book-add-to-cart-handler"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.addToCartDirectly = function(book, coverImage) {
              const state = window.localStorage.getItem('mirza-book-depot-cart');
              let cartItems = [];
              if (state) {
                try {
                  cartItems = JSON.parse(state).state.items;
                } catch(e) {}
              }
              const itemIdx = cartItems.findIndex(i => i.id === 'p-' + book.id);
              if (itemIdx > -1) {
                cartItems[itemIdx].quantity += 1;
              } else {
                cartItems.push({
                  id: 'p-' + book.id,
                  productId: book.id,
                  variationId: null,
                  name: book.name,
                  sku: book.sku,
                  price: book.salePrice !== null ? Number(book.salePrice) : Number(book.regularPrice),
                  regularPrice: Number(book.regularPrice),
                  imageUrl: coverImage,
                  stockQuantity: book.stockQuantity,
                  manageStock: book.manageStock,
                  quantity: 1
                });
              }
              // save back to localStorage
              const serialized = JSON.stringify({
                state: {
                  items: cartItems,
                  isOpen: true
                },
                version: 0
              });
              window.localStorage.setItem('mirza-book-depot-cart', serialized);
              // Dispatch storage event to trigger Zustand sync
              window.dispatchEvent(new Event('storage'));
              // Direct reload or state trigger
              window.location.reload();
            }
          `,
        }}
      />
    </div>
  );
}
