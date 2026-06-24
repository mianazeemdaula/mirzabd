// components/motion/fade-up.tsx
"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { fadeUp } from "@/lib/motion";

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FadeUp({ children, delay = 0, className = "" }: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const customVariants = {
    hidden: fadeUp.hidden,
    visible: {
      ...fadeUp.visible,
      transition: {
        ...fadeUp.visible.transition,
        delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={customVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
export default FadeUp;
