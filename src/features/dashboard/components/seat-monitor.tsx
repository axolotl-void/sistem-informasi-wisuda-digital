"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, Crown, HelpCircle, 
  Sparkles, CheckCircle2, Info, Maximize2
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

// ─── Block Configuration ─────────────────────────────────────────────────────
// 4 blocks positioned flat (2D) over the background image.
// Coordinates are tuned to align with the neon outlines in Ruangan-wisuda.png.

const BLOCKS_CONFIG = [
  { 
    id: "yellow", 
    name: "Blok Kuning", 
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-950/10",
    hoverShadow: "hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]", 
    textColor: "text-amber-400",
    position: { top: "36%", left: "6%", width: "22%", height: "28%" },
    rowsLayout: [5, 6, 6, 7, 7, 8],
  },
  { 
    id: "cyan", 
    name: "Blok Biru", 
    borderColor: "border-cyan-500/30",
    bgColor: "bg-cyan-950/10",
    hoverShadow: "hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]", 
    textColor: "text-cyan-400",
    position: { top: "39%", left: "29%", width: "20%", height: "30%" },
    rowsLayout: [7, 7, 7, 7, 8, 8, 8],
  },
  { 
    id: "purple", 
    name: "Blok Ungu", 
    borderColor: "border-fuchsia-500/30",
    bgColor: "bg-fuchsia-950/10",
    hoverShadow: "hover:shadow-[0_0_25px_rgba(217,70,239,0.2)]", 
    textColor: "text-fuchsia-400",
    position: { top: "39%", left: "51%", width: "20%", height: "30%" },
    rowsLayout: [7, 7, 7, 7, 8, 8, 8],
  },
  { 
    id: "green", 
    name: "Blok Hijau", 
    borderColor: "border-lime-400/30",
    bgColor: "bg-emerald-950/10",
    hoverShadow: "hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]", 
    textColor: "text-lime-400",
    position: { top: "36%", left: "72%", width: "22%", height: "28%" },
    rowsLayout: [5, 6, 6, 7, 7, 8],
  },
];

// ─── Status Styles ───────────────────────────────────────────────────────────
// Use CSS filter to tint the kursi.png image per status.
// The image is a dark outline on transparent bg, so we use
// brightness + invert + sepia + hue-rotate + saturate to colorize it.

const statusConfig: Record<SeatStatus, {
  label: string;
  textClass: string;
  // CSS filter chain applied to the <img> element
  filter: string;
  // Glow drop-shadow color
  glowClass: string;
}> = {
  "checked-in": {
    label: "Hadir",
    textClass: "text-emerald-400",
    filter: "brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(100deg)",
    glowClass: "drop-shadow-[0_0_6px_rgba(16,185,129,0.9)]",
  },
  "not-arrived": {
    label: "Dipesan",
    textClass: "text-blue-400",
    filter: "brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(190deg)",
    glowClass: "drop-shadow-[0_0_6px_rgba(59,130,246,0.9)]",
  },
  "vip": {
    label: "Hadir (VIP)",
    textClass: "text-red-400",
    filter: "brightness(0) invert(1) sepia(1) saturate(8) hue-rotate(330deg)",
    glowClass: "drop-shadow-[0_0_8px_rgba(239,68,68,0.95)]",
  },
  "empty": {
    label: "Kosong / Tersedia",
    textClass: "text-gray-400",
    filter: "brightness(0) invert(1) opacity(0.2)",
    glowClass: "",
  },
};

// ─── Seat Mapping ────────────────────────────────────────────────────────────

