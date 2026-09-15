// app/(store)/shipping/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, MapPin, Compass, HelpCircle } from "lucide-react";
import { fadeUp, stagger } from "@/lib/motion";
import { APP_ADDRESS, APP_EMAIL } from "@/lib/constants";

export default function ShippingPolicyPage() {
  const [storeAddress, setStoreAddress] = useState(APP_ADDRESS);
  const [storeEmail, setStoreEmail] = useState(APP_EMAIL);

  useEffect(() => {
    fetch("/api/store/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          if (data.storeAddress) setStoreAddress(data.storeAddress);
          if (data.contactEmail) setStoreEmail(data.contactEmail);
        }
      })
      .catch(() => {});
  }, []);

  const shippingMethods = [
    {
      title: "Standard Delivery (Nationwide)",
      cost: "Rs. 200 (FREE on orders above Rs. 2,000)",
      time: "3 to 5 business days",
      description: "Reliable nationwide courier shipping covering all major cities (Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, Faisalabad, Multan, etc.) and rural areas across Pakistan.",
      icon: Truck,
    },
    {
      title: "Express Delivery (Major Cities)",
      cost: "Rs. 450",
      time: "1 to 2 business days",
      description: "Expedited shipping available for major cities. Ideal for students, researchers, and book clubs requiring urgent materials.",
      icon: Compass,
    },
    {
      title: "Self-Pickup (Depalpur Store)",
      cost: "FREE",
      time: "Ready within 2 hours",
      description: `Collect your order directly from our physical outlet located at ${storeAddress}.`,
      icon: MapPin,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger(0.1)}
        className="text-center space-y-4"
      >
        <motion.span
          variants={fadeUp}
          className="text-badge text-gold tracking-widest font-bold uppercase text-[11px]"
        >
          Delivery Info
        </motion.span>
        <motion.h1
          variants={fadeUp}
          className="font-display text-4xl sm:text-5xl font-bold text-ink"
        >
          Shipping & Delivery Policy
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="text-muted text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
        >
          Fast, reliable, and trackable book delivery to readers all across Pakistan. Here is everything you need to know about our shipping rates and timelines.
        </motion.p>
      </motion.div>

      <hr className="border-border" />

      {/* Methods */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-ink">Shipping Methods & Rates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shippingMethods.map((method, idx) => {
            const Icon = method.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="bg-surface border border-border rounded-[var(--radius-card)] p-6 space-y-4 hover:border-gold/30 transition-all shadow-card"
              >
                <div className="w-10 h-10 rounded-full bg-gold-glow/5 border border-gold/20 flex items-center justify-center text-gold">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">{method.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm font-bold text-gold">{method.cost}</span>
                    <span className="text-xs text-muted">({method.time})</span>
                  </div>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  {method.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Packaging & Safety */}
      <div className="bg-surface border border-border rounded-[var(--radius-card)] p-6 sm:p-8 space-y-4 shadow-card">
        <div className="flex items-center gap-3 text-gold">
          <ShieldCheck size={24} />
          <h3 className="font-display text-xl font-bold text-ink">Book Protection & Packaging</h3>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          Every single book is wrapped in multi-layered protective bubble wrap and packaged in sturdy cardboard cartons or weather-resistant padded mailers. We guarantee that your books reach you in mint, collector-grade condition, free of dented spines or bent dust jackets.
        </p>
      </div>

      {/* FAQ */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
          <HelpCircle className="text-gold" size={22} /> Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div className="p-5 bg-elevated/40 border border-border/80 rounded-[var(--radius-card)] space-y-2">
            <h4 className="font-semibold text-ink text-sm sm:text-base">When will my order be dispatched?</h4>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Orders placed before 2:00 PM (PKT) are processed and dispatched on the same business day. Orders placed after 2:00 PM or on Sundays/holidays are shipped the next working day.
            </p>
          </div>
          <div className="p-5 bg-elevated/40 border border-border/80 rounded-[var(--radius-card)] space-y-2">
            <h4 className="font-semibold text-ink text-sm sm:text-base">How can I track my package?</h4>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Once your shipment is dispatched, we send a tracking ID and link to your registered email and phone number via SMS. You can monitor progress directly on the courier partner&apos;s portal.
            </p>
          </div>
          <div className="p-5 bg-elevated/40 border border-border/80 rounded-[var(--radius-card)] space-y-2">
            <h4 className="font-semibold text-ink text-sm sm:text-base">Do you ship internationally?</h4>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Currently, we only ship within Pakistan. For international order requests, please email us directly at <a href={`mailto:${storeEmail}`} className="font-bold text-ink hover:text-gold transition-colors">{storeEmail}</a> with your book list, and our team will quote customized shipping rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
