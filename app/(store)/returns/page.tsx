// app/(store)/returns/page.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { RefreshCcw, HelpCircle, CheckCircle, AlertTriangle, MessageSquare } from "lucide-react";
import { fadeUp, stagger } from "@/lib/motion";
import { APP_CONTACT, APP_EMAIL } from "@/lib/constants";

const conditions = [
  {
    title: "Wrong Book Delivered",
    description: "If we shipped a title different from what you ordered, we will swap it immediately at absolutely zero cost to you.",
  },
  {
    title: "Print or Binding Defects",
    description: "Missing pages, smudged print, inverted bindings, or severe damage during transit qualify for instant replacement or refund.",
  },
  {
    title: "Change of Mind",
    description: "Eligible for exchange or store credit within 7 days if the book is completely unread, pristine, and in its original bubble seal.",
  },
];

export default function ReturnPolicyPage() {
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
          Returns & Exchanges
        </motion.span>
        <motion.h1
          variants={fadeUp}
          className="font-display text-4xl sm:text-5xl font-bold text-ink"
        >
          Return & Refund Policy
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="text-muted text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
        >
          Your reading experience is our primary concern. We offer a transparent, stress-free 7-day return and exchange policy.
        </motion.p>
      </motion.div>

      <hr className="border-border" />

      {/* Return Conditions */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
          <RefreshCcw className="text-gold" size={22} /> Eligible Return Cases (Within 7 Days)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {conditions.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-surface border border-border rounded-[var(--radius-card)] p-5 space-y-3 hover:border-gold/30 transition-all shadow-card"
            >
              <h3 className="font-display text-base font-bold text-ink">{item.title}</h3>
              <p className="text-xs text-muted leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Steps to Return */}
      <div className="bg-surface border border-border rounded-[var(--radius-card)] p-6 sm:p-8 space-y-6 shadow-card">
        <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
          <MessageSquare className="text-gold" size={22} /> How to Initiate a Return or Exchange
        </h2>
        <div className="space-y-4">
          <div className="flex gap-4 items-start text-xs sm:text-sm">
            <div className="w-6 h-6 rounded-full bg-gold-glow/5 border border-gold/20 flex items-center justify-center text-gold font-bold flex-shrink-0">
              1
            </div>
            <p className="text-muted leading-relaxed mt-0.5">
              Contact our customer support team via WhatsApp at <strong className="text-gold">{APP_CONTACT}</strong> or email us at <strong className="text-ink">{APP_EMAIL}</strong> within 7 days of receiving your package. Share your order number and photos/videos of the defect or book.
            </p>
          </div>
          <div className="flex gap-4 items-start text-xs sm:text-sm">
            <div className="w-6 h-6 rounded-full bg-gold-glow/5 border border-gold/20 flex items-center justify-center text-gold font-bold flex-shrink-0">
              2
            </div>
            <p className="text-muted leading-relaxed mt-0.5">
              Once approved, package the books securely in the original packaging. Send them to our distribution depot: <strong>Allah o Akbar Chowk, Mirza Plaza, Depalpur, Pakistan</strong>.
            </p>
          </div>
          <div className="flex gap-4 items-start text-xs sm:text-sm">
            <div className="w-6 h-6 rounded-full bg-gold-glow/5 border border-gold/20 flex items-center justify-center text-gold font-bold flex-shrink-0">
              3
            </div>
            <p className="text-muted leading-relaxed mt-0.5">
              Upon inspection at our warehouse, we will dispatch your replacement book or process your refund via Bank Transfer, EasyPaisa, or JazzCash within 3 to 5 business days.
            </p>
          </div>
        </div>
      </div>

      {/* Non-returnable conditions */}
      <div className="p-5 bg-crimson/10 border border-crimson/20 rounded-[var(--radius-card)] flex items-start gap-4 shadow-sm">
        <AlertTriangle className="text-crimson flex-shrink-0 mt-0.5" size={20} />
        <div className="space-y-1">
          <h4 className="font-semibold text-ink text-sm">Non-Returnable Items</h4>
          <p className="text-xs text-muted leading-relaxed">
            Books displaying physical damage (scratched covers, folded pages, or wet stains) caused by customer handling, as well as digital materials, rare/antique editions explicitly marked as non-returnable, are not eligible for refunds or exchanges.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
          <HelpCircle className="text-gold" size={22} /> Return FAQ
        </h2>
        <div className="space-y-4">
          <div className="p-5 bg-elevated/40 border border-border/80 rounded-[var(--radius-card)] space-y-2">
            <h4 className="font-semibold text-ink text-sm sm:text-base">Who pays for return shipping?</h4>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              If the return is due to our error (wrong book, printing damage, etc.), we will reimburse the return shipping cost or coordinate local courier pickup. For change-of-mind exchanges, the buyer is responsible for return shipping costs.
            </p>
          </div>
          <div className="p-5 bg-elevated/40 border border-border/80 rounded-[var(--radius-card)] space-y-2">
            <h4 className="font-semibold text-ink text-sm sm:text-base">Can I return a book bought on sale?</h4>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Sale items are eligible for exchange only in case of print defects or shipment errors. We do not support change-of-mind refunds for promotional sale titles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
