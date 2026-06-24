// app/admin/page.tsx
import React from "react";
import Link from "next/link";
import {
  Banknote,
  ShoppingBag,
  Clock,
  BookMarked,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { StatsCard } from "@/components/admin/stats-card";
import { formatPKR } from "@/lib/utils";
import { ORDER_STATUS_MAP } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // 1. Fetch Aggregated Statistics
  const [
    revenueAgg,
    totalOrders,
    pendingOrders,
    totalCustomers,
    outOfStockCount,
    recentOrders,
    lowStockBooks,
  ] = await Promise.all([
    // Total Revenue (sum of total of all PAID orders)
    prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
      },
      _sum: {
        total: true,
      },
    }),
    // Total Orders count
    prisma.order.count(),
    // Pending Orders count
    prisma.order.count({
      where: { status: "PENDING" },
    }),
    // Total Customers count
    prisma.user.count({
      where: { role: "CUSTOMER" },
    }),
    // Out of stock product count
    prisma.product.count({
      where: {
        OR: [
          { stockStatus: "outofstock" },
          { AND: [{ manageStock: true }, { stockQuantity: { lte: 0 } }] },
        ],
      },
    }),
    // Top 5 recent orders
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    // Low stock books (less than 5 units left)
    prisma.product.findMany({
      where: {
        status: "publish",
        manageStock: true,
        stockQuantity: { lt: 5, gte: 1 },
      },
      take: 5,
      orderBy: { stockQuantity: "asc" },
    }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.total || 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Administrative Dashboard</h1>
          <p className="text-xs text-muted">Real-time overview of Mirza Book Depot metrics & logs.</p>
        </div>
      </div>

      {/* Stats Cards Grid (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          label="Total Revenue"
          value={totalRevenue}
          prefix="Rs. "
          icon={Banknote}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          label="Total Orders"
          value={totalOrders}
          icon={ShoppingBag}
          trend={{ value: 4, isPositive: true }}
        />
        <StatsCard
          label="Pending Deliveries"
          value={pendingOrders}
          icon={Clock}
        />
        <StatsCard
          label="Out of Stock Items"
          value={outOfStockCount}
          icon={BookMarked}
          trend={{ value: 2, isPositive: false }}
        />
      </div>

      {/* Grid: Low Stock Alert and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Recent Orders Table */}
        <div className="lg:col-span-8 bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2">
              <ShoppingBag size={18} className="text-gold" />
              Recent Purchases
            </h3>
            <Link
              href="/admin/orders"
              className="text-[11px] font-bold text-gold hover:underline uppercase tracking-wide flex items-center gap-1"
            >
              All Orders
              <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted font-bold">
                  <th className="py-3 px-2">Order No</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-ink">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted text-xs">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const statusConfig = ORDER_STATUS_MAP[order.status] || {
                      label: order.status,
                      color: "text-muted",
                      bg: "bg-surface",
                    };

                    return (
                      <tr key={order.id} className="hover:bg-elevated/20 transition-colors">
                        <td className="py-3.5 px-2 font-mono font-bold text-xs">
                          <Link href={`/admin/orders/${order.id}`} className="hover:underline hover:text-gold">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3.5 px-2 text-xs text-muted">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-2 text-xs">
                          <span className={`font-semibold ${statusConfig.color} px-2 py-0.5 rounded ${statusConfig.bg}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-right font-mono font-bold text-gold">
                          {formatPKR(Number(order.total))}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Low Stock Warnings */}
        <div className="lg:col-span-4 bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <AlertTriangle size={18} className="text-crimson animate-pulse" />
            <h3 className="font-display text-lg font-bold text-ink">
              Low Stock Warnings
            </h3>
          </div>

          <div className="space-y-3">
            {lowStockBooks.length === 0 ? (
              <p className="text-xs text-muted py-4 text-center">
                Inventory stock levels are healthy.
              </p>
            ) : (
              lowStockBooks.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-void/30"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-ink truncate block">
                      {book.name}
                    </span>
                    <span className="text-[10px] text-muted font-mono block">
                      SKU: {book.sku || "N/A"}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-crimson font-mono flex-shrink-0 bg-crimson/10 px-2 py-0.5 rounded">
                    {book.stockQuantity} Left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
