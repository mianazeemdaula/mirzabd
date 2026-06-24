// lib/motion.ts
"use client";

import { useReducedMotion } from "framer-motion";

// ─────────────────────────────────────────────
// Spring Configs
// ─────────────────────────────────────────────

export const spring = {
  gentle: { type: "spring" as const, stiffness: 120, damping: 20 },
  snappy: { type: "spring" as const, stiffness: 300, damping: 30 },
  bounce: { type: "spring" as const, stiffness: 400, damping: 15 },
  slow: { type: "spring" as const, stiffness: 60, damping: 20 },
};

// ─────────────────────────────────────────────
// Easing Curves
// ─────────────────────────────────────────────

export const ease = {
  in: [0.4, 0, 1, 1] as const,
  out: [0, 0, 0.2, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
  expo: [0.16, 1, 0.3, 1] as const,
};

// ─────────────────────────────────────────────
// Duration Constants (seconds)
// ─────────────────────────────────────────────

export const duration = {
  fast: 0.15,
  base: 0.3,
  slow: 0.6,
  slower: 1.0,
};

// ─────────────────────────────────────────────
// Reusable Variants
// ─────────────────────────────────────────────

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: ease.expo },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

export const stagger = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren, delayChildren },
  },
});

export const scaleIn = {
  hidden: { scale: 0.92, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { ...spring.gentle },
  },
};

export const slideLeft = {
  hidden: { x: 60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: ease.expo },
  },
};

export const slideRight = {
  hidden: { x: -60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: ease.expo },
  },
};

export const slideUp = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: ease.expo },
  },
};

// ─────────────────────────────────────────────
// useMotion Hook — respects reduced motion
// ─────────────────────────────────────────────

export function useMotion() {
  const prefersReducedMotion = useReducedMotion();

  return {
    prefersReducedMotion,
    // Return no-op variants when user prefers reduced motion
    animate: (variants: Record<string, unknown>) => {
      if (prefersReducedMotion) {
        return {
          hidden: { opacity: 1 },
          visible: { opacity: 1 },
        };
      }
      return variants;
    },
    // Transition override for reduced motion
    transition: (t: Record<string, unknown>) => {
      if (prefersReducedMotion) {
        return { duration: 0 };
      }
      return t;
    },
  };
}
