"use client";

import { motion } from "framer-motion";
import {
  Users, UserX, FileWarning, Clock, ShieldCheck, UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WisudawanRow } from "@/services/wisudawan.service";

// ─── Config ──────────────────────────────────────────────────────────────────

interface CardConfig {
  label: string;
  icon: LucideIcon;
  accent: string;
  iconBg: string;
  borderGlow: string;
  compute: (data: WisudawanRow[]) => number;
}

const cards: CardConfig[] = [
  {
    label: "Total Wisudawan",
    icon: Users,
    accent: "text-blue-400",
    iconBg: "bg-blue-500/[0.08]",
    borderGlow: "group-hover:border-blue-500/20",
    compute: (d) => d.length,
  },
  {
    label: "Belum Login",
    icon: UserX,
    accent: "text-zinc-400",
    iconBg: "bg-zinc-500/[0.08]",
    borderGlow: "group-hover:border-zinc-400/15",
    compute: (d) => d.filter((s) => s.status === "AKTIF" && !s.hasUndangan && !s.kehadiranStatus).length,
  },
  {
    label: "Profile Belum Lengkap",
    icon: FileWarning,
    accent: "text-orange-400",
    iconBg: "bg-orange-500/[0.08]",
    borderGlow: "group-hover:border-orange-500/20",
    compute: (d) => d.filter((s) => s.status === "AKTIF" && !s.hasUndangan).length,
  },
  {
    label: "Menunggu Verifikasi",
    icon: Clock,
    accent: "text-yellow-400",
    iconBg: "bg-yellow-500/[0.08]",
    borderGlow: "group-hover:border-yellow-500/15",
    compute: (d) => d.filter((s) => s.status === "AKTIF" && s.hasUndangan && !s.kehadiranStatus).length,
  },
  {
    label: "Terverifikasi",
    icon: ShieldCheck,
    accent: "text-sky-400",
    iconBg: "bg-sky-500/[0.08]",
    borderGlow: "group-hover:border-sky-500/20",
    compute: (d) => d.filter((s) => s.status === "LULUS").length,
  },
  {
    label: "Sudah Hadir",
    icon: UserCheck,
    accent: "text-emerald-400",
    iconBg: "bg-emerald-500/[0.08]",
    borderGlow: "group-hover:border-emerald-500/20",
    compute: (d) => d.filter((s) => s.kehadiranStatus === "HADIR").length,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface AccountStatsProps {
  data: WisudawanRow[];
  total: number;
}

export function AccountStats({ data, total }: AccountStatsProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
        gap: "0.5rem",
      }}
    >
      {cards.map((c, i) => {
        const value = i === 0 ? total : c.compute(data);
        return (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
            className={cn(
              "group relative rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5",
              "transition-all duration-300 ease-out",
              "hover:-translate-y-px hover:bg-white/[0.05]",
              c.borderGlow,
            )}
          >
            {/* Top light reflection */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent rounded-t-xl" />

            <div className={cn("mb-2.5 flex size-7 items-center justify-center rounded-lg", c.iconBg)}>
              <c.icon className={cn("size-3.5", c.accent)} />
            </div>
            <p className="text-xl font-bold tracking-tight text-white leading-none">
              {value}
            </p>
            <p className="mt-1 text-[10px] font-medium tracking-wide text-white/25 uppercase">
              {c.label}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
