"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent: "blue" | "emerald" | "orange" | "violet";
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  delay?: number;
}

const accentMap = {
  blue: {
    icon: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-500/10",
    glow: "hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_0_30px_rgba(59,130,246,0.12)]",
  },
  emerald: {
    icon: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/10",
    glow: "hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.12)]",
  },
  orange: {
    icon: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-100 dark:bg-orange-500/10",
    glow: "hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)] dark:hover:shadow-[0_0_30px_rgba(249,115,22,0.12)]",
  },
  violet: {
    icon: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-100 dark:bg-violet-500/10",
    glow: "hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)] dark:hover:shadow-[0_0_30px_rgba(139,92,246,0.12)]",
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  subtitle,
  trend,
  delay = 0,
}: StatCardProps) {
  const colors = accentMap[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(
        "group relative rounded-3xl border p-5",
        // Light mode: white glass card dengan soft shadow
        "bg-white/70 border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md",
        // Dark mode: tetap seperti semula
        "dark:bg-white/[0.04] dark:border-white/[0.08] dark:shadow-none dark:backdrop-blur-xl",
        "transition-all duration-500",
        "hover:-translate-y-0.5",
        "dark:hover:border-white/[0.12] dark:hover:bg-white/[0.06]",
        colors.glow,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/35">
            {label}
          </p>
          <p className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs font-medium text-slate-400 dark:text-white/25">{subtitle}</p>
          )}
          {trend && (
            <p className={cn("text-xs font-semibold", trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400")}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            colors.iconBg,
          )}
        >
          <Icon className={cn("size-5", colors.icon)} />
        </div>
      </div>
    </motion.div>
  );
}
