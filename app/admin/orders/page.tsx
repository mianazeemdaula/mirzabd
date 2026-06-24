// app/admin/orders/page.tsx
import React from "react";
import Link from "next/link";
import Script from "next/script";
import prisma from "@/lib/prisma";
import { DataTable } from "@/components/admin/data-table";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/utils";
import { Eye } from "lucide-react";
import { ORDER_STATUS_MAP, PAYMENT_STATUS_MAP } from "@/lib/constants";

interface AdminOrdersPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams;
  const searchQuery = params.q || "";
  const page = params.page ? parseInt(params.page) : 1;
  const limit = 15;
  const skip = (page - 1) * limit;

  // 1. Build Query Search Filters (search by orderNumber, billing name, guest email)
  const where: any = {};
  if (searchQuery) {
    where.OR = [
      { orderNumber: { contains: searchQuery, mode: "insensitive" } },
      { guestEmail: { contains: searchQuery, mode: "insensitive" } },
      {
        billingAddress: {
          path: ["name"],
          string_contains: searchQuery,
        },
      },
    ];
  }

  // 2. Fetch Orders
  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  const serializedOrders = orders.map((order) => ({
    ...order,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shippingCost: Number(order.shippingCost),
    tax: Number(order.tax),
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
      total: Number(item.total),
    })),
  }));

  const totalPages = Math.ceil(totalCount / limit);

  // 3. Define Table Columns mapping
  const columns = [
    {
      key: "orderNumber",
      header: "Order No",
      render: (order: any) => (
        <span className="font-mono font-bold text-xs text-ink block">{order.orderNumber}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (order: any) => (
        <span className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (order: any) => {
        const addr = order.billingAddress as any;
        return (
          <div className="text-xs">
            <span className="font-bold text-ink block">{addr?.name || "Guest"}</span>
            <span className="text-muted block text-[10px]">{order.guestEmail || addr?.email || "No Email"}</span>
          </div>
        );
      },
    },
    {
      key: "itemsCount",
      header: "Items",
      render: (order: any) => {
        const count = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        return <span className="font-mono text-xs">{count} books</span>;
      },
    },
    {
      key: "total",
      header: "Total Total",
      render: (order: any) => (
        <span className="font-mono font-bold text-gold">{formatPKR(Number(order.total))}</span>
      ),
    },
    {
      key: "paymentStatus",
      header: "Payment Status",
      render: (order: any) => {
        const payStatus = PAYMENT_STATUS_MAP[order.paymentStatus as keyof typeof PAYMENT_STATUS_MAP] || {
          label: order.paymentStatus,
          color: "text-muted",
        };
        return (
          <span className={`text-xs font-semibold ${payStatus.color}`}>
            {payStatus.label}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Order Status",
      render: (order: any) => <OrderStatusBadge status={order.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (order: any) => (
        <Link href={`/admin/orders/${order.id}`}>
          <button className="p-1.5 rounded hover:bg-elevated text-muted hover:text-gold transition-colors cursor-pointer" aria-label="View order details">
            <Eye size={14} />
          </button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Orders List</h1>
          <p className="text-xs text-muted">Manage checkout purchases, track shipping delivery log and change statuses.</p>
        </div>
      </div>

      {/* Grid listing */}
      <DataTable
        columns={columns}
        data={serializedOrders}
        searchPlaceholder="Search orders by order number or customer name..."
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
        id="sync-search-orders"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            const input = document.querySelector('input[placeholder*="Search orders"]');
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
                  window.location.href = '/admin/orders?' + search.toString();
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
                    window.location.href = '/admin/orders?' + params.toString();
                  }
                });
                
                if (buttons.length > 1) {
                  buttons[1].addEventListener('click', () => {
                    params.set('page', String(current + 1));
                    window.location.href = '/admin/orders?' + params.toString();
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
