// app/(store)/account/orders/page.tsx
import React from "react";
import Link from "next/link";
import { ShoppingBag, Eye, Calendar, DollarSign, Clock } from "lucide-react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { formatPKR } from "@/lib/utils";
import { ORDER_STATUS_MAP } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function OrdersHistoryPage() {
  const session = await auth();
  const userId = session?.user?.id;

  // Retrieve user orders
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-ink mb-1">Order History</h2>
        <p className="text-xs text-muted">View details and status of all your placed orders.</p>
      </div>

      <hr className="border-border" />

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="p-3 bg-elevated rounded-full text-muted border border-border/40">
            <ShoppingBag size={32} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink">No orders found</h4>
            <p className="text-xs text-muted mt-1 max-w-[240px]">
              You haven't placed any orders with us yet. Start browsing our books collection today!
            </p>
          </div>
          <Link href="/products">
            <Button variant="primary" className="text-xs h-9 px-5 rounded-[var(--radius-btn)]">
              Browse Books
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = ORDER_STATUS_MAP[order.status] || {
              label: order.status,
              color: "text-muted",
              bg: "bg-elevated",
            };

            return (
              <div
                key={order.id}
                className="border border-border bg-elevated/40 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-gold/30 transition-colors"
              >
                {/* Left Side: Order Meta */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted font-mono">
                      Order No:
                    </span>
                    <span className="text-sm font-bold font-mono text-ink">
                      {order.orderNumber}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-gold/80" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-gold/80" />
                      Status:
                      <span className={`font-semibold ${statusConfig.color} px-1.5 py-0.5 rounded ${statusConfig.bg}`}>
                        {statusConfig.label}
                      </span>
                    </span>
                  </div>

                  {/* Items brief preview */}
                  <div className="text-xs text-muted pt-1 max-w-sm truncate">
                    Items: {order.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                  </div>
                </div>

                {/* Right Side: Total and view details action */}
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-border/60 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-muted block uppercase tracking-wider">Total amount</span>
                    <span className="text-sm sm:text-base font-bold text-gold font-mono">
                      {formatPKR(Number(order.total))}
                    </span>
                  </div>

                  {/* Order invoice detail view */}
                  <Link href={`/checkout/success?order_id=${order.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-3 rounded-[var(--radius-btn)] border-border hover:border-gold hover:text-gold text-xs flex items-center gap-1.5"
                    >
                      <Eye size={12} />
                      Invoice
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Simple Helper Button wrapper since component uses button inside server code directly
function Button({ children, className = "", variant = "primary", ...props }: any) {
  const base = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
  const styles = {
    primary: "bg-gold text-white hover:bg-gold-dim shadow-sm",
    ghost: "border border-border hover:bg-elevated hover:text-gold text-ink",
  };
  return (
    <button className={`${base} ${styles[variant as keyof typeof styles] || ""} ${className}`} {...props}>
      {children}
    </button>
  );
}
