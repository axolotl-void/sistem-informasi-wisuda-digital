"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, Wifi, WifiOff, Armchair, 
  Crown, UserCheck, Users, HelpCircle, 
  Sparkles, CheckCircle2, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SeatModal } from "./seat-modal";
import { useSocket } from "@/hooks/use-socket";
import { useScannerStore } from "@/store/scanner.store";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SeatStatus = "checked-in" | "not-arrived" | "vip" | "empty";

export interface SeatData {
  id: string;
  blockId: string;
  blockName: string;
  row: number;
  col: number;
  seatCode: string;
  status: SeatStatus;
  student?: {
    mahasiswaId: string;
    name: string;
    nim: string;
    faculty: string;
    prodi: string;
    sesi: string;
    invitationNo: string;
    scanTime?: string;
    gate?: string;
  };
}

const BLOCKS_CONFIG = [
  { id: "vip", name: "Blok VIP", color: "text-amber-400 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10" },
  { id: "teknik", name: "Fakultas Teknik", color: "text-blue-400 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10" },
  { id: "ekonomi", name: "Fakultas Ekonomi", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10" },
  { id: "hukum", name: "Fakultas Hukum", color: "text-purple-400 border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10" },
  { id: "kedokteran", name: "Fakultas Kedokteran", color: "text-rose-400 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10" },
  { id: "mipa", name: "Fakultas MIPA", color: "text-sky-400 border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10" },
  { id: "social", name: "Fakultas Ilmu Sosial", color: "text-orange-400 border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10" },
  { id: "pertanian", name: "Fakultas Pertanian", color: "text-green-400 border-green-500/20 bg-green-500/5 hover:bg-green-500/10" },
  { id: "keguruan", name: "Fakultas Keguruan", color: "text-violet-400 border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10" },
];

// ─── Status Config ───────────────────────────────────────────────────────────

const statusConfig: Record<SeatStatus, { bgClass: string; label: string; borderClass: string; textClass: string }> = {
  "checked-in": { 
    bgClass: "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]", 
    borderClass: "border-emerald-400/30",
    textClass: "text-emerald-400",
    label: "Hadir" 
  },
  "not-arrived": { 
    bgClass: "bg-zinc-800/80 hover:bg-zinc-700/80", 
    borderClass: "border-white/[0.05]",
    textClass: "text-zinc-400",
    label: "Belum Hadir" 
  },
  vip: { 
    bgClass: "bg-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]", 
    borderClass: "border-amber-400/25",
    textClass: "text-amber-400",
    label: "VIP" 
  },
  empty: { 
    bgClass: "bg-white/[0.02]", 
    borderClass: "border-white/[0.04] border-dashed",
    textClass: "text-white/10",
    label: "Kosong (Fisik)" 
  },
};

// ─── Seat Mapping logic ──────────────────────────────────────────────────────

function mapInvitationsToSeats(invitations: any[]): SeatData[] {
  const seats: SeatData[] = [];
  
  // Sort invitations by mahasiswa.nim
  const sortedInvs = [...invitations].sort((a, b) => 
    (a.mahasiswa?.nim || "").localeCompare(b.mahasiswa?.nim || "")
  );

  // We designate the first 20 students overall as VIPs
  const vipInvs = sortedInvs.slice(0, 20);
  const regularInvs = sortedInvs.slice(20);

  // Group regular invitations by faculty
  const facultyGroups: Record<string, any[]> = {};
  regularInvs.forEach((inv) => {
    if (!inv.mahasiswa) return;
    const fac = inv.mahasiswa.fakultas;
    if (!facultyGroups[fac]) {
      facultyGroups[fac] = [];
    }
    facultyGroups[fac].push(inv);
  });

  // Helper to map a group of invitations to a block
  const processBlock = (blockId: string, blockName: string, groupInvs: any[], minSeats = 30) => {
    const cols = blockId === "vip" ? 5 : 10;
    const numStudents = groupInvs.length;
    const rows = Math.max(3, Math.ceil(numStudents / cols));
    const totalSeats = rows * cols;

    for (let i = 0; i < totalSeats; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const seatCode = `${String.fromCharCode(65 + row)}${col + 1}`;
      
      const inv = groupInvs[i];
      if (inv && inv.mahasiswa) {
        const isHadir = inv.kehadiran?.statusKehadiran === "HADIR" || inv.kehadiran?.statusKehadiran === "TERLAMBAT";
        
        seats.push({
          id: `${blockId}-${row}-${col}`,
          blockId,
          blockName,
          row,
          col,
          seatCode,
          status: isHadir 
            ? "checked-in" 
            : blockId === "vip" 
              ? "vip" 
              : "not-arrived",
          student: {
            mahasiswaId: inv.mahasiswa.id,
            name: inv.mahasiswa.nama,
            nim: inv.mahasiswa.nim,
            faculty: inv.mahasiswa.fakultas,
            prodi: inv.mahasiswa.prodi,
            sesi: inv.mahasiswa.sesiWisuda || "Sesi Utama",
            invitationNo: inv.kode,
            scanTime: inv.kehadiran 
              ? new Date(inv.kehadiran.waktuScan).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) 
              : undefined,
            gate: inv.kehadiran?.catatan || undefined,
          }
        });
      } else {
        // Empty seat
        seats.push({
          id: `${blockId}-${row}-${col}`,
          blockId,
          blockName,
          row,
          col,
          seatCode,
          status: "empty",
        });
      }
    }
  };

  // Process VIP Block
  processBlock("vip", "Blok VIP", vipInvs, 20);

  // Process each Faculty Block
  const blockMapping = [
    { id: "teknik", name: "Fakultas Teknik", faculty: "Fakultas Teknik" },
    { id: "ekonomi", name: "Fakultas Ekonomi", faculty: "Fakultas Ekonomi" },
    { id: "hukum", name: "Fakultas Hukum", faculty: "Fakultas Hukum" },
    { id: "kedokteran", name: "Fakultas Kedokteran", faculty: "Fakultas Kedokteran" },
    { id: "mipa", name: "Fakultas MIPA", faculty: "Fakultas MIPA" },
    { id: "social", name: "Fakultas Ilmu Sosial", faculty: "Fakultas Ilmu Sosial" },
    { id: "pertanian", name: "Fakultas Pertanian", faculty: "Fakultas Pertanian" },
    { id: "keguruan", name: "Fakultas Keguruan", faculty: "Fakultas Keguruan" },
  ];

  blockMapping.forEach((cfg) => {
    const list = facultyGroups[cfg.faculty] || [];
    processBlock(cfg.id, cfg.name, list, 30);
  });

  return seats;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SeatMonitor() {
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<string>("vip");
  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [recentArrival, setRecentArrival] = useState<{
    name: string;
    nim: string;
    blockName: string;
    seatCode: string;
  } | null>(null);

  // Connect to the socket room "admin"
  const { socket } = useSocket("admin");
  const { isConnected, lastResult } = useScannerStore();

  // Load seats initial data
  const fetchSeats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/seats");
      const data = await res.json();
      if (data.success && data.data) {
        const processed = mapInvitationsToSeats(data.data);
        setSeats(processed);
      }
    } catch (err) {
      console.error("Gagal mengambil data kursi:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats]);

  // Real-time integration through scanner store updates
  useEffect(() => {
    if (lastResult && lastResult.success && lastResult.mahasiswa) {
      const student = lastResult.mahasiswa;
      const scanTime = lastResult.kehadiran 
        ? new Date(lastResult.kehadiran.waktuScan).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) 
        : new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      
      setSeats((prevSeats) => {
        let updated = false;
        const newSeats = prevSeats.map((seat) => {
          if (seat.student && seat.student.mahasiswaId === student.id) {
            updated = true;
            return {
              ...seat,
              status: "checked-in" as const,
              student: {
                ...seat.student,
                scanTime,
                gate: lastResult.kehadiran?.catatan || "Gate Masuk",
              }
            };
          }
          return seat;
        });

        if (updated) {
          const matchedSeat = newSeats.find((s) => s.student?.mahasiswaId === student.id);
          if (matchedSeat) {
            setRecentArrival({
              name: student.nama,
              nim: student.nim,
              blockName: matchedSeat.blockName,
              seatCode: matchedSeat.seatCode,
            });
            // Clear alert banner after 6 seconds
            const timer = setTimeout(() => setRecentArrival(null), 6000);
            return newSeats;
          }
        }
        return prevSeats;
      });
    }
  }, [lastResult]);

  // Compute block statistics
  const blockStats = useMemo(() => {
    const stats: Record<string, { total: number; checkedIn: number; notArrived: number; empty: number }> = {};
    
    // Initialize
    const allBlockIds = ["vip", "teknik", "ekonomi", "hukum", "kedokteran", "mipa", "social", "pertanian", "keguruan"];
    allBlockIds.forEach((id) => {
      stats[id] = { total: 0, checkedIn: 0, notArrived: 0, empty: 0 };
    });

    seats.forEach((seat) => {
      const b = seat.blockId;
      if (!stats[b]) {
        stats[b] = { total: 0, checkedIn: 0, notArrived: 0, empty: 0 };
      }
      
      if (seat.status !== "empty") {
        stats[b].total++;
        if (seat.status === "checked-in") {
          stats[b].checkedIn++;
        } else {
          stats[b].notArrived++;
        }
      } else {
        stats[b].empty++;
      }
    });

    return stats;
  }, [seats]);

  // Compute global active block seats
  const activeBlockSeats = useMemo(() => {
    return seats.filter((s) => s.blockId === selectedBlock);
  }, [seats, selectedBlock]);

  // Group active block seats by row index
  const seatsByRow = useMemo(() => {
    const rows: Record<number, SeatData[]> = {};
    activeBlockSeats.forEach((seat) => {
      if (!rows[seat.row]) {
        rows[seat.row] = [];
      }
      rows[seat.row].push(seat);
    });
    
    return Object.entries(rows)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([_, rowSeats]) => {
        return rowSeats.sort((a, b) => a.col - b.col);
      });
  }, [activeBlockSeats]);

  const activeBlockConfig = useMemo(() => {
    return BLOCKS_CONFIG.find((b) => b.id === selectedBlock);
  }, [selectedBlock]);

  // Compute global summary stats
  const globalSummary = useMemo(() => {
    let totalAssigned = 0;
    let totalCheckedIn = 0;
    
    seats.forEach((s) => {
      if (s.status !== "empty") {
        totalAssigned++;
        if (s.status === "checked-in") totalCheckedIn++;
      }
    });

    return { totalAssigned, totalCheckedIn };
  }, [seats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-xl shadow-2xl overflow-hidden relative"
    >
      {/* Premium Backdrop Glow Effect */}
      <div className="absolute top-0 right-1/4 -z-10 size-64 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 -z-10 size-64 rounded-full bg-blue-500/5 blur-3xl" />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Seat Monitoring
            </h2>
            {/* Live Socket Badge */}
            <div className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition-all duration-300",
              isConnected 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
            )}>
              <span className={cn("size-1.5 rounded-full shrink-0", isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400")} />
              {isConnected ? "LIVE SYNC" : "OFFLINE"}
            </div>
          </div>
          <p className="text-sm font-medium text-white/35 mt-1 leading-relaxed">
            Gedung Auditorium Utama · <span className="text-white/60 font-semibold">{globalSummary.totalCheckedIn} dari {globalSummary.totalAssigned}</span> kursi terisi
          </p>
        </div>

        {/* Legend & Refresh Action */}
        <div className="flex flex-wrap items-center gap-4 lg:gap-6">
          <div className="flex flex-wrap gap-4">
            {(Object.entries(statusConfig) as [SeatStatus, typeof statusConfig[SeatStatus]][]).map(
              ([key, cfg]) => {
                if (key === "empty") return null; // hide physical empty legend
                return (
                  <div key={key} className="flex items-center gap-2">
                    <div className={cn("size-2.5 rounded-md border", cfg.bgClass, cfg.borderClass)} />
                    <span className="text-xs font-semibold text-white/40">{cfg.label}</span>
                  </div>
                );
              }
            )}
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-md border border-amber-400 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]" />
              <span className="text-xs font-semibold text-white/40">VIP Hadir</span>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchSeats}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold text-white/70 transition-all hover:bg-white/[0.08] active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Real-time Scan Announcement Banner */}
      <AnimatePresence>
        {recentArrival && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.06)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <Sparkles className="size-4 animate-bounce" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400/70">Scan QR Code Berhasil</p>
                <p className="text-sm font-semibold text-white mt-0.5">
                  <span className="text-emerald-300">{recentArrival.name}</span> ({recentArrival.nim}) telah menempati kursi <span className="font-bold text-emerald-400">{recentArrival.blockName} {recentArrival.seatCode}</span>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-emerald-400">
              <CheckCircle2 className="size-3" /> Real-time
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glassmorphic Block Selector Pills (Scrollable) */}
      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1.5">
        {BLOCKS_CONFIG.map((b) => {
          const stats = blockStats[b.id] || { total: 0, checkedIn: 0 };
          const isSelected = selectedBlock === b.id;
          const pct = stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0;

          return (
            <button
              key={b.id}
              onClick={() => setSelectedBlock(b.id)}
              className={cn(
                "flex flex-col items-start gap-1 shrink-0 rounded-2xl border px-4 py-3 text-left transition-all duration-300 cursor-pointer min-w-[130px]",
                isSelected
                  ? "bg-white/[0.08] border-white/20 text-white shadow-lg"
                  : "bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.04]"
              )}
            >
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="text-xs font-bold tracking-tight">{b.name}</span>
                <span className={cn(
                  "size-1.5 rounded-full shrink-0",
                  b.id === "vip" ? "bg-amber-400" : "bg-blue-400"
                )} />
              </div>
              <div className="mt-1 flex items-end justify-between w-full">
                <p className="text-[11px] font-semibold text-white/40">
                  {stats.checkedIn}/{stats.total} Kursi
                </p>
                <p className={cn(
                  "text-xs font-bold",
                  isSelected ? "text-emerald-400" : "text-white/60"
                )}>
                  {pct}%
                </p>
              </div>
              {/* Mini progress bar inside the pill */}
              <div className="h-1 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", b.id === "vip" ? "bg-amber-400" : "bg-emerald-500")}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Grid View Area */}
      <div className="relative rounded-2xl border border-white/[0.06] bg-black/25 p-6 backdrop-blur-md overflow-hidden">
        {/* Glowing Background Stage Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent blur-[2px]" />

        {/* Stage Title */}
        <div className="mx-auto mb-8 max-w-lg">
          <div className="bg-gradient-to-r from-transparent via-white/[0.06] to-transparent border-t border-b border-white/[0.04] py-3 text-center text-xs font-bold tracking-[0.3em] text-white/40 uppercase shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-lg">
            PANGGUNG UTAMA / AULA DEPAN
          </div>
          <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.15em] mt-1.5">
            Blok Aktif: {activeBlockConfig?.name}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="size-9 rounded-full border-2 border-white/10 border-t-emerald-400 animate-spin" />
            <p className="text-xs text-white/30 font-medium mt-3.5">Sinkronisasi denah kursi...</p>
          </div>
        ) : activeBlockSeats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/[0.06] rounded-xl bg-white/[0.01]">
            <AlertCircle className="size-8 text-white/15 mb-3" />
            <p className="text-sm font-semibold text-white/40">Tidak ada kursi dialokasikan</p>
            <p className="text-xs text-white/20 mt-1 max-w-[280px] text-center leading-relaxed">
              Mahasiswa belum digenerate undangan, atau semua mahasiswa berada di blok lain.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="mx-auto flex flex-col items-center justify-center" style={{ minWidth: selectedBlock === "vip" ? 300 : 700 }}>
              {seatsByRow.map((rowSeats, rowIndex) => (
                <div key={rowIndex} className="flex items-center gap-1.5 mb-1.5 justify-center">
                  {/* Row Letter Indicator (Left) */}
                  <span className="w-6 text-right text-[11px] font-mono font-bold text-white/20 select-none mr-2">
                    {String.fromCharCode(65 + rowIndex)}
                  </span>

                  {/* Seat Cells */}
                  {rowSeats.map((seat) => {
                    const cfg = statusConfig[seat.status];
                    const isHovered = hoveredId === seat.id;
                    const isVipBlock = seat.blockId === "vip";
                    const isHadir = seat.status === "checked-in";

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        onMouseEnter={() => seat.status !== "empty" && setHoveredId(seat.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => seat.status !== "empty" && setSelectedSeat(seat)}
                        className={cn(
                          "relative size-6.5 rounded-md transition-all duration-200 cursor-default flex items-center justify-center border",
                          cfg.bgClass,
                          cfg.borderClass,
                          seat.status !== "empty" && "cursor-pointer active:scale-90 hover:ring-1 hover:ring-white/20 hover:scale-115 hover:z-10",
                          // Special styling for checked-in VIP
                          isVipBlock && isHadir && "border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.3),_0_0_8px_rgba(16,185,129,0.3)] bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500"
                        )}
                        aria-label={`Kursi ${seat.blockName} ${seat.seatCode} - ${cfg.label}`}
                      >
                        {/* Dot in center */}
                        {seat.status !== "empty" ? (
                          isVipBlock ? (
                            <Crown className={cn(
                              "size-2.5", 
                              isHadir ? "text-amber-300 animate-pulse" : "text-amber-400/80"
                            )} />
                          ) : (
                            <div className={cn(
                              "size-1.5 rounded-full",
                              isHadir ? "bg-white" : "bg-white/25"
                            )} />
                          )
                        ) : null}

                        {/* Beautiful Floating Interactive Tooltip */}
                        <AnimatePresence>
                          {isHovered && seat.status !== "empty" && seat.student && (
                            <motion.div
                              initial={{ opacity: 0, y: 6, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute -top-[82px] left-1/2 -translate-x-1/2 z-50 whitespace-nowrap rounded-xl bg-[#090D16]/95 border border-white/[0.1] px-3.5 py-2.5 shadow-2xl pointer-events-none text-left backdrop-blur-md"
                            >
                              <div className="flex items-center gap-2">
                                {isHadir ? (
                                  <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                                ) : (
                                  <div className="size-2 rounded-full bg-zinc-500" />
                                )}
                                <p className="text-xs font-bold text-white tracking-tight">
                                  {seat.student.name}
                                </p>
                              </div>
                              <p className="text-[10px] font-semibold text-white/40 mt-1">
                                NIM: {seat.student.nim}
                              </p>
                              <p className="text-[10px] font-semibold text-white/30">
                                Prodi: {seat.student.prodi}
                              </p>
                              
                              <div className="mt-1.5 border-t border-white/[0.06] pt-1 flex items-center justify-between gap-4">
                                <span className="text-[9px] font-bold text-white/35 uppercase">
                                  Kursi {seat.seatCode}
                                </span>
                                <span className={cn(
                                  "text-[10px] font-bold",
                                  isHadir ? "text-emerald-400" : isVipBlock ? "text-amber-400" : "text-zinc-500"
                                )}>
                                  {isHadir ? `Hadir · ${seat.student.scanTime}` : isVipBlock ? "VIP Belum Hadir" : "Belum Hadir"}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    );
                  })}

                  {/* Row Letter Indicator (Right) */}
                  <span className="w-6 text-left text-[11px] font-mono font-bold text-white/20 select-none ml-2">
                    {String.fromCharCode(65 + rowIndex)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <SeatModal seat={selectedSeat} onClose={() => setSelectedSeat(null)} />
    </motion.div>
  );
}
