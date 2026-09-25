// app/(store)/checkout/success/page.tsx
import React from "react";
import Link from "next/link";
import { CheckCircle2, Phone, MapPin } from "lucide-react";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { getStoreSettings } from "@/actions/settings";

interface SuccessPageProps {
  searchParams: Promise<{ order_id?: string }>;
}

export const dynamic = "force-dynamic";

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const [params, settings] = await Promise.all([
    searchParams,
    getStoreSettings(),
  ]);
  const orderId = params.order_id;

  // Fetch order details if ID is present
  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      })
    : null;

  const billingAddress = order?.billingAddress && typeof order.billingAddress === "object"
    ? (order.billingAddress as Record<string, string | undefined>)
    : null;
  const shippingAddress = order?.shippingAddress && typeof order.shippingAddress === "object"
    ? (order.shippingAddress as Record<string, string | undefined>)
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 text-center space-y-8">
      {/* Checkmark Animation */}
      <div className="flex flex-col items-center space-y-4">
        <div className="p-3 bg-green-500/10 rounded-full text-green-500 animate-bounce">
          <CheckCircle2 size={64} />
        </div>
        <span className="text-badge text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded">
          Order Placed Successfully
        </span>
        <h1 className="font-display text-2xl sm:text-[1.75rem] font-bold tracking-tight text-ink">
          Thank you for your purchase!
        </h1>
        <p className="text-sm text-muted max-w-md mx-auto">
          Your order has been received and is being processed by the warehouse team at {APP_NAME}.
        </p>
      </div>

      {/* Order Info Details card */}
      {order ? (
        <div className="bg-surface border border-border rounded-[var(--radius-card)] p-6 text-left space-y-6 shadow-card">
          <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-border pb-4 text-xs sm:text-sm">
            <div>
              <span className="text-muted block">Order Number</span>
              <span className="text-ink font-bold font-mono text-base">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-muted block">Order Date</span>
              <span className="text-ink font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-muted block">Payment Method</span>
              <span className="text-ink font-semibold uppercase">{order.paymentMethod}</span>
            </div>
            <div>
              <span className="text-muted block">Total Paid</span>
              <span className="text-gold font-bold font-mono text-base">{formatPKR(Number(order.total))}</span>
            </div>
          </div>

          {/* Items bought */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">Items Ordered</h4>
            <div className="divide-y divide-border/60">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2.5 text-sm">
                  <div className="min-w-0">
                    <span className="text-ink font-semibold truncate block">{item.name}</span>
                    <span className="text-xs text-muted">Qty: {item.quantity} × {formatPKR(Number(item.price))}</span>
                  </div>
                  <span className="text-ink font-medium font-mono">{formatPKR(Number(item.total))}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping details */}
          {shippingAddress && (
            <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <MapPin size={12} className="text-gold" />
                  Shipping Destination
                </h4>
                <div className="text-muted leading-relaxed">
                  <span className="text-ink font-semibold block">{shippingAddress.name}</span>
                  <span>{shippingAddress.address}</span>
                  <span className="block">{shippingAddress.city}, {shippingAddress.state || ""}</span>
                  <span>{shippingAddress.country}</span>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Phone size={12} className="text-gold" />
                  Contact Details
                </h4>
                <div className="text-muted leading-relaxed">
                  <span className="block">Email: {order.guestEmail || billingAddress?.email || "N/A"}</span>
                  <span>Phone: {shippingAddress.phone || "N/A"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-[var(--radius-card)] p-6 text-muted text-sm max-w-md mx-auto">
          An email confirmation has been sent to your registered address with complete shipping and order invoice details.
        </div>
      )}

      {/* Support strip */}
      <div className="p-4 bg-elevated border border-border rounded-[var(--radius-card)] flex flex-col sm:flex-row items-center justify-center gap-4 text-xs max-w-md mx-auto">
        <span className="text-muted">Need to modify shipping details or cancel order?</span>
        <a href={`tel:${settings.contactPhone}`} className="font-bold text-gold hover:underline inline-flex items-center gap-1">
          <Phone size={12} />
          Call Support: {settings.contactPhone}
        </a>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        <Link href="/products">
          <Button variant="ghost" className="px-6 border-border hover:border-gold text-ink">
            Continue Shopping
          </Button>
        </Link>
        <Link href="/account/orders">
          <Button variant="primary" className="px-6 bg-gold text-white hover:bg-gold-dim">
            Track My Order
          </Button>
        </Link>
      </div>
    </div>
  );
}
