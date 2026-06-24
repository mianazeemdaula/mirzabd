// components/motion/count-up.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

interface CountUpProps {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number; // in seconds
  className?: string;
}

export function CountUp({
  target,
  prefix = "",
  suffix = "",
  duration = 2,
  className = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        setValue(Math.floor(latest));
      },
    });

    return () => controls.stop();
  }, [target, duration, isInView]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}
export default CountUp;
