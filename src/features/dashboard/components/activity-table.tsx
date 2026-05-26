"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassChip, LiquidGlassCard } from "@/components/ui/liquid-glass";
import { fetchWithAuth } from "@/lib/client-auth";
import { useSocket } from "@/hooks/use-socket";
import { useScannerStore } from "@/store/scanner.store";
import type { DashboardActivityItem } from "@/types/dashboard.type";

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
  const [activities, setActivities] = useState<DashboardActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useSocket("admin");
  const { lastResult } = useScannerStore();

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/api/dashboard/activity?limit=10");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setActivities(json.data as DashboardActivityItem[]);
      }
    } catch (err) {
      console.error("Gagal memuat aktivitas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    if (lastResult?.success) {
      void fetchActivities();
    }
  }, [lastResult, fetchActivities]);

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

      <div className="overflow-x-auto rounded-2xl border border-white/80 bg-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-white/[0.06] dark:bg-white/[0.04] dark:shadow-none">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500 dark:text-white/35">
            <Loader2 className="size-5 animate-spin" />
            Memuat aktivitas…
          </div>
        ) : activities.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500 dark:text-white/35">
            Belum ada aktivitas scan. Data akan muncul setelah wisudawan discan di gate.
          </div>
        ) : (
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
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
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
        )}
      </div>
    </LiquidGlassCard>
  );
}
