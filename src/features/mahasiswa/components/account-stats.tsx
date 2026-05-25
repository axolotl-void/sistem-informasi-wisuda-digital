"use client";

import type { LucideIcon } from "lucide-react";
import {
  Users,
  UserX,
  FileWarning,
  Clock,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import type { WisudawanRow } from "@/services/wisudawan.service";

interface CardConfig {
  label: string;
  icon: LucideIcon;
  accent: string;
  iconBg: string;
  compute: (data: WisudawanRow[]) => number;
}

const cards: CardConfig[] = [
  {
    label: "Total Wisudawan",
    icon: Users,
    accent: "text-blue-700 dark:text-blue-300",
    iconBg:
      "bg-gradient-to-br from-blue-400/35 to-blue-600/10 border border-blue-400/40 dark:from-blue-500/20 dark:to-blue-600/5 dark:border-blue-500/25",
    compute: (d) => d.length,
  },
  {
    label: "Belum Login",
    icon: UserX,
    accent: "text-slate-600 dark:text-zinc-300",
    iconBg:
      "bg-gradient-to-br from-slate-400/25 to-slate-600/10 border border-slate-400/35 dark:from-zinc-500/15 dark:to-zinc-600/5 dark:border-zinc-500/20",
    compute: (d) =>
      d.filter((s) => s.status === "AKTIF" && !s.hasUndangan && !s.kehadiranStatus)
        .length,
  },
  {
    label: "Profile Belum Lengkap",
    icon: FileWarning,
    accent: "text-orange-700 dark:text-orange-300",
    iconBg:
      "bg-gradient-to-br from-orange-400/35 to-orange-600/10 border border-orange-400/40 dark:from-orange-500/20 dark:to-orange-600/5 dark:border-orange-500/25",
    compute: (d) => d.filter((s) => s.status === "AKTIF" && !s.hasUndangan).length,
  },
  {
    label: "Menunggu Verifikasi",
    icon: Clock,
    accent: "text-amber-700 dark:text-yellow-300",
    iconBg:
      "bg-gradient-to-br from-amber-400/35 to-amber-600/10 border border-amber-400/40 dark:from-yellow-500/20 dark:to-yellow-600/5 dark:border-yellow-500/25",
    compute: (d) =>
      d.filter((s) => s.status === "AKTIF" && s.hasUndangan && !s.kehadiranStatus)
        .length,
  },
  {
    label: "Terverifikasi",
    icon: ShieldCheck,
    accent: "text-sky-700 dark:text-sky-300",
    iconBg:
      "bg-gradient-to-br from-sky-400/35 to-sky-600/10 border border-sky-400/40 dark:from-sky-500/20 dark:to-sky-600/5 dark:border-sky-500/25",
    compute: (d) => d.filter((s) => s.status === "LULUS").length,
  },
  {
    label: "Sudah Hadir",
    icon: UserCheck,
    accent: "text-emerald-700 dark:text-emerald-300",
    iconBg:
      "bg-gradient-to-br from-emerald-400/35 to-emerald-600/10 border border-emerald-400/40 dark:from-emerald-500/20 dark:to-emerald-600/5 dark:border-emerald-500/25",
    compute: (d) => d.filter((s) => s.kehadiranStatus === "HADIR").length,
  },
];

interface AccountStatsProps {
  data: WisudawanRow[];
  total: number;
}

export function AccountStats({ data, total }: AccountStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((c, index) => {
        const value = index === 0 ? total : c.compute(data);
        const Icon = c.icon;
        return (
          <LiquidGlassCard
            key={c.label}
            noEntrance
            hover={false}
            className="p-3.5"
          >
            <div
              className={cn(
                "mb-2.5 flex size-8 items-center justify-center rounded-xl",
                c.iconBg,
              )}
            >
              <Icon className={cn("size-4", c.accent)} />
            </div>
            <p className="text-xl font-bold leading-none tracking-tight text-slate-900 dark:text-white dark:drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <span className="bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent dark:hidden">
                {value}
              </span>
              <span className="hidden dark:inline">{value}</span>
            </p>
            <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-600 dark:text-white/35">
              {c.label}
            </p>
          </LiquidGlassCard>
        );
      })}
    </div>
  );
}
