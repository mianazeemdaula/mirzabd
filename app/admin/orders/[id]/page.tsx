// app/admin/orders/[id]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, CreditCard, ShoppingBag, Phone, User, Mail, Calendar } from "lucide-react";
import prisma from "@/lib/prisma";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/utils";
import { updateOrderStatus } from "@/actions/orders";
import { PAYMENT_STATUS_MAP } from "@/lib/constants";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  // 1. Fetch order details with items
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  const billingAddress = order.billingAddress as any;
  const shippingAddress = order.shippingAddress as any;

  const paymentStatusConfig = PAYMENT_STATUS_MAP[order.paymentStatus as keyof typeof PAYMENT_STATUS_MAP] || {
    label: order.paymentStatus,
    color: "text-muted",
  };

  const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Link href="/admin/orders" className="p-1.5 border border-border rounded-[var(--radius-btn)] text-muted hover:text-gold hover:border-gold transition-colors">
          <ChevronLeft size={16} />
        </Link>
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Order Details</h1>
          <p className="text-xs text-muted">Order ID: {order.id}</p>
        </div>
      </div>

      {/* Main Column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Items & Totals */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Order Items Table Card */}
          <div className="bg-surface border border-border rounded-[var(--radius-card)] p-5 sm:p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-ink flex items-center gap-2 border-b border-border/60 pb-3">
              <ShoppingBag size={18} className="text-gold" />
              Purchased Items
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted font-bold">
                    <th className="py-3">Book Title</th>
                    <th className="py-3 text-center">SKU</th>
                    <th className="py-3 text-center">Price</th>
                    <th className="py-3 text-center">Qty</th>
                    <th className="py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-ink">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-elevated/10 transition-colors">
                      <td className="py-3 font-semibold text-ink">{item.name}</td>
                      <td className="py-3 text-center font-mono text-xs text-muted">{item.sku || "N/A"}</td>
                      <td className="py-3 text-center font-mono text-xs">{formatPKR(Number(item.price))}</td>
                      <td className="py-3 text-center font-mono text-xs">{item.quantity}</td>
                      <td className="py-3 text-right font-mono font-bold text-gold">{formatPKR(Number(item.total))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Grid */}
            <div className="border-t border-border/60 pt-4 flex flex-col items-end text-xs space-y-2">
              <div className="flex justify-between w-64 text-muted">
                <span>Subtotal:</span>
                <span>{formatPKR(Number(order.subtotal))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between w-64 text-crimson font-medium">
                  <span>Discount:</span>
                  <span>-{formatPKR(Number(order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between w-64 text-muted">
                <span>Shipping:</span>
                <span>{formatPKR(Number(order.shippingCost))}</span>
              </div>
              <div className="flex justify-between w-64 text-muted">
                <span>Sales Tax:</span>
                <span>{formatPKR(Number(order.tax))}</span>
              </div>
              <hr className="w-64 border-border my-1" />
              <div className="flex justify-between w-64 text-sm font-bold text-ink">
                <span>Total Amount:</span>
                <span className="text-gold font-mono text-base">{formatPKR(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Shipping / Billing Addresses Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Shipping Address */}
            <div className="bg-surface border border-border p-5 rounded-[var(--radius-card)] space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-border/60 pb-2">
                <MapPin size={14} className="text-gold" />
                Shipping Destination
              </h4>
              <div className="text-xs text-muted leading-relaxed">
                <span className="text-ink font-bold block">{shippingAddress?.name || "N/A"}</span>
                <span>{shippingAddress?.address || "N/A"}</span>
                <span className="block">{shippingAddress?.city || "N/A"}, {shippingAddress?.state || ""} {shippingAddress?.zip || ""}</span>
                <span>{shippingAddress?.country || "Pakistan"}</span>
                {shippingAddress?.phone && (
                  <span className="block mt-2 font-semibold text-ink flex items-center gap-1 text-[11px]">
                    <Phone size={10} className="text-gold" />
                    Tel: {shippingAddress.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-surface border border-border p-5 rounded-[var(--radius-card)] space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5 border-b border-border/60 pb-2">
                <User size={14} className="text-gold" />
                Billing Details
              </h4>
              <div className="text-xs text-muted leading-relaxed">
                <span className="text-ink font-bold block">{billingAddress?.name || "N/A"}</span>
                <span>{billingAddress?.address || "N/A"}</span>
                <span className="block">{billingAddress?.city || "N/A"}, {billingAddress?.state || ""} {billingAddress?.zip || ""}</span>
                <span>{billingAddress?.country || "Pakistan"}</span>
                {billingAddress?.phone && (
                  <span className="block mt-2 font-semibold text-ink flex items-center gap-1 text-[11px]">
                    <Phone size={10} className="text-gold" />
                    Tel: {billingAddress.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Order Status & Control Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order Details status card */}
          <div className="bg-surface border border-border p-5 rounded-[var(--radius-card)] space-y-4">
            <h3 className="font-display text-base font-bold text-ink border-b border-border/60 pb-2">
              Order Logistics
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted">Order Number:</span>
                <span className="font-mono font-bold text-ink">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Placement Date:</span>
                <span className="font-semibold text-ink">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Order Status:</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Payment status:</span>
                <span className={`font-semibold ${paymentStatusConfig.color}`}>{paymentStatusConfig.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Payment Method:</span>
                <span className="font-semibold text-ink uppercase">{order.paymentMethod}</span>
              </div>
            </div>

            <hr className="border-border" />

            {/* Change Status Action Form */}
            <form action={updateOrderStatus} className="space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                  Update Shipping Status
                </label>
                <select
                  name="status"
                  defaultValue={order.status}
                  className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] h-10 px-3 focus:outline-none focus:border-gold cursor-pointer"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" variant="primary" className="w-full h-10 text-xs rounded-[var(--radius-btn)] font-semibold">
                Apply Status Change
              </Button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
