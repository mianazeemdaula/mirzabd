// components/motion/page-transition.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ease } from "@/lib/motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{
        duration: 0.35,
        ease: ease.out,
      }}
      className="flex-1 flex flex-col w-full"
    >
      {children}
    </motion.div>
  );
}
export default PageTransition;
