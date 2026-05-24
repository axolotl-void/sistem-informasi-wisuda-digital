"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Armchair, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks/use-socket";
import { useScannerStore } from "@/store/scanner.store";
import { ROUTES } from "@/utils/constants";
import {
  GlassChip,
  LiquidGlassCard,
} from "@/components/ui/liquid-glass";

interface BlockSummary {
  id: string;
  name: string;
  total: number;
  checkedIn: number;
  color: string;
  dotColor: string;
}

const FACULTY_COLORS: Record<string, { color: string; dotColor: string }> = {
  "Blok VIP": {
    color: "text-amber-600 dark:text-amber-400",
    dotColor: "bg-amber-500",
  },
  "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)": {
    color: "text-violet-600 dark:text-violet-400",
    dotColor: "bg-violet-500",
  },
  "Fakultas Sains, Teknologi, dan Ilmu Kesehatan (FSTIK)": {
    color: "text-blue-600 dark:text-blue-400",
    dotColor: "bg-blue-500",
  },
};

export function SeatPreview() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<BlockSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useSocket("admin");
  const { isConnected, lastResult } = useScannerStore();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/seats");
      const data = await res.json();
      if (data.success && data.data) {
        const invitations = data.data as {
          mahasiswa?: { nim?: string; fakultas?: string };
          kehadiran?: { statusKehadiran?: string };
        }[];

        const sorted = [...invitations].sort((a, b) =>
          (a.mahasiswa?.nim || "").localeCompare(b.mahasiswa?.nim || ""),
        );

        const vipInvs = sorted.slice(0, 20);
        const regularInvs = sorted.slice(20);

        const facultyGroups: Record<string, typeof invitations> = {};
        regularInvs.forEach((inv) => {
          if (!inv.mahasiswa) return;
          const fac = inv.mahasiswa.fakultas;
          if (!fac) return;
          if (!facultyGroups[fac]) facultyGroups[fac] = [];
          facultyGroups[fac].push(inv);
        });

        const blockList: BlockSummary[] = [];

        const vipCheckedIn = vipInvs.filter(
          (inv) =>
            inv.kehadiran?.statusKehadiran === "HADIR" ||
            inv.kehadiran?.statusKehadiran === "TERLAMBAT",
        ).length;
        const vipColors = FACULTY_COLORS["Blok VIP"];
        blockList.push({
          id: "vip",
          name: "Blok VIP",
          total: vipInvs.length,
          checkedIn: vipCheckedIn,
          ...vipColors,
        });

        const faculties = [
          "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)",
          "Fakultas Sains, Teknologi, dan Ilmu Kesehatan (FSTIK)",
        ];
        faculties.forEach((fac) => {
          const list = facultyGroups[fac] || [];
          const checkedIn = list.filter(
            (inv) =>
              inv.kehadiran?.statusKehadiran === "HADIR" ||
              inv.kehadiran?.statusKehadiran === "TERLAMBAT",
          ).length;
          const colors = FACULTY_COLORS[fac] || {
            color: "text-slate-600 dark:text-white/60",
            dotColor: "bg-slate-400",
          };
          blockList.push({
            id: fac.toLowerCase().replace(/\s+/g, "-"),
            name: fac,
            total: list.length,
            checkedIn,
            ...colors,
          });
        });

        setBlocks(blockList);
      }
    } catch (err) {
      console.error("Gagal mengambil data kursi:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (lastResult && lastResult.success) {
      fetchData();
    }
  }, [lastResult, fetchData]);

  const globalStats = useMemo(() => {
    let total = 0;
    let checkedIn = 0;
    blocks.forEach((b) => {
      total += b.total;
      checkedIn += b.checkedIn;
    });
    const pct = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    return { total, checkedIn, notArrived: total - checkedIn, pct };
  }, [blocks]);

  return (
    <LiquidGlassCard
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="group cursor-pointer p-6"
      onClick={() => router.push(ROUTES.ADMIN.SEAT_MONITORING)}
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/25 to-emerald-600/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            <Armchair className="size-5 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Seat Monitoring
              </h3>
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-bold backdrop-blur-md",
                  isConnected
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "border-red-500/30 bg-red-500/15 text-red-600 dark:text-red-300",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    isConnected
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-red-500",
                  )}
                />
                {isConnected ? "LIVE" : "OFF"}
              </div>
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-white/35">
              Gedung Auditorium Utama
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
          <span className="hidden text-xs font-semibold sm:inline">
            Buka Detail
          </span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <GlassChip className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/30">
            Total Kursi
          </p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-800 dark:text-white/90">
            {loading ? "-" : globalStats.total}
          </p>
        </GlassChip>
        <GlassChip className="border-emerald-500/25 bg-emerald-500/10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/80 dark:text-emerald-300/80">
            Hadir
          </p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
            {loading ? "-" : globalStats.checkedIn}
          </p>
        </GlassChip>
        <GlassChip className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/30">
            Kehadiran
          </p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-800 dark:text-white/90">
            {loading ? "-" : `${globalStats.pct}%`}
          </p>
        </GlassChip>
      </div>

      <div className="mb-5">
        <div className="h-2.5 w-full overflow-hidden rounded-full border border-white/80 bg-white/50 shadow-[inset_0_1px_2px_rgba(15,23,42,0.06)] dark:border-white/[0.06] dark:bg-white/[0.06] dark:shadow-none">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 transition-all duration-700 ease-out"
            style={{ width: `${globalStats.pct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-500 dark:text-white/25">
          <span>{globalStats.checkedIn} terisi</span>
          <span>{globalStats.notArrived} belum hadir</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="size-7 rounded-full border-2 border-slate-200 border-t-emerald-500 animate-spin dark:border-white/10 dark:border-t-emerald-400" />
          <span className="ml-3 text-xs text-slate-500 dark:text-white/30">
            Memuat data kursi...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {blocks.map((block) => {
            const pct =
              block.total > 0
                ? Math.round((block.checkedIn / block.total) * 100)
                : 0;
            return (
              <GlassChip key={block.id} className="p-3 text-center">
                <div className="mb-1.5 flex items-center justify-center gap-1.5">
                  <span
                    className={cn("size-1.5 shrink-0 rounded-full", block.dotColor)}
                  />
                  <span
                    className={cn(
                      "truncate text-[10px] font-bold",
                      block.color,
                    )}
                  >
                    {block.name.replace("Fakultas ", "F. ")}
                  </span>
                </div>
                <p className="text-sm font-bold tabular-nums text-slate-800 dark:text-white/80">
                  {block.checkedIn}
                  <span className="text-slate-400 dark:text-white/30">
                    /{block.total}
                  </span>
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/[0.08]">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      block.id === "vip" ? "bg-amber-500" : "bg-emerald-500",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </GlassChip>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-400/40 bg-white/50 py-3 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md transition-all group-hover:border-emerald-500/50 group-hover:bg-emerald-500/15 group-hover:text-emerald-800 dark:border-white/[0.1] dark:bg-white/[0.02] dark:text-white/35 dark:shadow-none dark:group-hover:text-emerald-300">
        <Armchair className="size-3.5" />
        <span className="text-xs font-semibold">
          Klik untuk melihat denah kursi lengkap
        </span>
        <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
      </div>
    </LiquidGlassCard>
  );
}
