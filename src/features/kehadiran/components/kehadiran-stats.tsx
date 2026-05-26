"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, TrendingUp, Users } from "lucide-react";
import { useKehadiranStore } from "@/store/kehadiran.store";
import { cn } from "@/lib/utils";

const cardShell = cn(
  "relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300",
  "border-slate-200/90 bg-white/95 shadow-[0_4px_20px_rgba(59,130,246,0.06)]",
  "hover:-translate-y-0.5 hover:border-slate-300/90 hover:shadow-[0_8px_24px_rgba(59,130,246,0.08)]",
  "dark:border-white/[0.06] dark:bg-white/[0.02] dark:shadow-2xl dark:hover:border-white/[0.12] dark:hover:bg-white/[0.04]",
);

function StatCard({
  label,
  value,
  subText,
  icon: Icon,
  color,
  bgClass,
  delay = 0,
}: {
  label: string;
  value: string | number;
  subText?: string;
  icon: React.ElementType;
  color: string;
  bgClass: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cardShell}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 dark:text-white/30">
            {label}
          </span>
          <h3 className="text-3xl font-black tracking-tight text-slate-900 tabular-nums dark:text-white">
            {value}
          </h3>
          {subText && (
            <p className="text-[0.7rem] font-medium text-slate-600 dark:text-white/40">
              {subText}
            </p>
          )}
        </div>
        <div className={cn("flex size-11 items-center justify-center rounded-xl", bgClass)}>
          <Icon className={cn("size-5.5", color)} />
        </div>
      </div>
    </motion.div>
  );
}

export function KehadiranStats() {
  const { stats, isLoadingStats } = useKehadiranStore();

  if (isLoadingStats && !stats) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              cardShell,
              "h-28 animate-pulse border-slate-200/60 bg-slate-100/80 dark:border-white/[0.06] dark:bg-white/[0.02]",
            )}
          />
        ))}
      </div>
    );
  }

  const current = stats ?? {
    total: 0,
    hadir: 0,
    tidakHadir: 0,
    terlambat: 0,
    persentaseKehadiran: 0,
  };

  const pct = Math.round(current.persentaseKehadiran * 100);
  const totalHadir = current.hadir + current.terlambat;

  const items = [
    {
      label: "Total Undangan",
      value: current.total,
      subText: "Wisudawan Terdaftar",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgClass:
        "border border-blue-200/80 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10",
      delay: 0,
    },
    {
      label: "Hadir (Scan + Manual)",
      value: totalHadir,
      subText: `${current.hadir} Tepat Waktu | ${current.terlambat} Terlambat`,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bgClass:
        "border border-emerald-200/80 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10",
      delay: 0.05,
    },
    {
      label: "Belum Hadir",
      value: current.tidakHadir,
      subText: "Menunggu Kedatangan",
      icon: XCircle,
      color: "text-rose-600 dark:text-rose-400",
      bgClass:
        "border border-rose-200/80 bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/10",
      delay: 0.1,
    },
    {
      label: "Persentase Kehadiran",
      value: `${pct}%`,
      subText: `${totalHadir} dari ${current.total} wisudawan`,
      icon: TrendingUp,
      color: "text-amber-600 dark:text-amber-400",
      bgClass:
        "border border-amber-200/80 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10",
      delay: 0.15,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={cn(cardShell, "p-4.5")}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 dark:text-white/30">
            Progress Kehadiran
          </span>
          <span className="text-sm font-black text-slate-800 dark:text-white">{pct}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/[0.05]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 shadow-[0_0_12px_rgba(16,185,129,0.25)] dark:shadow-[0_0_12px_rgba(16,185,129,0.3)]"
          />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-4 text-[0.68rem] font-semibold text-slate-600 dark:text-white/40">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <span>
              Hadir Tepat Waktu:{" "}
              {Math.round(current.total > 0 ? (current.hadir / current.total) * 100 : 0)}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500 dark:bg-amber-400" />
            <span>
              Hadir Terlambat:{" "}
              {Math.round(
                current.total > 0 ? (current.terlambat / current.total) * 100 : 0,
              )}
              %
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-rose-500 dark:bg-rose-400" />
            <span>
              Belum Scan:{" "}
              {Math.round(
                current.total > 0 ? (current.tidakHadir / current.total) * 100 : 0,
              )}
              %
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
