"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import CountUp from "@/components/CountUp";

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
    icon: "text-blue-700 dark:text-blue-300",
    iconBg:
      "bg-gradient-to-br from-blue-400/35 to-blue-600/15 border border-blue-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(59,130,246,0.15)] dark:from-blue-500/20 dark:to-blue-600/5 dark:border-blue-500/25 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]",
    ring: "group-hover:shadow-[0_20px_50px_rgba(59,130,246,0.18)]",
  },
  emerald: {
    icon: "text-emerald-700 dark:text-emerald-300",
    iconBg:
      "bg-gradient-to-br from-emerald-400/35 to-emerald-600/15 border border-emerald-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(16,185,129,0.15)] dark:from-emerald-500/20 dark:to-emerald-600/5 dark:border-emerald-500/25",
    ring: "group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.18)]",
  },
  orange: {
    icon: "text-orange-700 dark:text-orange-300",
    iconBg:
      "bg-gradient-to-br from-orange-400/35 to-orange-600/15 border border-orange-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(249,115,22,0.15)] dark:from-orange-500/20 dark:to-orange-600/5 dark:border-orange-500/25",
    ring: "group-hover:shadow-[0_20px_50px_rgba(249,115,22,0.18)]",
  },
  violet: {
    icon: "text-violet-700 dark:text-violet-300",
    iconBg:
      "bg-gradient-to-br from-violet-400/35 to-violet-600/15 border border-violet-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_12px_rgba(139,92,246,0.15)] dark:from-violet-500/20 dark:to-violet-600/5 dark:border-violet-500/25",
    ring: "group-hover:shadow-[0_20px_50px_rgba(139,92,246,0.18)]",
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

  // Helper untuk merender nilai stat dengan animasi CountUp jika bertipe angka/dapat diparsing
  const renderValue = () => {
    // Abaikan jika memuat awal / default loader
    if (value === "—" || value === "") {
      return value;
    }

    if (typeof value === "number") {
      return <CountUp to={value} separator="." duration={1.5} />;
    }

    if (typeof value === "string") {
      // Jika string angka murni (misal: "123")
      // Hapus titik ribuan bawaan indonesia agar bisa di-parse (misal "1.250" -> 1250)
      const cleanValue = value.replace(/\./g, "");
      if (/^\d+$/.test(cleanValue)) {
        return <CountUp to={parseInt(cleanValue, 10)} separator="." duration={1.5} />;
      }

      // Jika format pecahan seperti "1/182" atau "1.000/2.000"
      if (/^[\d.]+\s*\/\s*[\d.]+$/.test(value)) {
        const parts = value.split("/");
        const currentStr = parts[0].replace(/\./g, "").trim();
        const totalStr = parts[1].trim();
        const current = parseInt(currentStr, 10);
        return (
          <>
            <CountUp to={current} separator="." duration={1.5} />
            <span>/{totalStr}</span>
          </>
        );
      }
    }

    return value;
  };

  return (
    <LiquidGlassCard
      noEntrance
      hover={false}
      className={cn("group p-5", colors.ring)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-white/40">
            {label}
          </p>
          <p className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            <span className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent dark:hidden">
              {renderValue()}
            </span>
            <span className="hidden dark:inline">{renderValue()}</span>
          </p>
          {subtitle && (
            <p className="text-xs font-medium text-slate-600 dark:text-white/35">
              {subtitle}
            </p>
          )}
          {trend && (
            <p
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                trend.positive
                  ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-800 dark:border-transparent dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "border-red-400/30 bg-red-500/15 text-red-800 dark:border-transparent dark:bg-red-500/10 dark:text-red-300",
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-2xl",
            colors.iconBg,
          )}
        >
          <Icon className={cn("size-5", colors.icon)} />
        </div>
      </div>
    </LiquidGlassCard>
  );
}
