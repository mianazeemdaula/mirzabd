// app/admin/customers/page.tsx
import React from "react";
import Script from "next/script";
import prisma from "@/lib/prisma";
import { DataTable } from "@/components/admin/data-table";
import { Users, Calendar, ShoppingBag } from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface AdminCustomersPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({ searchParams }: AdminCustomersPageProps) {
  const params = await searchParams;
  const searchQuery = params.q || "";
  const page = params.page ? parseInt(params.page) : 1;
  const limit = 15;
  const skip = (page - 1) * limit;

  // 1. Build Query Search Filters (search by name, email, phone)
  const where: any = {
    role: "CUSTOMER",
  };
  
  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery } },
      { email: { contains: searchQuery } },
      { phone: { contains: searchQuery } },
    ];
  }

  // 2. Fetch Customers & Count
  const [customers, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        orders: {
          select: {
            total: true,
            paymentStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // 3. Define Table Columns mapping
  const columns = [
    {
      key: "name",
      header: "Customer",
      render: (user: any) => (
        <div>
          <span className="font-bold text-ink block">{user.name || "Unnamed Customer"}</span>
          <span className="text-muted block text-[10px]">{user.phone || "No phone added"}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email Address",
      render: (user: any) => (
        <span className="text-xs text-muted font-mono">{user.email}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Joined Date",
      render: (user: any) => (
        <span className="text-xs text-muted flex items-center gap-1.5">
          <Calendar size={12} className="text-gold/80" />
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "ordersCount",
      header: "Orders Count",
      render: (user: any) => (
        <span className="font-mono text-xs flex items-center gap-1">
          <ShoppingBag size={12} className="text-gold/80" />
          {user.orders.length} orders
        </span>
      ),
    },
    {
      key: "totalSpent",
      header: "Total Spent (PKR)",
      align: "right" as const,
      render: (user: any) => {
        // Calculate total spent (PAID orders sum)
        const total = user.orders
          .filter((o: any) => o.paymentStatus === "PAID")
          .reduce((sum: number, o: any) => sum + Number(o.total), 0);
        return (
          <span className="font-mono font-bold text-gold">
            {formatPKR(total)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Customers Management</h1>
          <p className="text-xs text-muted">View customer profile details, tracking history logs and purchase totals.</p>
        </div>
      </div>

      {/* Grid listing */}
      <DataTable
        columns={columns}
        data={customers}
        searchPlaceholder="Search customers by name, email, or phone number..."
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
        id="sync-search-customers"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            const input = document.querySelector('input[placeholder*="Search customers"]');
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
                  window.location.href = '/admin/customers?' + search.toString();
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
                    window.location.href = '/admin/customers?' + params.toString();
                  }
                });
                
                if (buttons.length > 1) {
                  buttons[1].addEventListener('click', () => {
                    params.set('page', String(current + 1));
                    window.location.href = '/admin/customers?' + params.toString();
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
