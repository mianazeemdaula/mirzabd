// components/store/hero.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { spring, ease } from "@/lib/motion";

export function Hero() {
  // Category showcase items linked directly to catalog filters
  const showcaseItems = [
    { title: "Textbooks", slug: "school-and-college-books", color: "bg-sky-600", text: "text-white", height: "h-[250px]", rotate: -6, emoji: "📚" },
    { title: "Notebooks", slug: "school-registers-and-account-books", color: "bg-amber-500", text: "text-white", height: "h-[290px]", rotate: 4, emoji: "📓" },
    { title: "Stationery", slug: "school-stationery", color: "bg-rose-500", text: "text-white", height: "h-[270px]", rotate: -3, emoji: "✏️" },
    { title: "Bags", slug: "school-and-college-bags", color: "bg-indigo-500", text: "text-white", height: "h-[285px]", rotate: 5, emoji: "🎒" },
    { title: "Art Supplies", slug: "art-materials", color: "bg-emerald-600", text: "text-white", height: "h-[310px]", rotate: -5, emoji: "🎨" },
  ];

  return (
    <section className="relative w-full flex items-center bg-gradient-to-br from-surface via-void to-surface overflow-hidden py-16 sm:py-24">
      {/* Dynamic Rich Ambient Background Gradients with Higher Opacity */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Sky Blue Nebula Glow (Brand Primary) - Rich */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-sky-400/35 via-sky-600/20 to-transparent rounded-full blur-[110px]" />

        {/* Warm Golden / Amber Glow (Top Right) - Vibrant */}
        <div className="absolute -top-16 -right-16 w-[500px] h-[500px] bg-gradient-to-bl from-amber-400/35 via-yellow-500/22 to-transparent rounded-full blur-[100px]" />

        {/* Emerald Jewel Tone Glow (Bottom Left) - Rich */}
        <div className="absolute -bottom-20 -left-16 w-[450px] h-[450px] bg-gradient-to-tr from-emerald-500/28 via-teal-600/16 to-transparent rounded-full blur-[100px]" />

        {/* Violet Velvet Glow (Bottom Right) - Rich */}
        <div className="absolute -bottom-20 right-1/4 w-[450px] h-[450px] bg-gradient-to-tl from-indigo-500/25 via-purple-600/14 to-transparent rounded-full blur-[110px]" />

        {/* Center Core Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/12 rounded-full blur-[120px]" />
      </div>

      {/* Floating decorative sparkle particles with higher opacity */}
      <div className="absolute inset-0 pointer-events-none opacity-45 z-0">
        <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-gold rounded-full blur-[1px] animate-float-slow" />
        <div className="absolute top-[50%] left-[25%] w-2.5 h-2.5 bg-gold rounded-full blur-[1px] animate-float-medium" />
        <div className="absolute top-[80%] left-[15%] w-1.5 h-1.5 bg-gold rounded-full blur-[0.5px] animate-float-fast" />
        <div className="absolute top-[30%] right-[20%] w-2 h-2 bg-gold rounded-full blur-[1px] animate-float-slow" />
        <div className="absolute top-[60%] right-[10%] w-3 h-3 bg-gold rounded-full blur-[1.5px] animate-float-medium" />
        <div className="absolute top-[15%] left-[60%] w-1.5 h-1.5 bg-gold rounded-full blur-[0.5px] animate-float-fast" />
      </div>

      <div className="relative mx-auto w-full max-w-none px-4 sm:px-8 md:px-12 lg:px-16 z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
        {/* Left panel: animated product showcase cards (desktop) */}
        <div className="lg:col-span-3 flex justify-center order-3 lg:order-1 h-[340px] sm:h-[360px] items-end relative px-2">
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
              <Link key={idx} href={`/products?category=${item.slug}`} className="block focus:outline-none">
                <motion.div
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
                  className={`relative w-13 sm:w-15 ${item.height} ${item.color} ${item.text} rounded-xl shadow-card flex flex-col justify-between py-5 px-2.5 cursor-pointer border border-white/20`}
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
                  <div className="absolute top-0 right-2.5 w-1 h-7 bg-white/50 rounded-b shadow-inner" />
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Center panel: Urdu Dialogue (Prominent & Larger Text) */}
        <div className="lg:col-span-6 space-y-5 order-1 lg:order-2 text-center lg:text-right" dir="rtl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: ease.expo }}
            className="space-y-4 max-w-2xl mx-auto lg:mx-0"
          >
            {/* Urdu Rhyming Dialogue */}
            <h1
              dir="rtl"
              lang="ur"
              className="font-urdu text-right select-none"
            >
              <div className="space-y-3 sm:space-y-4">
                {/* Step 1: خزانہ کیسے ملا؟ علم حاصل کرنے سے */}
                <div className="flex flex-wrap items-center justify-between sm:justify-start gap-x-5 gap-y-1.5 text-lg sm:text-xl md:text-2xl lg:text-[1.65rem] leading-loose">
                  <span className="text-muted font-normal flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gold/60" />
                    خزانہ کیسے ملا؟
                  </span>
                  <span className="text-ink font-semibold flex items-center gap-2.5">
                    <span className="text-gold/80 text-base sm:text-lg font-sans select-none">←</span>
                    علم حاصل کرنے سے
                  </span>
                </div>

                {/* Step 2: علم کہاں سے ملا؟ کتابوں سے */}
                <div className="flex flex-wrap items-center justify-between sm:justify-start gap-x-5 gap-y-1.5 text-lg sm:text-xl md:text-2xl lg:text-[1.65rem] leading-loose">
                  <span className="text-muted font-normal flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gold/60" />
                    علم کہاں سے ملا؟
                  </span>
                  <span className="text-ink font-semibold flex items-center gap-2.5">
                    <span className="text-gold/80 text-base sm:text-lg font-sans select-none">←</span>
                    کتابوں سے
                  </span>
                </div>

                {/* Elegant divider */}
                <div className="h-px bg-gradient-to-l from-gold/35 via-gold/15 to-transparent my-2" />

                {/* Step 3: کتابیں کہاں سے ملیں؟ مرزا بک ڈپو سے */}
                <div className="flex flex-wrap items-baseline justify-between sm:justify-start gap-x-5 gap-y-2 pt-1">
                  <span className="text-ink/90 text-xl sm:text-2xl md:text-3xl font-medium flex items-center gap-3 leading-relaxed">
                    <span className="w-3 h-3 rounded-full bg-gold animate-pulse" />
                    کتابیں کہاں سے ملیں؟
                  </span>
                  <span className="text-gold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-normal drop-shadow-[0_2px_16px_rgba(2,132,199,0.4)] leading-relaxed">
                    مرزا بک ڈپو سے
                  </span>
                </div>
              </div>
            </h1>
          </motion.div>
        </div>

        {/* Right panel: Sack of Gold Coins */}
        <div className="lg:col-span-3 flex justify-center items-center order-2 lg:order-3 my-4 lg:my-0">
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
            <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-amber-500/25 via-yellow-400/15 to-transparent rounded-full blur-2xl pointer-events-none scale-125 group-hover:scale-150 transition-transform duration-500" />

            <div className="relative w-44 sm:w-52 md:w-56 lg:w-48 xl:w-56 aspect-square">
              <Image
                src="/images/gold-coin-sack.png"
                alt="Treasure Sack of Gold Coins"
                fill
                sizes="(max-width: 768px) 208px, 224px"
                className="object-contain drop-shadow-[0_12px_28px_rgba(232,168,62,0.35)]"
                priority
              />
            </div>
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
