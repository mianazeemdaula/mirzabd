// app/(store)/privacy/page.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye, Shield, Key, Share2, HelpCircle } from "lucide-react";
import { fadeUp, stagger } from "@/lib/motion";
import { APP_NAME, APP_EMAIL } from "@/lib/constants";

const policies = [
  {
    title: "Information Collection",
    description: "We collect essential personal information (name, email, telephone number, billing/delivery addresses) when you register an account, customize your profile, or place an order.",
    icon: Eye,
  },
  {
    title: "Secure Processing & Storage",
    description: "Your password is encrypted using high-entropy bcrypt hashing before saving to our MySQL database. We use secure SSL (HTTPS) transport protocols for all data transfers.",
    icon: Key,
  },
  {
    title: "Third-Party Disclosures",
    description: "We share delivery coordinates only with trusted logistics partners (e.g., TCS, Leopards, M&P) to execute shipments. Financial credentials are routed securely to Stripe; we never store card numbers.",
    icon: Share2,
  },
];

export default function PrivacyPolicyPage() {
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
          Trust & Security
        </motion.span>
        <motion.h1
          variants={fadeUp}
          className="font-display text-4xl sm:text-5xl font-bold text-ink"
        >
          Privacy Policy
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="text-muted text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
        >
          We are committed to protecting your personal information. This page details how {APP_NAME} collects, utilizes, and secures customer records.
        </motion.p>
      </motion.div>

      <hr className="border-border" />

      {/* Core Privacy Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {policies.map((policy, idx) => {
          const Icon = policy.icon;
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
              <h3 className="font-display text-base font-bold text-ink">{policy.title}</h3>
              <p className="text-xs text-muted leading-relaxed">
                {policy.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Content */}
      <div className="bg-surface border border-border rounded-[var(--radius-card)] p-6 sm:p-8 space-y-6 shadow-card">
        <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
          <Shield className="text-gold" size={22} /> Cookies & Local Storage
        </h2>
        <div className="text-xs sm:text-sm text-muted leading-relaxed space-y-4">
          <p>
            We use cookie mechanisms and standard browser local storage arrays (e.g., for saving items placed in your shopping bag or wishlist) to offer a smooth, personalized browsing experience. 
          </p>
          <p>
            These elements save states locally on your device to prevent your cart from emptying as you browse different collections or refresh pages. You can restrict cookie settings via your browser configurations, although some user operations may cease to function correctly.
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
          <HelpCircle className="text-gold" size={22} /> Questions & Contact
        </h2>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">
          If you have questions regarding data storage, require account cancellation, or wish to request complete deletion of your records from our systems, please contact our data safety compliance team directly at <strong className="text-ink">{APP_EMAIL}</strong>. We will address your request within 48 business hours.
        </p>
      </div>
    </div>
  );
}
