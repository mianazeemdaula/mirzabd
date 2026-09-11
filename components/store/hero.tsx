// components/store/hero.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { spring, ease } from "@/lib/motion";

export function Hero() {
  // Sample product category showcase items with compact heights
  const showcaseItems = [
    { title: "Textbooks", color: "bg-sky-600", text: "text-white", height: "h-[220px]", rotate: -6, emoji: "📚" },
    { title: "Notebooks", color: "bg-amber-500", text: "text-white", height: "h-[250px]", rotate: 4, emoji: "📓" },
    { title: "Stationery", color: "bg-rose-500", text: "text-white", height: "h-[230px]", rotate: -3, emoji: "✏️" },
    { title: "Sports", color: "bg-indigo-500", text: "text-white", height: "h-[245px]", rotate: 5, emoji: "⚽" },
    { title: "Art Supplies", color: "bg-emerald-600", text: "text-white", height: "h-[265px]", rotate: -5, emoji: "🎨" },
  ];

  return (
    <section className="relative w-full flex items-center bg-gradient-to-br from-surface via-void to-surface overflow-hidden py-8 sm:py-12">
      {/* Dynamic Colorful Ambient Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Sky Blue Nebula Glow (Brand Primary) */}
        <div className="absolute -top-32 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-sky-500/20 via-sky-600/10 to-transparent rounded-full blur-[110px]" />

        {/* Warm Golden / Amber Glow (Top Right) */}
        <div className="absolute -top-16 -right-16 w-[450px] h-[450px] bg-gradient-to-bl from-amber-400/20 via-yellow-500/10 to-transparent rounded-full blur-[100px]" />

        {/* Emerald Jewel Tone Glow (Bottom Left) */}
        <div className="absolute -bottom-20 -left-16 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-500/15 via-teal-600/8 to-transparent rounded-full blur-[100px]" />

        {/* Violet Velvet Glow (Bottom Right) */}
        <div className="absolute -bottom-20 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-indigo-500/12 via-purple-600/6 to-transparent rounded-full blur-[110px]" />

        {/* Center Core Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-400/5 rounded-full blur-[120px]" />
      </div>

      {/* Floating decorative sparkle particles */}
      <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
        <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-gold rounded-full blur-[1px] animate-float-slow" />
        <div className="absolute top-[50%] left-[25%] w-2.5 h-2.5 bg-gold rounded-full blur-[1px] animate-float-medium" />
        <div className="absolute top-[80%] left-[15%] w-1.5 h-1.5 bg-gold rounded-full blur-[0.5px] animate-float-fast" />
        <div className="absolute top-[30%] right-[20%] w-2 h-2 bg-gold rounded-full blur-[1px] animate-float-slow" />
        <div className="absolute top-[60%] right-[10%] w-3 h-3 bg-gold rounded-full blur-[1.5px] animate-float-medium" />
        <div className="absolute top-[15%] left-[60%] w-1.5 h-1.5 bg-gold rounded-full blur-[0.5px] animate-float-fast" />
      </div>

      <div className="relative mx-auto w-full max-w-none px-4 sm:px-8 md:px-12 lg:px-16 z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">
        {/* Left panel: animated product showcase cards (desktop) */}
        <div className="lg:col-span-5 flex justify-center order-3 lg:order-1 h-[310px] sm:h-[330px] items-end relative px-2">
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
            className="flex items-end gap-2 select-none"
          >
            {showcaseItems.map((item, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { y: 120, opacity: 0, rotate: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    rotate: item.rotate,
                    transition: {
                      y: spring.gentle,
                      opacity: { duration: 0.4 },
                    },
                  },
                }}
                whileHover={{
                  y: -20,
                  rotate: 0,
                  transition: { ...spring.snappy },
                }}
                className={`relative w-14 sm:w-16 ${item.height} ${item.color} ${item.text} rounded-xl shadow-card flex flex-col justify-between py-5 px-3 cursor-pointer border border-white/20`}
                style={{
                  transformOrigin: "bottom center",
                  boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
                }}
              >
                {/* Top detail */}
                <div className="flex justify-center text-xl">
                  {item.emoji}
                </div>

                {/* Vertical Title */}
                <div
                  className="font-display font-bold text-center text-xs sm:text-sm tracking-wider select-none my-auto leading-none"
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    transform: "rotate(180deg)",
                    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  }}
                >
                  {item.title}
                </div>

                {/* Bottom accent dot */}
                <div className="flex justify-center">
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                </div>

                {/* Bookmark ribbon */}
                <div className="absolute top-0 right-3 w-1 h-7 bg-white/50 rounded-b shadow-inner" />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Center panel: Sack of Gold Coins between text and books */}
        <div className="lg:col-span-2 flex justify-center items-center order-2 lg:order-2 my-2 lg:my-0">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: [-6, 6, -6],
            }}
            transition={{
              scale: { duration: 0.8, delay: 0.15, ease: ease.expo },
              opacity: { duration: 0.8, delay: 0.15 },
              y: { duration: 4.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
            }}
            whileHover={{ scale: 1.08, transition: { ...spring.snappy } }}
            className="relative flex items-center justify-center select-none group"
          >
            {/* Radiant golden halo behind sack */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-amber-500/35 via-yellow-400/20 to-transparent rounded-full blur-2xl pointer-events-none scale-125 group-hover:scale-150 transition-transform duration-500" />

            <div className="relative w-36 sm:w-44 md:w-48 lg:w-40 xl:w-48 aspect-square">
              <Image
                src="/images/gold-coin-sack.png"
                alt="Treasure Sack of Gold Coins"
                fill
                sizes="(max-width: 768px) 176px, 192px"
                className="object-contain drop-shadow-[0_12px_28px_rgba(232,168,62,0.4)]"
                priority
              />
            </div>
          </motion.div>
        </div>

        {/* Right panel: Urdu Dialogue & CTAs */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-5 order-1 lg:order-3 text-center lg:text-right" dir="rtl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: ease.expo }}
            className="space-y-3 max-w-xl mx-auto lg:mx-0"
          >
            {/* Urdu Rhyming Dialogue without background card */}
            <h1
              dir="rtl"
              lang="ur"
              className="font-urdu text-right select-none"
            >
              <div className="space-y-1.5 sm:space-y-2">
                {/* Step 1: خزانہ کیسے ملا؟ علم حاصل کرنے سے */}
                <div className="flex flex-wrap items-center justify-between sm:justify-start gap-x-4 gap-y-1 text-base sm:text-lg md:text-xl leading-relaxed">
                  <span className="text-muted font-normal flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gold/50" />
                    خزانہ کیسے ملا؟
                  </span>
                  <span className="text-ink font-semibold flex items-center gap-2">
                    <span className="text-gold/70 text-sm font-sans select-none">←</span>
                    علم حاصل کرنے سے
                  </span>
                </div>

                {/* Step 2: علم کہاں سے ملا؟ کتابوں سے */}
                <div className="flex flex-wrap items-center justify-between sm:justify-start gap-x-4 gap-y-1 text-base sm:text-lg md:text-xl leading-relaxed">
                  <span className="text-muted font-normal flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gold/50" />
                    علم کہاں سے ملا؟
                  </span>
                  <span className="text-ink font-semibold flex items-center gap-2">
                    <span className="text-gold/70 text-sm font-sans select-none">←</span>
                    کتابوں سے
                  </span>
                </div>

                {/* Divider ornament */}
                <div className="h-px bg-gradient-to-l from-gold/30 via-gold/15 to-transparent my-1" />

                {/* Step 3: کتابیں کہاں سے ملیں؟ مرزا بک ڈپو سے */}
                <div className="flex flex-wrap items-baseline justify-between sm:justify-start gap-x-4 gap-y-1 pt-0.5">
                  <span className="text-ink/90 text-base sm:text-lg md:text-xl font-medium flex items-center gap-2 leading-relaxed">
                    <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse" />
                    کتابیں کہاں سے ملیں؟
                  </span>
                  <span className="text-gold text-2xl sm:text-3xl md:text-4xl font-bold tracking-normal drop-shadow-[0_2px_14px_rgba(2,132,199,0.35)] leading-relaxed">
                    مرزا بک ڈپو سے
                  </span>
                </div>
              </div>
            </h1>
          </motion.div>

          {/* Action buttons in English */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: ease.expo }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-1"
          >
            <Link href="/products">
              <Button size="lg" className="px-7 font-semibold rounded-[var(--radius-btn)] h-11 shadow-md hover:shadow-gold/25 transition-all text-sm sm:text-base">
                Browse Collection
              </Button>
            </Link>
            <Link href="/products?on_sale=true">
              <Button variant="ghost" size="lg" className="px-7 font-semibold rounded-[var(--radius-btn)] h-11 hover:border-gold text-sm sm:text-base">
                View Deals
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Floating particles animations */}
      <style jsx global>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-30px) translateX(12px); opacity: 0.6; }
        }
        @keyframes floatMedium {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          50% { transform: translateY(-40px) translateX(-15px); opacity: 0.7; }
        }
        @keyframes floatFast {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-20px) translateX(-8px); opacity: 0.5; }
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
