// app/(store)/terms/page.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Scale, CreditCard, ShoppingBag, AlertCircle, HelpCircle } from "lucide-react";
import { fadeUp, stagger } from "@/lib/motion";
import { APP_NAME, APP_EMAIL, APP_CITY } from "@/lib/constants";

const termHighlights = [
  {
    title: "Order Acceptance",
    description: "Orders placed on our storefront are subject to inventory verification. We reserve the right to decline or cancel shipments in cases of inaccurate pricing or stock limitations.",
    icon: ShoppingBag,
  },
  {
    title: "Pricing & Payments",
    description: "All prices are listed in Pakistani Rupees (PKR). We accept Stripe card payments and Cash on Delivery (COD). We securely process card transactions via Stripe without storing sensitive numbers.",
    icon: CreditCard,
  },
  {
    title: "Dispute & Compliance",
    description: "Any legal complaints or transactions are subject to standard e-commerce regulations in Pakistan, with dispute resolutions governed under the local jurisdiction of Depalpur.",
    icon: Scale,
  },
];

export default function TermsOfServicePage() {
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
          Agreement & Guidelines
        </motion.span>
        <motion.h1
          variants={fadeUp}
          className="font-display text-4xl sm:text-5xl font-bold text-ink"
        >
          Terms of Service
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="text-muted text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
        >
          Welcome to {APP_NAME}. These terms define the legal framework governing your interactions, orders, and usage of our online bookshop.
        </motion.p>
      </motion.div>

      <hr className="border-border" />

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {termHighlights.map((term, idx) => {
          const Icon = term.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-3 hover:border-gold/30 transition-all shadow-card"
            >
              <div className="w-10 h-10 rounded-full bg-gold-glow/5 border border-gold/20 flex items-center justify-center text-gold">
                <Icon size={18} />
              </div>
              <h3 className="font-display text-base font-bold text-ink">{term.title}</h3>
              <p className="text-xs text-muted leading-relaxed">
                {term.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Account Obligations Section */}
      <div className="bg-surface border border-border rounded-[var(--radius-card)] p-6 sm:p-8 space-y-6 shadow-card">
        <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
          <FileText className="text-gold" size={22} /> 1. User Account Obligations
        </h2>
        <div className="text-xs sm:text-sm text-muted leading-relaxed space-y-4">
          <p>
            When creating an account on {APP_NAME}, you agree to provide complete, accurate, and current information. You are solely responsible for maintaining the confidentiality of your login credentials and password.
          </p>
          <p>
            We reserve the right to suspend or terminate accounts that provide misleading, fraudulent, or outdated details, or engage in suspicious shopping patterns that conflict with our store policies.
          </p>
        </div>
      </div>

      {/* Liability Section */}
      <div className="bg-surface border border-border rounded-[var(--radius-card)] p-6 sm:p-8 space-y-6 shadow-card">
        <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
          <AlertCircle className="text-gold" size={22} /> 2. Disclaimer & Limitation of Liability
        </h2>
        <div className="text-xs sm:text-sm text-muted leading-relaxed space-y-4">
          <p>
            {APP_NAME} provides its bookstore platform, products, and services on an &quot;as-is&quot; basis. While we strive to ensure book details, summaries, cover previews, and pricing information are correct, we do not warrant that all content is free from typographical errors.
          </p>
          <p>
            In no event shall {APP_NAME}, its partners, or affiliates be liable for direct, indirect, or consequential damages resulting from product deliveries, payment errors, server downtimes, or third-party mailing service delays.
          </p>
        </div>
      </div>

      {/* Questions & Contact */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
          <HelpCircle className="text-gold" size={22} /> Legal Inquiries
        </h2>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">
          If you have any questions or require clarification regarding these Terms of Service, please reach out to our administration and support team via email at <strong className="text-ink">{APP_EMAIL}</strong> or through our helpline.
        </p>
      </div>
    </div>
  );
}
