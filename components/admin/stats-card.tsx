// components/admin/stats-card.tsx

import React from "react";
import { LucideIcon } from "lucide-react";
import { CountUp } from "@/components/motion/count-up";

interface StatsCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  duration?: number;
}

export function StatsCard({
  label,
  value,
  prefix = "",
  suffix = "",
  icon: Icon,
  trend,
  duration = 1.5,
}: StatsCardProps) {
  return (
    <div className="bg-surface border border-border rounded-[var(--radius-card)] p-6 flex items-center justify-between shadow-sm relative overflow-hidden hover:border-gold/30 transition-colors">
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted block">
          {label}
        </span>
        <div className="flex items-baseline gap-2">
          <CountUp
            target={value}
            prefix={prefix}
            suffix={suffix}
            duration={duration}
            className="text-2xl sm:text-3xl font-bold font-mono text-ink tracking-tight"
          />
          {trend && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                trend.isPositive
                  ? "bg-green-500/10 text-green-400"
                  : "bg-crimson/10 text-crimson"
              }`}
            >
              {trend.isPositive ? "+" : "-"}
              {trend.value}%
            </span>
          )}
        </div>
      </div>

      <div className="p-3 bg-gold/10 text-gold rounded-full border border-gold/25 flex items-center justify-center">
        <Icon size={22} />
      </div>
    </div>
  );
}
export default StatsCard;
