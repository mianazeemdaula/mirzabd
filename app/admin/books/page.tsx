// app/admin/books/page.tsx
import React from "react";
import Link from "next/link";
import { ProductImage } from "@/components/store/product-image";
import Script from "next/script";
import prisma from "@/lib/prisma";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/utils";
import { Plus, Edit, Trash2 } from "lucide-react";
import { deleteBook } from "@/actions/books";

interface AdminBooksPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminBooksPage({ searchParams }: AdminBooksPageProps) {
  const params = await searchParams;
  const searchQuery = params.q || "";
  const page = params.page ? parseInt(params.page) : 1;
  const limit = 15;
  const skip = (page - 1) * limit;

  // 1. Build Search Query Filter
  const where: any = {};
  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { author: { contains: searchQuery, mode: "insensitive" } },
      { publisher: { contains: searchQuery, mode: "insensitive" } },
      { isbn: { contains: searchQuery, mode: "insensitive" } },
      { sku: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  // 2. Fetch Books & Count
  const [books, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const serializedBooks = books.map((book) => ({
    ...book,
    regularPrice: Number(book.regularPrice),
    salePrice: book.salePrice ? Number(book.salePrice) : null,
    weight: book.weight ? Number(book.weight) : null,
    averageRating: Number(book.averageRating),
  }));

  const totalPages = Math.ceil(totalCount / limit);

  // 3. Define Table Columns mapping
  const columns = [
    {
      key: "images",
      header: "Cover",
      render: (book: any) => {
        let coverSrc = "/images/placeholder-book.png";
        if (book.images) {
          try {
            const parsed = typeof book.images === "string" ? JSON.parse(book.images) : book.images;
            if (Array.isArray(parsed) && parsed.length > 0) coverSrc = parsed[0].src;
          } catch (e) {}
        }
        return (
          <div className="relative h-10 w-7 bg-void rounded overflow-hidden">
            <ProductImage src={coverSrc} alt={book.name} fill className="object-cover" />
          </div>
        );
      },
    },
    {
      key: "name",
      header: "Title",
      render: (book: any) => (
        <div className="max-w-[200px] truncate">
          <span className="font-bold text-ink block">{book.name}</span>
          <span className="text-[10px] text-muted font-mono">{book.sku || "No SKU"}</span>
        </div>
      ),
    },
    {
      key: "author",
      header: "Author",
    },
    {
      key: "regularPrice",
      header: "Price",
      render: (book: any) => {
        const hasSale = book.salePrice !== null;
        return (
          <div className="font-mono">
            {hasSale ? (
              <>
                <span className="text-gold font-semibold block">{formatPKR(Number(book.salePrice))}</span>
                <span className="text-[10px] text-muted line-through">{formatPKR(Number(book.regularPrice))}</span>
              </>
            ) : (
              <span className="text-ink font-semibold">{formatPKR(Number(book.regularPrice))}</span>
            )}
          </div>
        );
      },
    },
    {
      key: "stockQuantity",
      header: "Inventory",
      render: (book: any) => {
        if (!book.manageStock) {
          return (
            <Badge variant={book.stockStatus === "instock" ? "green" : "crimson"} className="rounded text-[10px]">
              {book.stockStatus === "instock" ? "In Stock" : "Out of Stock"}
            </Badge>
          );
        }
        const isLow = book.stockQuantity <= 5;
        const isOut = book.stockQuantity <= 0;
        return (
          <div className="flex flex-col gap-0.5">
            <span className={`font-mono text-xs font-bold ${isOut ? "text-crimson" : isLow ? "text-yellow-400" : "text-green-400"}`}>
              {book.stockQuantity} Copies
            </span>
            <span className="text-[9px] text-muted">Managed Stock</span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (book: any) => (
        <Badge variant={book.status === "publish" ? "green" : "outline"} className="rounded text-[10px]">
          {book.status === "publish" ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (book: any) => (
        <div className="flex items-center justify-end gap-2">
          {/* Edit Button */}
          <Link href={`/admin/books/${book.id}`}>
            <button className="p-1.5 rounded hover:bg-elevated text-muted hover:text-gold transition-colors cursor-pointer" aria-label="Edit book">
              <Edit size={14} />
            </button>
          </Link>

          {/* Delete Form Action */}
          <form action={deleteBook}>
            <input type="hidden" name="id" value={book.id} />
            <button
              type="submit"
              className="p-1.5 rounded hover:bg-elevated text-muted hover:text-crimson transition-colors cursor-pointer"
              aria-label="Delete book"
            >
              <Trash2 size={14} />
            </button>
          </form>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Products Catalog</h1>
          <p className="text-xs text-muted">Manage product list details, cover assets and stock pricing.</p>
        </div>
        <Link href="/admin/books/new">
          <button className="bg-gold hover:bg-gold-dim text-void font-bold px-4 h-10 rounded-[var(--radius-btn)] transition-colors inline-flex items-center gap-1.5 cursor-pointer text-xs shadow-sm">
            <Plus size={14} />
            Add New Product
          </button>
        </Link>
      </div>

      {/* Grid listing */}
      <DataTable
        columns={columns}
        data={serializedBooks}
        searchPlaceholder="Search catalog by title, author or ISBN..."
        searchValue={searchQuery}
        // Custom simple search sync script
        onSearchChange={async (val) => {
          "use server";
          // Client will re-evaluate queries using simple window.location redirection
        }}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={async (p) => {
          "use server";
        }}
      />

      {/* Simple search sync trigger injection script */}
      <Script
        id="sync-search-books"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Bind DataTable search query changes dynamically
            const input = document.querySelector('input[placeholder*="Search catalog"]');
            if (input) {
              // Set value from URL if any
              const params = new URLSearchParams(window.location.search);
              input.value = params.get('q') || '';
              
              let timeout;
              input.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                  const query = e.target.value.trim();
                  const search = new URLSearchParams(window.location.search);
                  if (query) search.set('q', query);
                  else search.delete('q');
                  search.delete('page'); // reset pagination
                  window.location.href = '/admin/books?' + search.toString();
                }, 600);
              });
            }

            // Bind DataTable paginating buttons
            const pInfo = document.querySelector('.px-6.py-4.border-t.border-border');
            if (pInfo) {
              const buttons = pInfo.querySelectorAll('button');
              if (buttons.length > 0) {
                const params = new URLSearchParams(window.location.search);
                const current = parseInt(params.get('page') || '1');
                
                // Prev button
                buttons[0].addEventListener('click', () => {
                  if (current > 1) {
                    params.set('page', String(current - 1));
                    window.location.href = '/admin/books?' + params.toString();
                  }
                });
                
                // Next button
                if (buttons.length > 1) {
                  buttons[1].addEventListener('click', () => {
                    params.set('page', String(current + 1));
                    window.location.href = '/admin/books?' + params.toString();
                  });
                }
              }
            }
          `,
        }}
      />
    </div>
  );
}
