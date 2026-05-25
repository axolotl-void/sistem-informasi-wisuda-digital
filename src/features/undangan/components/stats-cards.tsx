"use client";

import { Mail, QrCode, Clock, Download, UserCheck, Users } from "lucide-react";
import type { InvitationStats } from "../types";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  iconBg: string;
}

export function InvitationStatsCards({ stats }: { stats: InvitationStats }) {
  const items: StatItem[] = [
    {
      label: "Total Undangan",
      value: stats.total,
      icon: Mail,
      color: "text-blue-700 dark:text-blue-300",
      iconBg:
        "border border-blue-400/40 bg-gradient-to-br from-blue-400/30 to-blue-600/10 dark:border-blue-500/25 dark:from-blue-500/20",
    },
    {
      label: "QR Aktif",
      value: stats.qrAktif,
      icon: QrCode,
      color: "text-violet-700 dark:text-violet-300",
      iconBg:
        "border border-violet-400/40 bg-gradient-to-br from-violet-400/30 to-violet-600/10 dark:border-violet-500/25",
    },
    {
      label: "Belum Generate",
      value: stats.belumGenerate,
      icon: Clock,
      color: "text-slate-600 dark:text-zinc-300",
      iconBg:
        "border border-slate-400/35 bg-gradient-to-br from-slate-400/25 to-slate-600/10 dark:border-zinc-500/20",
    },
    {
      label: "Sudah Download",
      value: stats.sudahDownload,
      icon: Download,
      color: "text-indigo-700 dark:text-indigo-300",
      iconBg:
        "border border-indigo-400/40 bg-gradient-to-br from-indigo-400/30 to-indigo-600/10 dark:border-indigo-500/25",
    },
    {
      label: "Sudah Hadir",
      value: stats.sudahHadir,
      icon: UserCheck,
      color: "text-emerald-700 dark:text-emerald-300",
      iconBg:
        "border border-emerald-400/40 bg-gradient-to-br from-emerald-400/30 to-emerald-600/10 dark:border-emerald-500/25",
    },
    {
      label: "Kuota Tamu",
      value: stats.totalKuotaTamu,
      icon: Users,
      color: "text-orange-700 dark:text-orange-300",
      iconBg:
        "border border-orange-400/40 bg-gradient-to-br from-orange-400/30 to-orange-600/10 dark:border-orange-500/25",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <LiquidGlassCard key={item.label} noEntrance hover={false} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <p className="truncate text-[0.65rem] font-semibold uppercase tracking-wider text-slate-600 dark:text-white/35">
                  {item.label}
                </p>
                <p className="text-xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
                  <span className="bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent dark:hidden">
                    {item.value.toLocaleString("id-ID")}
                  </span>
                  <span className="hidden dark:inline">
                    {item.value.toLocaleString("id-ID")}
                  </span>
                </p>
              </div>
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl backdrop-blur-md",
                  item.iconBg,
                )}
              >
                <Icon className={cn("size-4", item.color)} />
              </div>
            </div>
          </LiquidGlassCard>
        );
      })}
    </div>
  );
}
