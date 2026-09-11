// app/(store)/shipping/page.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, MapPin, Compass, HelpCircle } from "lucide-react";
import { fadeUp, stagger } from "@/lib/motion";

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
    description: "Collect your order directly from our historical physical outlet located at Allah o Akbar Chowk, Mirza Plaza, Depalpur, Pakistan.",
    icon: MapPin,
  },
];

export default function ShippingPolicyPage() {
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
          We pack each book with historical care, ensuring your physical copies reach your hands safely, crisp, and ready to be read.
        </motion.p>
      </motion.div>

      <hr className="border-border" />

      {/* Shipping Methods Grid */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-ink">Shipping Methods & Rates</h2>
        <div className="grid grid-cols-1 gap-6">
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
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold-glow/5 border border-gold/20 flex items-center justify-center text-gold">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink">{method.title}</h3>
                    <div className="flex flex-wrap gap-x-4 text-xs text-muted mt-0.5">
                      <span>Cost: <strong className="text-gold font-semibold">{method.cost}</strong></span>
                      <span className="hidden sm:inline">•</span>
                      <span>Timeline: <strong className="text-ink font-semibold">{method.time}</strong></span>
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted leading-relaxed pl-0 sm:pl-14">
                  {method.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detailed Shipping Info */}
      <div className="bg-surface border border-border rounded-[var(--radius-card)] p-6 sm:p-8 space-y-6 shadow-card">
        <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
          <ShieldCheck className="text-gold" size={22} /> Packaging & Quality Assurance
        </h2>
        <div className="text-xs sm:text-sm text-muted leading-relaxed space-y-4">
          <p>
            At <strong>Mirza Book Depot</strong>, we understand that books are delicate treasures. Every single order is bubble-wrapped and packaged in robust, moisture-resistant cardboard sleeves to protect the spine, pages, and covers from transit damage.
          </p>
          <p>
            Our packaging features double-layered cushioning to absorb impact, ensuring that paperback spines remain unbent and hardcover editions arrive in mint collector status.
          </p>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
          <HelpCircle className="text-gold" size={22} /> Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          <div className="p-5 bg-elevated/40 border border-border/80 rounded-[var(--radius-card)] space-y-2">
            <h4 className="font-semibold text-ink text-sm sm:text-base">When will my order ship?</h4>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Orders placed before 2:00 PM (PKT) are processed and dispatched on the same business day. Orders placed after 2:00 PM or on Sundays/holidays are shipped the next working day.
            </p>
          </div>
          <div className="p-5 bg-elevated/40 border border-border/80 rounded-[var(--radius-card)] space-y-2">
            <h4 className="font-semibold text-ink text-sm sm:text-base">How can I track my package?</h4>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Once your shipment is dispatched, we send a tracking ID and link to your registered email and phone number via SMS. You can monitor progress directly on the courier partner's portal.
            </p>
          </div>
          <div className="p-5 bg-elevated/40 border border-border/80 rounded-[var(--radius-card)] space-y-2">
            <h4 className="font-semibold text-ink text-sm sm:text-base">Do you ship internationally?</h4>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Currently, we only ship within Pakistan. For international order requests, please email us directly at <strong>mirzabd8@gmail.com</strong> with your book list, and our team will quote customized shipping rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
