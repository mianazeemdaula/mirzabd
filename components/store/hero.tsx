// components/store/hero.tsx
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { spring, ease } from "@/lib/motion";
import { APP_TAGLINE, APP_CITY } from "@/lib/constants";

export function Hero() {
  // Sample book spines data
  const bookSpines = [
    { title: "Peer-e-Kamil", color: "bg-[#2A475E]", text: "text-[#E8F0FE]", height: "h-[300px]", rotate: -6 },
    { title: "Forty Rules of Love", color: "bg-[#7B241C]", text: "text-[#FDEDEC]", height: "h-[340px]", rotate: 4 },
    { title: "Atomic Habits", color: "bg-[#1E8449]", text: "text-[#EAF2F8]", height: "h-[310px]", rotate: -3 },
    { title: "Sapiens", color: "bg-[#A87028]", text: "text-[#FDF5E6]", height: "h-[330px]", rotate: 5 },
    { title: "Jannat Kay Pattay", color: "bg-[#4A235A]", text: "text-[#EBDEF0]", height: "h-[360px]", rotate: -5 },
  ];

  return (
    <section className="relative w-full min-h-[85vh] flex items-center bg-void overflow-hidden py-16 sm:py-24">
      {/* Floating gold dust particles layer */}
      <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
        <div className="absolute top-[20%] left-[10%] w-1.5 h-1.5 bg-gold rounded-full blur-[1px] animate-float-slow" />
        <div className="absolute top-[50%] left-[25%] w-2 h-2 bg-gold rounded-full blur-[1px] animate-float-medium" />
        <div className="absolute top-[80%] left-[15%] w-1 h-1 bg-gold rounded-full blur-[0.5px] animate-float-fast" />
        <div className="absolute top-[30%] right-[20%] w-1.5 h-1.5 bg-gold rounded-full blur-[1px] animate-float-slow" />
        <div className="absolute top-[60%] right-[10%] w-2.5 h-2.5 bg-gold rounded-full blur-[1.5px] animate-float-medium" />
        <div className="absolute top-[15%] left-[60%] w-1 h-1 bg-gold rounded-full blur-[0.5px] animate-float-fast" />
      </div>

      {/* Decorative ambient glowing background grids */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Right side in markup, left visual panel: animated book spine stack (desktop only) */}
        <div className="lg:col-span-6 flex justify-center order-2 lg:order-1 h-[420px] items-end relative px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.2,
                },
              },
            }}
            className="flex items-end gap-1.5 select-none"
          >
            {bookSpines.map((book, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { y: 150, opacity: 0, rotate: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    rotate: book.rotate,
                    transition: {
                      y: spring.gentle,
                      opacity: { duration: 0.4 },
                    },
                  },
                }}
                whileHover={{
                  y: -25,
                  rotate: 0,
                  transition: { ...spring.snappy },
                }}
                className={`relative w-14 sm:w-16 ${book.height} ${book.color} ${book.text} rounded-md border-r-4 border-black/30 shadow-card flex flex-col justify-between py-6 px-3 cursor-pointer`}
                style={{
                  transformOrigin: "bottom center",
                  boxShadow: "5px 15px 35px rgba(0,0,0,0.5)",
                }}
              >
                {/* Book top detail */}
                <div className="flex justify-center text-[10px] uppercase tracking-widest font-mono opacity-60">
                  Vol. {idx + 1}
                </div>

                {/* Vertical Title */}
                <div
                  className="font-display font-bold text-center text-sm sm:text-base tracking-wider vertical-text select-none my-auto leading-none"
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    transform: "rotate(180deg)",
                  }}
                >
                  {book.title}
                </div>

                {/* Book bottom detail */}
                <div className="flex justify-center text-gold">
                  <BookOpen size={14} className="opacity-80" />
                </div>

                {/* Book bookmark string detail */}
                <div className="absolute top-0 right-3 w-1 h-8 bg-gold rounded-b shadow-inner opacity-75" />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Left side in markup, right visual panel: Text & CTAs */}
        <div className="lg:col-span-6 space-y-6 order-1 lg:order-2 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ease.expo }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold tracking-wider uppercase mb-2"
          >
            <Sparkles size={12} className="animate-pulse" />
            <span>Depalpur's Premium Curated Store</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: ease.expo }}
            className="text-hero tracking-tight leading-[0.95]"
          >
            {APP_TAGLINE}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: ease.expo }}
            className="text-muted text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-body"
          >
            Welcome to <span className="text-ink font-semibold">Mirza Book Depot</span>. Proudly serving the literary minds of {APP_CITY} and beyond with curated fiction, local poetry, rare Urdu literature, and academics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: ease.expo }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4"
          >
            <Link href="/books">
              <Button size="lg" className="px-8 font-semibold rounded-[var(--radius-btn)] h-12 shadow-md hover:shadow-gold/25 transition-all">
                Browse Collection
              </Button>
            </Link>
            <Link href="/books?on_sale=true">
              <Button variant="ghost" size="lg" className="px-8 font-semibold rounded-[var(--radius-btn)] h-12 hover:border-gold">
                View Deals
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Floating particles animations defined inline via Style tag to maintain component modularity */}
      <style jsx global>{`
        .vertical-text {
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-40px) translateX(15px); opacity: 0.8; }
        }
        @keyframes floatMedium {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          50% { transform: translateY(-60px) translateX(-20px); opacity: 0.9; }
        }
        @keyframes floatFast {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-30px) translateX(-10px); opacity: 0.7; }
        }
        .animate-float-slow {
          animation: floatSlow 15s infinite ease-in-out;
        }
        .animate-float-medium {
          animation: floatMedium 10s infinite ease-in-out;
        }
        .animate-float-fast {
          animation: floatFast 7s infinite ease-in-out;
        }
      `}</style>
    </section>
  );
}
export default Hero;
