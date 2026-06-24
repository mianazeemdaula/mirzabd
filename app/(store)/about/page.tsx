// app/(store)/about/page.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, BookOpen, Clock, Heart, Users, History, Calendar, CheckCircle2 } from "lucide-react";
import { fadeUp, stagger, scaleIn } from "@/lib/motion";
import { APP_NAME } from "@/lib/constants";

const stats = [
  { label: "Years of Service", value: "45+", icon: Clock },
  { label: "Books in Catalog", value: "15,000+", icon: BookOpen },
  { label: "Satisfied Customers", value: "50,000+", icon: Users },
  { label: "Quality Curations", value: "100%", icon: Award },
];

const timeline = [
  {
    year: "1980",
    title: "The Humble Beginning",
    description: "Mirza Plaza's bookstore journey started as a modest bookstall at the heart of Depalpur, committed to bringing rare books and literature to the local community.",
  },
  {
    year: "1995",
    title: "Relocation to Mirza Plaza",
    description: "To meet the growing demand of readers, we moved into a larger, dedicated space at Mirza Plaza, establishing ourselves as a regional landmark for book lovers.",
  },
  {
    year: "2010",
    title: "Regional Distribution Network",
    description: "Expanded our catalog to include major national textbook boards, authentic Islamic publications, and classical Urdu literature distribution across Okara district.",
  },
  {
    year: "2026",
    title: "The Digital Revolution",
    description: "Launched our full-stack digital storefront with real-time POS inventory synchronization, bringing our rich physical heritage of 46 years to readers across Pakistan.",
  },
];

const values = [
  {
    title: "Authentic Literature",
    description: "We are committed to curating only authentic and high-quality prints, supporting authors, and preserving rare publications.",
  },
  {
    title: "Community First",
    description: "For over four decades, our readers have been our family. We prioritize service, fair pricing, and trust above all else.",
  },
  {
    title: "Cultural Heritage",
    description: "Promoting Urdu literature and Islamic history is central to our curation, keeping our heritage alive for the next generation.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-20">
      {/* Hero Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger(0.1)}
        className="text-center max-w-3xl mx-auto space-y-4"
      >
        <motion.span
          variants={fadeUp}
          className="text-badge text-gold tracking-widest font-bold uppercase"
        >
          Our Story
        </motion.span>
        <motion.h1
          variants={fadeUp}
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ink"
        >
          Serving Readers Since 1980
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="text-muted text-sm sm:text-base leading-relaxed"
        >
          For over forty-five years, {APP_NAME} has been a sanctuary for minds seeking knowledge, literature, and academic excellence. Discover our journey from a local bookstore to a modern digital library.
        </motion.p>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger(0.08)}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              variants={scaleIn}
              className="bg-surface border border-border rounded-[var(--radius-card)] p-6 text-center space-y-3 shadow-card"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-gold-glow/5 border border-gold/15 flex items-center justify-center text-gold">
                <Icon size={22} />
              </div>
              <div className="font-display text-3xl sm:text-4xl font-bold text-ink">{stat.value}</div>
              <div className="text-xs sm:text-sm text-muted uppercase tracking-wider font-semibold">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* History Timeline */}
      <div className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink flex items-center justify-center gap-2">
            <History className="text-gold" size={28} /> Our Historical Journey
          </h2>
          <p className="text-sm text-muted">
            A timeline of milestones that shaped {APP_NAME} into what it is today.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto border-l border-border/80 pl-6 sm:pl-10 space-y-12 py-4 ml-4 sm:ml-auto">
          {timeline.map((item, idx) => (
            <motion.div
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              className="relative space-y-2 group"
            >
              {/* Timeline Indicator Dot */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-[9px] h-[9px] sm:w-[13px] sm:h-[13px] rounded-full bg-void border-[2px] border-gold ring-4 ring-gold-glow/20 group-hover:scale-110 transition-transform duration-200" />
              
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-xs sm:text-sm font-bold text-gold uppercase tracking-wider flex items-center gap-1.5 bg-gold-glow/5 border border-gold/20 px-2.5 py-0.5 rounded-full">
                  <Calendar size={12} /> {item.year}
                </span>
                <h3 className="font-display text-lg sm:text-xl font-bold text-ink">{item.title}</h3>
              </div>
              <p className="text-sm text-muted leading-relaxed max-w-2xl">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Our Values Section */}
      <div className="bg-surface border border-border rounded-[var(--radius-card)] p-8 sm:p-12 shadow-card space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="font-display text-3xl font-bold text-ink">Core Values & Commitments</h2>
          <p className="text-sm text-muted">
            The foundation of our enduring relationship with generations of readers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((val, idx) => (
            <motion.div
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-gold">
                <CheckCircle2 size={18} className="flex-shrink-0" />
                <h3 className="font-display text-lg font-semibold text-ink">{val.title}</h3>
              </div>
              <p className="text-sm text-muted leading-relaxed">{val.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Founder's Quote */}
      <div className="max-w-3xl mx-auto text-center space-y-4 py-6 border-y border-border">
        <Heart className="mx-auto text-crimson animate-pulse" size={24} />
        <blockquote className="font-display text-lg sm:text-xl italic text-ink/90 leading-relaxed">
          &ldquo;A town is not a town without a bookstore. Since 1980, we have strived to build more than a business — we built a home for the curious minds of Depalpur.&rdquo;
        </blockquote>
        <cite className="block text-xs uppercase tracking-widest text-gold font-bold font-body not-italic">
          — Mirza Rab Nawaz, Founder
        </cite>
      </div>
    </div>
  );
}
