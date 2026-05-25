"use client";

import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassChip, LiquidGlassCard } from "@/components/ui/liquid-glass";

interface Activity {
  id: string;
  time: string;
  name: string;
  seat: string;
  gate: string;
  status: "success" | "failed" | "pending";
}

const activities: Activity[] = [
  { id: "1", time: "09:45:12", name: "Ahmad Pratama", seat: "A-5", gate: "Gate 1", status: "success" },
  { id: "2", time: "09:44:58", name: "Siti Lestari", seat: "B-12", gate: "Gate 2", status: "success" },
  { id: "3", time: "09:44:30", name: "Budi Hidayat", seat: "C-8", gate: "Gate 1", status: "failed" },
  { id: "4", time: "09:43:55", name: "Rina Wati", seat: "D-22", gate: "Gate 3", status: "success" },
  { id: "5", time: "09:43:20", name: "Dimas Nugroho", seat: "E-15", gate: "Gate 2", status: "success" },
  { id: "6", time: "09:42:45", name: "Putri Sari", seat: "F-3", gate: "Gate 4", status: "pending" },
  { id: "7", time: "09:42:10", name: "Rizky Ramadhan", seat: "G-18", gate: "Gate 1", status: "success" },
  { id: "8", time: "09:41:30", name: "Ayu Utami", seat: "H-10", gate: "Gate 3", status: "success" },
];

const statusConfig = {
  success: {
    icon: CheckCircle2,
    text: "Berhasil",
    chip: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/12 border-emerald-500/25",
  },
  failed: {
    icon: XCircle,
    text: "Gagal",
    chip: "text-red-700 dark:text-red-300",
    bg: "bg-red-500/12 border-red-500/25",
  },
  pending: {
    icon: Clock,
    text: "Menunggu",
    chip: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-500/12 border-amber-500/25",
  },
};

export function ActivityTable() {
  return (
    <LiquidGlassCard noEntrance hover={false} className="p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Aktivitas Terkini
        </h2>
        <p className="text-sm font-medium text-slate-500 dark:text-white/35">
          Log scan kehadiran realtime
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/80 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl dark:border-white/[0.06] dark:bg-white/[0.02] dark:shadow-none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200/80 bg-white/30 dark:border-white/[0.08] dark:bg-transparent">
              {["Waktu", "Nama", "Kursi", "Gate", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/30"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => {
              const cfg = statusConfig[a.status];
              const Icon = cfg.icon;
              return (
                <tr
                  key={a.id}
                  className="border-t border-slate-200/60 transition-colors hover:bg-white/55 dark:border-white/[0.05] dark:hover:bg-white/[0.04]"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-white/45">
                      {a.time}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-800 dark:text-white/85">
                      {a.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <GlassChip className="inline-block px-2 py-0.5">
                      <span className="font-mono text-xs text-slate-600 dark:text-white/55">
                        {a.seat}
                      </span>
                    </GlassChip>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-white/40">
                    {a.gate}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold backdrop-blur-md",
                        cfg.bg,
                        cfg.chip,
                      )}
                    >
                      <Icon className="size-3.5" />
                      {cfg.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </LiquidGlassCard>
  );
}
