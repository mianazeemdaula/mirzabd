// components/motion/book-card-hover.tsx
"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface BookCardHoverProps {
  children: React.ReactNode;
  className?: string;
}

export function BookCardHover({ children, className = "" }: BookCardHoverProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // x & y values ranging from -0.5 to 0.5 depending on cursor position inside card
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Create smooth springs
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), springConfig);

  // Slight parallax offsets for inner content
  const translateZ = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Cursor position relative to card boundaries
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Normalize coordinates to [-0.5, 0.5] range
    const relativeX = mouseX / width - 0.5;
    const relativeY = mouseY / height - 0.5;

    x.set(relativeX);
    y.set(relativeY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${className} perspective-1000`}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full"
      >
        <div style={{ transform: "translateZ(10px)", transformStyle: "preserve-3d" }} className="w-full h-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
export default BookCardHover;
