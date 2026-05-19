"use client";

import { motion } from "framer-motion";
import { Mail, QrCode, Clock, Download, UserCheck, Users } from "lucide-react";
import type { InvitationStats } from "../types";

interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  glow: string;
  bg: string;
}

function StatCard({ item, index }: { item: StatItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className="group relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.1] hover:bg-white/[0.05]"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-[0.7rem] font-medium uppercase tracking-wider text-white/30 truncate">
            {item.label}
          </p>
          <p className="text-2xl font-bold tabular-nums tracking-tight text-white">
            {item.value.toLocaleString("id-ID")}
          </p>
        </div>
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${item.bg} transition-transform duration-300 group-hover:scale-110`}
        >
          <item.icon className={`size-4 ${item.color}`} />
        </div>
      </div>
    </motion.div>
  );
}

export function InvitationStatsCards({ stats }: { stats: InvitationStats }) {
  const items: StatItem[] = [
    { label: "Total Undangan", value: stats.total, icon: Mail, color: "text-blue-400", glow: "blue", bg: "bg-blue-500/10" },
    { label: "QR Aktif", value: stats.qrAktif, icon: QrCode, color: "text-violet-400", glow: "violet", bg: "bg-violet-500/10" },
    { label: "Belum Generate", value: stats.belumGenerate, icon: Clock, color: "text-zinc-400", glow: "zinc", bg: "bg-zinc-500/10" },
    { label: "Sudah Download", value: stats.sudahDownload, icon: Download, color: "text-indigo-400", glow: "indigo", bg: "bg-indigo-500/10" },
    { label: "Sudah Hadir", value: stats.sudahHadir, icon: UserCheck, color: "text-emerald-400", glow: "emerald", bg: "bg-emerald-500/10" },
    { label: "Kuota Tamu", value: stats.totalKuotaTamu, icon: Users, color: "text-orange-400", glow: "orange", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {items.map((item, i) => (
        <StatCard key={item.label} item={item} index={i} />
      ))}
    </div>
  );
}
