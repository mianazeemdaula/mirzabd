// app/admin/products/[id]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { BookEditWrapper } from "./book-edit-wrapper";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface EditBookPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditBookPage({ params }: EditBookPageProps) {
  const { id } = await params;
  const bookId = parseInt(id);

  if (isNaN(bookId)) {
    notFound();
  }

  // 1. Fetch book including categories
  const book = await prisma.product.findUnique({
    where: { id: bookId },
    include: {
      categories: true,
    },
  });

  if (!book) {
    notFound();
  }

  // 2. Fetch categories checklist
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  // 3. Format defaultValues for form compatibility (Decimals -> Numbers, categoryIds array)
  const defaultValues = {
    name: book.name,
    slug: book.slug,
    type: book.type as any,
    status: book.status as any,
    description: book.description || "",
    shortDescription: book.shortDescription || "",
    sku: book.sku || "",
    isbn: book.isbn || "",
    author: book.author || "",
    publisher: book.publisher || "",
    publishYear: book.publishYear,
    pages: book.pages,
    language: book.language,
    regularPrice: Number(book.regularPrice),
    salePrice: book.salePrice ? Number(book.salePrice) : null,
    manageStock: book.manageStock,
    stockQuantity: book.stockQuantity || 10,
    stockStatus: book.stockStatus as any,
    weight: book.weight ? Number(book.weight) : null,
    isFeatured: book.isFeatured,
    images: (book.images as any) || [],
    attributes: (book.attributes as any) || [],
    categoryIds: book.categories.map((c) => c.id),
    tagIds: [],
    metaTitle: book.metaTitle || "",
    metaDescription: book.metaDescription || "",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Link href="/admin/products" className="p-1.5 border border-border rounded-[var(--radius-btn)] text-muted hover:text-gold hover:border-gold transition-colors">
          <ChevronLeft size={16} />
        </Link>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Edit Product</h1>
          <p className="text-xs text-muted">Modify existing inventory product listings or update stock levels.</p>
        </div>
      </div>

      {/* Form Wrapper */}
      <BookEditWrapper bookId={bookId} categories={categories} defaultValues={defaultValues} />
    </div>
  );
}
