"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Armchair, Crown, UserCheck, Users,
  ArrowRight, Wifi, WifiOff, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks/use-socket";
import { useScannerStore } from "@/store/scanner.store";
import { ROUTES } from "@/utils/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlockSummary {
  id: string;
  name: string;
  total: number;
  checkedIn: number;
  color: string;
  dotColor: string;
}

const FACULTY_COLORS: Record<string, { color: string; dotColor: string }> = {
  "Blok VIP":                                              { color: "text-amber-400",   dotColor: "bg-amber-400" },
  "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)":          { color: "text-violet-400",  dotColor: "bg-violet-400" },
  "Fakultas Sains, Teknologi, dan Ilmu Kesehatan (FSTIK)": { color: "text-blue-400",    dotColor: "bg-blue-400" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SeatPreview() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<BlockSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Connect to the socket room "admin"
  const { socket } = useSocket("admin");
  const { isConnected, lastResult } = useScannerStore();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/seats");
      const data = await res.json();
      if (data.success && data.data) {
        const invitations = data.data as any[];

        // Sort by NIM
        const sorted = [...invitations].sort((a, b) =>
          (a.mahasiswa?.nim || "").localeCompare(b.mahasiswa?.nim || "")
        );

        const vipInvs = sorted.slice(0, 20);
        const regularInvs = sorted.slice(20);

        // Group regular by faculty
        const facultyGroups: Record<string, any[]> = {};
        regularInvs.forEach((inv) => {
          if (!inv.mahasiswa) return;
          const fac = inv.mahasiswa.fakultas;
          if (!facultyGroups[fac]) facultyGroups[fac] = [];
          facultyGroups[fac].push(inv);
        });

        const blockList: BlockSummary[] = [];

        // VIP block
        const vipCheckedIn = vipInvs.filter(
          (inv) => inv.kehadiran?.statusKehadiran === "HADIR" || inv.kehadiran?.statusKehadiran === "TERLAMBAT"
        ).length;
        const vipColors = FACULTY_COLORS["Blok VIP"] || { color: "text-amber-400", dotColor: "bg-amber-400" };
        blockList.push({
          id: "vip",
          name: "Blok VIP",
          total: vipInvs.length,
          checkedIn: vipCheckedIn,
          ...vipColors,
        });

        // Faculty blocks
        const faculties = [
          "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)",
          "Fakultas Sains, Teknologi, dan Ilmu Kesehatan (FSTIK)",
        ];
        faculties.forEach((fac) => {
          const list = facultyGroups[fac] || [];
          const checkedIn = list.filter(
            (inv) => inv.kehadiran?.statusKehadiran === "HADIR" || inv.kehadiran?.statusKehadiran === "TERLAMBAT"
          ).length;
          const colors = FACULTY_COLORS[fac] || { color: "text-white/60", dotColor: "bg-white/40" };
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

  // Real-time: refetch on scan
  useEffect(() => {
    if (lastResult && lastResult.success) {
      fetchData();
    }
  }, [lastResult, fetchData]);

  // Global stats
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-xl shadow-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.06]"
      onClick={() => router.push(ROUTES.ADMIN.SEAT_MONITORING)}
    >
      {/* Backdrop glow */}
      <div className="absolute top-0 right-1/4 -z-10 size-48 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 -z-10 size-48 rounded-full bg-blue-500/5 blur-3xl" />

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20">
            <Armchair className="size-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight text-white">
                Seat Monitoring
              </h3>
              {/* Live badge */}
              <div className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold border",
                isConnected
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              )}>
                <span className={cn("size-1.5 rounded-full shrink-0", isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400")} />
                {isConnected ? "LIVE" : "OFF"}
              </div>
            </div>
            <p className="text-xs font-medium text-white/30 mt-0.5">
              Gedung Auditorium Utama
            </p>
          </div>
        </div>

        {/* Arrow CTA */}
        <div className="flex items-center gap-2 text-white/30 group-hover:text-emerald-400 transition-colors duration-300">
          <span className="text-xs font-semibold hidden sm:inline">Buka Detail</span>
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>

      {/* Global Summary Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/25">Total Kursi</p>
          <p className="text-xl font-bold text-white/80 tabular-nums mt-0.5">
            {loading ? "—" : globalStats.total}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] px-4 py-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/40">Hadir</p>
          <p className="text-xl font-bold text-emerald-400 tabular-nums mt-0.5">
            {loading ? "—" : globalStats.checkedIn}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/25">Kehadiran</p>
          <p className="text-xl font-bold text-white/80 tabular-nums mt-0.5">
            {loading ? "—" : `${globalStats.pct}%`}
          </p>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-5">
        <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${globalStats.pct}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] font-semibold text-white/20">{globalStats.checkedIn} terisi</span>
          <span className="text-[10px] font-semibold text-white/20">{globalStats.notArrived} belum hadir</span>
        </div>
      </div>

      {/* Block Pills Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="size-6 rounded-full border-2 border-white/10 border-t-emerald-400 animate-spin" />
          <span className="text-xs text-white/25 ml-3">Memuat data kursi...</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {blocks.map((block) => {
            const pct = block.total > 0 ? Math.round((block.checkedIn / block.total) * 100) : 0;
            return (
              <div
                key={block.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center transition-all hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  <span className={cn("size-1.5 rounded-full shrink-0", block.dotColor)} />
                  <span className={cn("text-[10px] font-bold truncate", block.color)}>
                    {block.name.replace("Fakultas ", "F. ")}
                  </span>
                </div>
                <p className="text-sm font-bold text-white/70 tabular-nums">
                  {block.checkedIn}<span className="text-white/25">/{block.total}</span>
                </p>
                {/* Mini progress */}
                <div className="mt-1.5 h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", block.id === "vip" ? "bg-amber-400" : "bg-emerald-500")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] py-2.5 text-white/30 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/[0.03] group-hover:text-emerald-400 transition-all duration-300">
        <Armchair className="size-3.5" />
        <span className="text-xs font-semibold">Klik untuk melihat denah kursi lengkap</span>
        <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
      </div>
    </motion.div>
  );
}