function mapInvitationsToSeats(invitations: any[]): SeatData[] {
  const seats: SeatData[] = [];

  const sortedInvs = [...invitations].sort((a, b) =>
    (a.mahasiswa?.nim || "").localeCompare(b.mahasiswa?.nim || "")
  );

  const numStudents = sortedInvs.length;

  // Calculate total capacity per block from rowsLayout
  const blockCapacities = BLOCKS_CONFIG.map((b) =>
    b.rowsLayout.reduce((sum, cols) => sum + cols, 0)
  );
  const totalCapacity = blockCapacities.reduce((a, b) => a + b, 0);

  // Distribute students proportionally
  let allocated = 0;
  const groups: Record<string, any[]> = {};
  BLOCKS_CONFIG.forEach((block, idx) => {
    const cap = blockCapacities[idx];
    const count =
      idx === BLOCKS_CONFIG.length - 1
        ? numStudents - allocated
        : Math.round((cap / totalCapacity) * numStudents);
    groups[block.id] = sortedInvs.slice(allocated, allocated + count);
    allocated += count;
  });

  const processBlock = (blockId: string, blockName: string, groupInvs: any[]) => {
    const config = BLOCKS_CONFIG.find((b) => b.id === blockId);
    if (!config) return;

    let studentIndex = 0;

    config.rowsLayout.forEach((colsInRow, row) => {
      for (let col = 0; col < colsInRow; col++) {
        const seatCode = `${String.fromCharCode(65 + row)}${col + 1}`;
        const inv = groupInvs[studentIndex];

        if (inv && inv.mahasiswa) {
          const isHadir =
            inv.kehadiran?.statusKehadiran === "HADIR" ||
            inv.kehadiran?.statusKehadiran === "TERLAMBAT";

          let seatStatus: SeatStatus = "empty";
          if (isHadir) {
            seatStatus = row === 0 ? "vip" : "checked-in";
          } else {
            seatStatus = "not-arrived";
          }

          seats.push({
            id: `${blockId}-${row}-${col}`,
            blockId,
            blockName,
            row,
            col,
            seatCode,
            status: seatStatus,
            student: {
              mahasiswaId: inv.mahasiswa.id,
              name: inv.mahasiswa.nama,
              nim: inv.mahasiswa.nim,
              faculty: inv.mahasiswa.fakultas,
              prodi: inv.mahasiswa.prodi,
              sesi: inv.mahasiswa.sesiWisuda || "Sesi Utama",
              invitationNo: inv.kode,
              scanTime: inv.kehadiran
                ? new Date(inv.kehadiran.waktuScan).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : undefined,
              gate: inv.kehadiran?.catatan || undefined,
            },
          });
          studentIndex++;
        } else {
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
    });
  };

  BLOCKS_CONFIG.forEach((block) => {
    processBlock(block.id, block.name, groups[block.id]);
  });

  return seats;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SeatMonitor() {
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [recentArrival, setRecentArrival] = useState<{
    name: string;
    nim: string;
    blockName: string;
    seatCode: string;
  } | null>(null);

  const { socket } = useSocket("admin");
  const { isConnected, lastResult } = useScannerStore();

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

  // Real-time updates from scanner
  useEffect(() => {
    if (lastResult && lastResult.success && lastResult.mahasiswa) {
      const student = lastResult.mahasiswa;
      const scanTime = lastResult.kehadiran
        ? new Date(lastResult.kehadiran.waktuScan).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          });

      setSeats((prevSeats) => {
        let updated = false;
        const newSeats = prevSeats.map((seat) => {
          if (seat.student && seat.student.mahasiswaId === student.id) {
            updated = true;
            return {
              ...seat,
              status: seat.row === 0 ? ("vip" as const) : ("checked-in" as const),
              student: {
                ...seat.student,
                scanTime,
                gate: lastResult.kehadiran?.catatan || "Gate Masuk",
              },
            };
          }
          return seat;
        });

        if (updated) {
          const matchedSeat = newSeats.find(
            (s) => s.student?.mahasiswaId === student.id
          );
          if (matchedSeat) {
            setRecentArrival({
              name: student.nama,
              nim: student.nim,
              blockName: matchedSeat.blockName,
              seatCode: matchedSeat.seatCode,
            });
            setTimeout(() => setRecentArrival(null), 6000);
            return newSeats;
          }
        }
        return prevSeats;
      });
    }
  }, [lastResult]);

  // Group seats by block
  const seatsByBlock = useMemo(() => {
    const grouped: Record<string, SeatData[]> = {};
    BLOCKS_CONFIG.forEach((b) => (grouped[b.id] = []));
    seats.forEach((seat) => {
      if (grouped[seat.blockId]) grouped[seat.blockId].push(seat);
    });
    return grouped;
  }, [seats]);

  // Stats
  const statsSummary = useMemo(() => {
    let totalAssigned = 0;
    let totalCheckedIn = 0;

    seats.forEach((s) => {
      if (s.student) {
        totalAssigned++;
        if (s.status === "checked-in" || s.status === "vip") totalCheckedIn++;
      }
    });

    return { totalAssigned, totalCheckedIn };
  }, [seats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="rounded-3xl border border-white/[0.08] bg-[#070A13]/85 p-6 backdrop-blur-xl shadow-2xl overflow-hidden relative"
    >
      {/* Ambient glow */}
      <div className="absolute -top-40 left-1/3 -z-10 size-[500px] rounded-full bg-violet-600/10 blur-[120px] animate-pulse" />
      <div className="absolute -bottom-40 right-1/4 -z-10 size-[450px] rounded-full bg-blue-600/5 blur-[120px]" />

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Auditorium Seat Monitor{" "}
              <span className="text-xs bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent font-bold font-mono">
                LIVE
              </span>
            </h2>
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition-all duration-300",
                isConnected
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full shrink-0",
                  isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                )}
              />
              {isConnected ? "LIVE SYNC" : "OFFLINE"}
            </div>
          </div>
          <p className="text-sm font-semibold text-white/40 mt-1 leading-relaxed">
            Layout Auditorium Utama ·{" "}
            <span className="text-white font-bold">
              {statsSummary.totalCheckedIn}
            </span>{" "}
            hadir dari{" "}
            <span className="text-white font-bold">
              {statsSummary.totalAssigned}
            </span>{" "}
            terdaftar
          </p>
        </div>

        {/* Legend & Refresh */}
        <div className="flex flex-wrap items-center gap-4 lg:gap-6">
          <div className="flex flex-wrap gap-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl px-4 py-2.5 backdrop-blur-md">
            {(
              Object.entries(statusConfig) as [
                SeatStatus,
                (typeof statusConfig)[SeatStatus],
              ][]
            ).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-2">
                {/* Mini chair preview in legend */}
                <img
                  src="/img/kursi.png"
                  alt=""
                  className={cn("size-4 object-contain", cfg.glowClass)}
                  style={{ filter: cfg.filter }}
                  draggable={false}
                />
                <span className="text-[11px] font-bold text-white/50">
                  {cfg.label}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchSeats}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-white/80 transition-all hover:bg-white/[0.08] active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            Sync Map
          </button>
        </div>
      </div>

      {/* ── Scan Alert Banner ─────────────────────────────────────── */}
      <AnimatePresence>
        {recentArrival && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Sparkles className="size-5 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Scan QR Code Berhasil
                </p>
                <p className="text-sm font-semibold text-white mt-0.5">
                  <span className="text-emerald-300 font-bold">
                    {recentArrival.name}
                  </span>{" "}
                  ({recentArrival.nim}) menempati kursi{" "}
                  <span className="font-extrabold text-emerald-400">
                    {recentArrival.blockName} {recentArrival.seatCode}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-emerald-400">
              <CheckCircle2 className="size-3.5" /> Real-time
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Seat Map ─────────────────────────────────────────── */}
      <div className="relative w-full border border-white/[0.08] bg-black/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Stage gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 via-blue-500 to-emerald-500 blur-[1px]" />

        {/* 4:3 canvas matching the Ruangan-wisuda.png proportions */}
        <div className="relative w-full h-0 pb-[75%] overflow-hidden select-none">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-95"
            style={{
              backgroundImage: "url('/img/Ruangan-wisuda.png')",
            }}
          />

          {/* ── 4 Seat Blocks (Flat 2D, no skew) ──────────────────── */}
          {BLOCKS_CONFIG.map((block) => {
            const blockSeats = seatsByBlock[block.id] || [];

            // Split seats into rows based on rowsLayout
            let cursor = 0;
            const seatsByRow = block.rowsLayout.map((colsInRow) => {
              const rowSeats = blockSeats.slice(cursor, cursor + colsInRow);
              cursor += colsInRow;
              return rowSeats;
            });

            return (
              <div
                key={block.id}
                className={cn(
                  "absolute rounded-xl border p-2 transition-all duration-500 flex flex-col group overflow-visible",
                  block.borderColor,
                  block.bgColor,
                  block.hoverShadow,
                  "backdrop-blur-[1px]"
                )}
                style={{
                  top: block.position.top,
                  left: block.position.left,
                  width: block.position.width,
                  height: block.position.height,
                }}
              >
                {/* Block label */}
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/[0.04]">
                  <span
                    className={cn(
                      "text-[9px] md:text-[11px] font-black uppercase tracking-widest leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]",
                      block.textColor
                    )}
                  >
                    {block.name}
                  </span>
                  <span className="text-[8px] font-bold text-white/25 tabular-nums">
                    {blockSeats.filter((s) => s.student).length}/{blockSeats.length}
                  </span>
                </div>

                {/* Staggered rows of chair images */}
                <div className="flex-1 flex flex-col justify-around gap-[2px] overflow-visible">
                  {seatsByRow.map((rowSeats, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="flex flex-row justify-center items-center gap-[2px] sm:gap-1 overflow-visible"
                    >
                      {rowSeats.map((seat) => {
                        const cfg = statusConfig[seat.status];
                        const isHovered = hoveredId === seat.id;
                        const isHadir =
                          seat.status === "checked-in" || seat.status === "vip";
                        const hasStudent = !!seat.student;

                        return (
                          <button
                            key={seat.id}
                            type="button"
                            onMouseEnter={() =>
                              hasStudent && setHoveredId(seat.id)
                            }
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => setSelectedSeat(seat)}
                            className={cn(
                              "relative flex items-center justify-center bg-transparent border-none outline-none transition-all duration-300 overflow-visible",
                              "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8",
                              hasStudent
                                ? "cursor-pointer hover:-translate-y-0.5 hover:scale-125 hover:z-50"
                                : "cursor-pointer hover:opacity-60"
                            )}
                            aria-label={`Kursi ${seat.blockName} ${seat.seatCode}`}
                          >
                            {/* Chair image with color filter */}
                            <img
                              src="/img/kursi.png"
                              alt={seat.seatCode}
                              draggable={false}
                              className={cn(
                                "w-full h-full object-contain transition-all duration-300 pointer-events-none",
                                cfg.glowClass,
                                seat.status === "vip" && "animate-pulse"
                              )}
                              style={{ filter: cfg.filter }}
                            />

                            {/* Tiny active indicator dot */}
                            {isHadir && (
                              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 size-1 sm:size-1.5 rounded-full bg-emerald-400 animate-pulse border border-black/50" />
                            )}

                            {/* Hover Tooltip */}
                            <AnimatePresence>
                              {isHovered && hasStudent && seat.student && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute -top-[95px] left-1/2 -translate-x-1/2 z-[100] whitespace-nowrap rounded-2xl bg-[#090D16]/98 border border-white/[0.1] p-3 shadow-[0_15px_35px_rgba(0,0,0,0.85)] pointer-events-none text-left backdrop-blur-md"
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={cn(
                                        "size-2 rounded-full shrink-0",
                                        isHadir
                                          ? "bg-emerald-400 animate-pulse"
                                          : "bg-zinc-500"
                                      )}
                                    />
                                    <p className="text-[11px] font-extrabold text-white tracking-tight leading-none">
                                      {seat.student.name}
                                    </p>
                                  </div>
                                  <p className="text-[9px] font-bold text-white/40 mt-1">
                                    NIM: {seat.student.nim}
                                  </p>
                                  <p className="text-[9px] font-bold text-white/30">
                                    Prodi: {seat.student.prodi}
                                  </p>

                                  <div className="mt-1.5 border-t border-white/[0.06] pt-1 flex items-center justify-between gap-4">
                                    <span className="text-[9px] font-black text-white/45 tracking-widest uppercase">
                                      {seat.seatCode}
                                    </span>
                                    <span
                                      className={cn(
                                        "text-[9px] font-black tracking-wide",
                                        isHadir
                                          ? "text-emerald-400"
                                          : "text-blue-400"
                                      )}
                                    >
                                      {isHadir
                                        ? `HADIR · ${seat.student.scanTime}`
                                        : "BELUM HADIR"}
                                    </span>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Info Panel */}
          <div className="absolute bottom-6 left-6 rounded-2xl border border-white/[0.06] bg-black/85 px-4 py-3 backdrop-blur-md flex flex-col gap-1 shadow-2xl max-w-[240px] pointer-events-none select-none">
            <div className="flex items-center gap-1.5">
              <Info className="size-3.5 text-violet-400" />
              <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">
                Petunjuk Navigasi
              </span>
            </div>
            <p className="text-[9px] text-white/45 font-medium leading-relaxed mt-1">
              • Arahkan kursor untuk melihat info wisudawan.
              <br />
              • Baris terdepan (Baris A) merupakan baris VIP.
              <br />• Klik pada ikon kursi untuk detail lengkap.
            </p>
          </div>
        </div>
      </div>

      {/* Seat Detail Modal */}
      <SeatModal seat={selectedSeat} onClose={() => setSelectedSeat(null)} />
    </motion.div>
  );
}
