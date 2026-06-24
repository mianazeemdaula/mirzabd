// components/motion/stagger-list.tsx
"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { stagger, fadeUp } from "@/lib/motion";

interface StaggerListProps {
  children: React.ReactNode;
  staggerChildren?: number;
  delayChildren?: number;
  className?: string;
}

export function StaggerList({
  children,
  staggerChildren = 0.08,
  delayChildren = 0,
  className = "",
}: StaggerListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={stagger(staggerChildren, delayChildren)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = "" }: StaggerItemProps) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}
