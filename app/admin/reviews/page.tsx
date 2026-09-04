// app/admin/reviews/page.tsx
import React from "react";
import Script from "next/script";
import prisma from "@/lib/prisma";
import { DataTable } from "@/components/admin/data-table";
import { StarRating } from "@/components/store/star-rating";
import { Badge } from "@/components/ui/badge";
import { Trash2, CheckCircle2, XCircle } from "lucide-react";
import { toggleReviewApproval, deleteReview } from "@/actions/reviews";

interface AdminReviewsPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps) {
  const params = await searchParams;
  const searchQuery = params.q || "";
  const page = params.page ? parseInt(params.page) : 1;
  const limit = 15;
  const skip = (page - 1) * limit;

  // 1. Build Query Search Filters (search by reviewer name, comment or product name)
  const where: any = {};
  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery } },
      { email: { contains: searchQuery } },
      { comment: { contains: searchQuery } },
      {
        product: {
          name: { contains: searchQuery },
        },
      },
    ];
  }

  // 2. Fetch Reviews
  const [reviews, totalCount] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        product: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // 3. Define Table Columns mapping
  const columns = [
    {
      key: "product",
      header: "Book Title",
      render: (review: any) => (
        <span className="font-bold text-ink block max-w-[180px] truncate">{review.product.name}</span>
      ),
    },
    {
      key: "name",
      header: "Reviewer",
      render: (review: any) => (
        <div className="text-xs">
          <span className="font-bold text-ink block">{review.name}</span>
          <span className="text-muted block text-[10px]">{review.email}</span>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      render: (review: any) => <StarRating rating={review.rating} size={12} />,
    },
    {
      key: "comment",
      header: "Review Details",
      render: (review: any) => (
        <div className="max-w-[280px] text-xs text-muted whitespace-normal break-words leading-relaxed">
          {review.title && <span className="font-bold text-ink block mb-0.5">{review.title}</span>}
          <span>{review.comment}</span>
        </div>
      ),
    },
    {
      key: "isApproved",
      header: "Status",
      render: (review: any) => (
        <Badge variant={review.isApproved ? "green" : "gold"} className="rounded text-[10px]">
          {review.isApproved ? "Approved" : "Pending"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (review: any) => (
        <div className="flex items-center justify-end gap-2">
          {/* Toggle Approval button */}
          <form action={toggleReviewApproval}>
            <input type="hidden" name="reviewId" value={review.id} />
            <input type="hidden" name="currentApproved" value={String(review.isApproved)} />
            <button
              type="submit"
              className={`p-1.5 rounded hover:bg-elevated transition-colors cursor-pointer ${
                review.isApproved ? "text-muted hover:text-yellow-500" : "text-muted hover:text-green-500"
              }`}
              title={review.isApproved ? "Unapprove Review" : "Approve Review"}
            >
              {review.isApproved ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
            </button>
          </form>

          {/* Delete button */}
          <form action={deleteReview}>
            <input type="hidden" name="reviewId" value={review.id} />
            <button
              type="submit"
              className="p-1.5 rounded hover:bg-elevated text-muted hover:text-crimson transition-colors cursor-pointer"
              title="Delete Review"
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
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Reviews Moderation</h1>
          <p className="text-xs text-muted">Moderate customer book feedback rating submissions and display approval filters.</p>
        </div>
      </div>

      {/* Grid listing */}
      <DataTable
        columns={columns}
        data={reviews}
        searchPlaceholder="Search reviews by reviewer name or book name..."
        searchValue={searchQuery}
        currentPage={page}
        totalPages={totalPages}
        onSearchChange={async () => {
          "use server";
        }}
        onPageChange={async () => {
          "use server";
        }}
      />

      {/* Sync Search Script */}
      <Script
        id="sync-search-reviews"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            const input = document.querySelector('input[placeholder*="Search reviews"]');
            if (input) {
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
                  search.delete('page');
                  window.location.href = '/admin/reviews?' + search.toString();
                }, 600);
              });
            }

            const pInfo = document.querySelector('.px-6.py-4.border-t.border-border');
            if (pInfo) {
              const buttons = pInfo.querySelectorAll('button');
              if (buttons.length > 0) {
                const params = new URLSearchParams(window.location.search);
                const current = parseInt(params.get('page') || '1');
                
                buttons[0].addEventListener('click', () => {
                  if (current > 1) {
                    params.set('page', String(current - 1));
                    window.location.href = '/admin/reviews?' + params.toString();
                  }
                });
                
                if (buttons.length > 1) {
                  buttons[1].addEventListener('click', () => {
                    params.set('page', String(current + 1));
                    window.location.href = '/admin/reviews?' + params.toString();
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
