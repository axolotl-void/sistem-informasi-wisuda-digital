"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Users, TrendingUp } from "lucide-react";
import { useKehadiranStore } from "@/store/kehadiran.store";

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
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:bg-white/[0.04]"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-white/30">
            {label}
          </span>
          <h3 className="text-3xl font-black tracking-tight text-white tabular-nums">
            {value}
          </h3>
          {subText && (
            <p className="text-[0.7rem] font-medium text-white/40">{subText}</p>
          )}
        </div>
        <div className={`flex size-11 items-center justify-center rounded-xl ${bgClass}`}>
          <Icon className={`size-5.5 ${color}`} />
        </div>
      </div>
      
      {/* Decorative ambient light inside card */}
      <div className="pointer-events-none absolute -right-6 -bottom-6 size-16 rounded-full bg-white/[0.01] blur-md" />
    </motion.div>
  );
}

export function KehadiranStats() {
  const { stats, isLoadingStats } = useKehadiranStore();

  if (isLoadingStats && !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-white/[0.06] bg-white/[0.02] animate-pulse"
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
      color: "text-blue-400",
      bgClass: "bg-blue-500/10 border border-blue-500/20",
      delay: 0,
    },
    {
      label: "Hadir (Scan + Manual)",
      value: totalHadir,
      subText: `${current.hadir} Tepat Waktu | ${current.terlambat} Terlambat`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgClass: "bg-emerald-500/10 border border-emerald-500/20",
      delay: 0.05,
    },
    {
      label: "Belum Hadir",
      value: current.tidakHadir,
      subText: "Menunggu Kedatangan",
      icon: XCircle,
      color: "text-rose-400",
      bgClass: "bg-rose-500/10 border border-rose-500/20",
      delay: 0.1,
    },
    {
      label: "Persentase Kehadiran",
      value: `${pct}%`,
      subText: `${totalHadir} dari ${current.total} wisudawan`,
      icon: TrendingUp,
      color: "text-amber-400",
      bgClass: "bg-amber-500/10 border border-amber-500/20",
      delay: 0.15,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      {/* Interactive Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4.5 backdrop-blur-xl"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-white/30">
            Progress Kehadiran
          </span>
          <span className="text-sm font-black text-white">{pct}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
          />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-4 text-[0.68rem] font-semibold text-white/40">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400" />
            <span>Hadir Tepat Waktu: {Math.round(current.total > 0 ? (current.hadir / current.total) * 100 : 0)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-400" />
            <span>Hadir Terlambat: {Math.round(current.total > 0 ? (current.terlambat / current.total) * 100 : 0)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-rose-400" />
            <span>Belum Scan: {Math.round(current.total > 0 ? (current.tidakHadir / current.total) * 100 : 0)}%</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
