// app/(store)/checkout/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ShoppingBag, CreditCard, Truck, ClipboardList, CheckCircle2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { CheckoutSchema, CheckoutFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPKR } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, total, discount, clearCart } = useCart();
  const [step, setStep] = useState<"details" | "payment">("details");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(CheckoutSchema),
    defaultValues: {
      email: "",
      phone: "",
      billing: {
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "Pakistan",
      },
      shippingSameAsBilling: true,
      shipping: {
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "Pakistan",
      },
      paymentMethod: "stripe",
      notes: "",
    },
  });

  const watchSameAsBilling = watch("shippingSameAsBilling");
  const watchPaymentMethod = watch("paymentMethod");

  const onSubmit = async (values: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);
    try {
      // Map cart items for backend payload
      const orderItems = items.map((item) => ({
        productId: item.productId,
        variationId: item.variationId,
        quantity: item.quantity,
        price: item.price,
      }));

      // If shipping is same as billing, sync values manually
      const payload = {
        ...values,
        items: orderItems,
        shipping: values.shippingSameAsBilling ? values.billing : values.shipping,
      };

      const res = await fetch("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      if (values.paymentMethod === "stripe") {
        if (data.url) {
          // Redirect to Stripe checkout
          router.push(data.url);
        } else {
          throw new Error("Stripe checkout URL missing");
        }
      } else {
        // Cash on delivery redirects to success immediately
        clearCart();
        router.push(`/checkout/success?order_id=${data.orderId}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong during checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sync Contact Email and Phone to Billing details automatically
  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Quick validation for first-step inputs
    const emailVal = watch("email");
    const phoneVal = watch("phone");
    const nameVal = watch("billing.name");
    const addrVal = watch("billing.address");
    const cityVal = watch("billing.city");

    if (!emailVal || !phoneVal || !nameVal || !addrVal || !cityVal) {
      toast.error("Please fill in all required billing and contact details.");
      return;
    }

    // Set billing contact values
    setValue("billing.email", emailVal);
    setValue("billing.phone", phoneVal);
    
    setStep("payment");
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-ink">Checkout</h2>
        <p className="text-muted">Your cart is empty. Please add products to proceed.</p>
        <Link href="/books" className="inline-block mt-4">
          <Button variant="primary">Shop Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Title & Breadcrumb */}
      <div className="border-b border-border pb-4">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">Checkout</h1>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-6 text-sm font-semibold max-w-md">
        <div className={`flex items-center gap-2 pb-1 border-b-2 ${step === "details" ? "text-gold border-gold" : "text-muted border-transparent"}`}>
          <ClipboardList size={16} />
          <span>1. Shipping Details</span>
        </div>
        <div className={`flex items-center gap-2 pb-1 border-b-2 ${step === "payment" ? "text-gold border-gold" : "text-muted border-transparent"}`}>
          <CreditCard size={16} />
          <span>2. Payment & Review</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Multi-Step Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Step 1: Details & Address */}
            {step === "details" && (
              <div className="space-y-6 bg-surface border border-border p-5 sm:p-6 rounded-[var(--radius-card)]">
                <h3 className="font-display text-lg font-bold text-ink mb-1">Billing & Shipping Address</h3>
                
                {/* Contact details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Email Address *"
                      type="email"
                      {...register("email")}
                      placeholder="john@example.com"
                      error={errors.email?.message}
                    />
                  </div>
                  <div>
                    <Input
                      label="Phone Number *"
                      type="tel"
                      {...register("phone")}
                      placeholder="03331234567"
                      error={errors.phone?.message}
                    />
                  </div>
                </div>

                <hr className="border-border" />

                {/* Billing fields */}
                <div className="space-y-4">
                  <Input
                    label="Customer Full Name *"
                    {...register("billing.name")}
                    placeholder="John Doe"
                    error={errors.billing?.name?.message}
                  />

                  <Input
                    label="Street Address *"
                    {...register("billing.address")}
                    placeholder="House number, Street name, Area"
                    error={errors.billing?.address?.message}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Input
                        label="City *"
                        {...register("billing.city")}
                        placeholder="Depalpur"
                        error={errors.billing?.city?.message}
                      />
                    </div>
                    <div>
                      <Input
                        label="Province / State"
                        {...register("billing.state")}
                        placeholder="Punjab"
                      />
                    </div>
                    <div>
                      <Input
                        label="Postal Code (Zip)"
                        {...register("billing.zip")}
                        placeholder="56180"
                      />
                    </div>
                  </div>
                </div>

                {/* Same as billing checkbox toggle */}
                <div className="pt-2">
                  <label className="flex items-center gap-2.5 text-sm text-muted cursor-pointer hover:text-ink transition-colors">
                    <input
                      type="checkbox"
                      {...register("shippingSameAsBilling")}
                      className="rounded border-border bg-void text-gold focus:ring-gold h-4 w-4"
                    />
                    <span>Shipping address is the same as billing</span>
                  </label>
                </div>

                {/* Separate Shipping fields if unchecked */}
                {!watchSameAsBilling && (
                  <div className="pt-4 border-t border-border space-y-4">
                    <h4 className="font-semibold text-ink text-sm">Delivery Shipping Address</h4>
                    
                    <Input
                      label="Recipient Full Name *"
                      {...register("shipping.name")}
                      placeholder="John Doe"
                      error={errors.shipping?.name?.message}
                    />

                    <Input
                      label="Street Address *"
                      {...register("shipping.address")}
                      placeholder="House number, Street name, Area"
                      error={errors.shipping?.address?.message}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Input
                          label="City *"
                          {...register("shipping.city")}
                          placeholder="Depalpur"
                          error={errors.shipping?.city?.message}
                        />
                      </div>
                      <div>
                        <Input
                          label="Province / State"
                          {...register("shipping.state")}
                          placeholder="Punjab"
                        />
                      </div>
                      <div>
                        <Input
                          label="Postal Code (Zip)"
                          {...register("shipping.zip")}
                          placeholder="56180"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button onClick={handleDetailsSubmit} variant="primary" className="w-full h-11 rounded-[var(--radius-btn)] font-semibold">
                    Continue to Payment & Review
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Selector & Review */}
            {step === "payment" && (
              <div className="space-y-6 bg-surface border border-border p-5 sm:p-6 rounded-[var(--radius-card)]">
                <h3 className="font-display text-lg font-bold text-ink mb-1">Choose Payment Method</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Stripe option */}
                  <label
                    className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      watchPaymentMethod === "stripe"
                        ? "border-gold bg-gold/5 text-ink"
                        : "border-border bg-elevated text-muted hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <input
                        type="radio"
                        value="stripe"
                        {...register("paymentMethod")}
                        className="sr-only"
                      />
                      <CreditCard size={18} className="text-gold" />
                      <span>Credit or Debit Card</span>
                    </div>
                    <p className="text-[11px] text-muted mt-2 leading-relaxed">
                      Pay instantly and securely using credit or debit cards powered by Stripe.
                    </p>
                  </label>

                  {/* COD option */}
                  <label
                    className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      watchPaymentMethod === "cod"
                        ? "border-gold bg-gold/5 text-ink"
                        : "border-border bg-elevated text-muted hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <input
                        type="radio"
                        value="cod"
                        {...register("paymentMethod")}
                        className="sr-only"
                      />
                      <Truck size={18} className="text-gold" />
                      <span>Cash on Delivery (COD)</span>
                    </div>
                    <p className="text-[11px] text-muted mt-2 leading-relaxed">
                      Pay with cash upon package arrival at your doorstep. Inside Depalpur.
                    </p>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    {...register("notes")}
                    placeholder="Instructions for delivery driver (e.g. house next to plaza)..."
                    rows={3}
                    className="w-full bg-elevated border border-border text-ink text-sm rounded-[var(--radius-btn)] p-3 focus:outline-none focus:border-gold placeholder:text-faint resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("details")}
                    className="flex-1 h-11 rounded-[var(--radius-btn)] text-ink border-border hover:border-gold"
                  >
                    Go Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="primary"
                    className="flex-1 h-11 rounded-[var(--radius-btn)] font-semibold shadow-md hover:shadow-gold/20"
                  >
                    {isSubmitting ? "Processing..." : watchPaymentMethod === "stripe" ? "Pay Now" : "Confirm Order"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right Side: Order Items Panel */}
        <div className="lg:col-span-5 bg-surface border border-border p-6 rounded-[var(--radius-card)] space-y-6">
          <h3 className="font-display text-lg font-bold text-ink border-b border-border pb-3">Order Items</h3>
          
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <div className="relative w-12 aspect-[2/3] bg-void rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={item.imageUrl || "/images/placeholder-book.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-ink truncate">{item.name}</h4>
                  <span className="text-[10px] text-muted">Qty: {item.quantity} × {formatPKR(item.price)}</span>
                </div>
                <span className="text-xs font-bold text-gold flex-shrink-0">{formatPKR(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <hr className="border-border" />

          {/* Pricing list */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{formatPKR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-crimson font-medium">
                <span>Discount</span>
                <span>-{formatPKR(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted">
              <span>Shipping cost</span>
              <span>Rs. 0 (Free shipping)</span>
            </div>
            <hr className="border-border my-1" />
            <div className="flex justify-between text-sm font-bold text-ink pt-0.5">
              <span>Total amount</span>
              <span className="text-gold font-mono text-base">{formatPKR(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
