"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
   RefreshCw, Crown, HelpCircle, 
   Sparkles, CheckCircle2, Info, Maximize2,
   Armchair
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SeatModal } from "./seat-modal";
import { useSocket } from "@/hooks/use-socket";
import { useScannerStore } from "@/store/scanner.store";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";

// --- Types --------------------------------------------------------------------

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

// --- Block Configuration -----------------------------------------------------
// 4 blocks positioned flat (2D) over the background image.
// Coordinates are tuned to align with the neon outlines in Ruangan-wisuda.png.
// rowsLayout dihitung dinamis dari kapasitas yang dikonfigurasi di Pengaturan.

// Helper: distribusi kursi ke baris secara merata
function buildRowsLayout(totalSeats: number): number[] {
  if (totalSeats <= 0) return [];
  // Target ~7 kursi per baris, maks 10
  const seatsPerRow = Math.min(10, Math.max(5, Math.round(totalSeats / Math.ceil(totalSeats / 8))));
  const rows: number[] = [];
  let remaining = totalSeats;
  while (remaining > 0) {
    const count = Math.min(seatsPerRow, remaining);
    rows.push(count);
    remaining -= count;
  }
  return rows;
}

// Default kapasitas per blok (fallback jika belum dikonfigurasi)
const DEFAULT_BLOK_KAPASITAS = { kuning: 39, biru: 52, ungu: 52, hijau: 39 };

function getBlokKapasitas() {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("wisuda_blok_kursi") : null;
    if (raw) {
      const parsed = JSON.parse(raw) as typeof DEFAULT_BLOK_KAPASITAS;
      return {
        kuning: parsed.kuning ?? DEFAULT_BLOK_KAPASITAS.kuning,
        biru: parsed.biru ?? DEFAULT_BLOK_KAPASITAS.biru,
        ungu: parsed.ungu ?? DEFAULT_BLOK_KAPASITAS.ungu,
        hijau: parsed.hijau ?? DEFAULT_BLOK_KAPASITAS.hijau,
      };
    }
  } catch { /* ignore */ }
  return DEFAULT_BLOK_KAPASITAS;
}

const BLOCKS_BASE = [
  { 
    id: "yellow", 
    name: "Blok Kuning", 
    kapasitasKey: "kuning" as const,
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-950/10",
    hoverShadow: "hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]", 
    textColor: "text-amber-400",
    position: { top: "36%", left: "6%", width: "22%", height: "28%" },
  },
  { 
    id: "cyan", 
    name: "Blok Biru", 
    kapasitasKey: "biru" as const,
    borderColor: "border-cyan-500/30",
    bgColor: "bg-cyan-950/10",
    hoverShadow: "hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]", 
    textColor: "text-cyan-400",
    position: { top: "39%", left: "29%", width: "20%", height: "30%" },
  },
  { 
    id: "purple", 
    name: "Blok Ungu", 
    kapasitasKey: "ungu" as const,
    borderColor: "border-fuchsia-500/30",
    bgColor: "bg-fuchsia-950/10",
    hoverShadow: "hover:shadow-[0_0_25px_rgba(217,70,239,0.2)]", 
    textColor: "text-fuchsia-400",
    position: { top: "39%", left: "51%", width: "20%", height: "30%" },
  },
  { 
    id: "green", 
    name: "Blok Hijau", 
    kapasitasKey: "hijau" as const,
    borderColor: "border-lime-400/30",
    bgColor: "bg-emerald-950/10",
    hoverShadow: "hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]", 
    textColor: "text-lime-400",
    position: { top: "36%", left: "72%", width: "22%", height: "28%" },
  },
];

// Build blocksConfig dengan rowsLayout dinamis dari konfigurasi
function buildBlocksConfig() {
  const kapasitas = getBlokKapasitas();
  return BLOCKS_BASE.map((b) => ({
    ...b,
    rowsLayout: buildRowsLayout(kapasitas[b.kapasitasKey]),
  }));
}

// Gunakan sebagai konstanta yang bisa di-refresh — hanya untuk SSR fallback
// Nilai aktual dikelola via state `blocksConfig` di dalam komponen

// --- Status Styles -----------------------------------------------------------
// We style the SVG icon using text color classes instead of heavy filters.

const statusConfig: Record<SeatStatus, {
  label: string;
  textClass: string;
  glowClass: string;
}> = {
  "checked-in": {
    label: "Hadir",
    textClass: "text-emerald-500 dark:text-emerald-400",
    glowClass: "drop-shadow-[0_0_6px_rgba(16,185,129,0.9)]",
  },
  "not-arrived": {
    label: "Dipesan",
    textClass: "text-blue-500 dark:text-blue-400",
    glowClass: "drop-shadow-[0_0_6px_rgba(59,130,246,0.9)]",
  },
  "vip": {
    label: "Hadir (VIP)",
    textClass: "text-red-500 dark:text-red-400",
    glowClass: "drop-shadow-[0_0_8px_rgba(239,68,68,0.95)]",
  },
  "empty": {
    label: "Kosong / Tersedia",
    textClass: "text-slate-300 dark:text-white/20 opacity-30",
    glowClass: "",
  },
};

// --- Component ----------------------------------------------------------------

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
  // State untuk trigger re-render saat konfigurasi blok berubah
  const [blocksConfig, setBlocksConfig] = useState(() => buildBlocksConfig());

  const { socket } = useSocket("admin");
  const { isConnected, lastResult } = useScannerStore();

  // -- Fungsi mapping invitations → seats (menggunakan blocksConfig state) --
  const mapInvitationsToSeats = useCallback((invitations: any[]): SeatData[] => {
    const seats: SeatData[] = [];
    const currentConfig = blocksConfig;

    const sortedInvs = [...invitations].sort((a, b) =>
      (a.mahasiswa?.nim || "").localeCompare(b.mahasiswa?.nim || "")
    );

    // Buat daftar permintaan kursi (wisudawan + keluarga) secara berurutan
    const seatRequests: { type: "student" | "guest"; guestIndex?: number; inv: any }[] = [];
    sortedInvs.forEach((inv) => {
      if (inv.mahasiswa) {
        // Tambahkan kursi wisudawan
        seatRequests.push({ type: "student", inv });
        // Tambahkan kursi tamu pendamping
        const guestCount = inv.kuotaTamu || 0;
        for (let i = 0; i < guestCount; i++) {
          seatRequests.push({ type: "guest", guestIndex: i + 1, inv });
        }
      }
    });

    const numSeats = seatRequests.length;

    const blockCapacities = currentConfig.map((b) =>
      b.rowsLayout.reduce((sum, cols) => sum + cols, 0)
    );
    const totalCapacity = blockCapacities.reduce((a, b) => a + b, 0);

    // Distribusi kursi proporsional ke tiap blok
    let allocated = 0;
    const groups: Record<string, any[]> = {};
    currentConfig.forEach((block, idx) => {
      const cap = blockCapacities[idx];
      const count =
        idx === currentConfig.length - 1
          ? numSeats - allocated
          : Math.round((cap / Math.max(totalCapacity, 1)) * numSeats);
      groups[block.id] = seatRequests.slice(allocated, allocated + count);
      allocated += count;
    });

    currentConfig.forEach((block) => {
      const groupInvs = groups[block.id] ?? [];
      let seatIndex = 0;

      block.rowsLayout.forEach((colsInRow, row) => {
        for (let col = 0; col < colsInRow; col++) {
          const seatCode = `${String.fromCharCode(65 + row)}${col + 1}`;
          const req = groupInvs[seatIndex];

          if (req && req.inv && req.inv.mahasiswa) {
            const isHadir =
              req.inv.kehadiran?.statusKehadiran === "HADIR" ||
              req.inv.kehadiran?.statusKehadiran === "TERLAMBAT";

            const seatStatus: SeatStatus = isHadir
              ? row === 0 ? "vip" : "checked-in"
              : "not-arrived";

            seats.push({
              id: `${block.id}-${row}-${col}`,
              blockId: block.id,
              blockName: block.name,
              row,
              col,
              seatCode,
              status: seatStatus,
              student: {
                mahasiswaId: req.inv.mahasiswa.id,
                name: req.type === "student"
                  ? req.inv.mahasiswa.nama
                  : `Tamu ${req.guestIndex} - ${req.inv.mahasiswa.nama}`,
                nim: req.inv.mahasiswa.nim,
                faculty: req.inv.mahasiswa.fakultas,
                prodi: req.inv.mahasiswa.prodi,
                sesi: req.inv.mahasiswa.sesiWisuda || "Sesi Utama",
                invitationNo: req.inv.kode,
                scanTime: req.inv.kehadiran
                  ? new Date(req.inv.kehadiran.waktuScan).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : undefined,
                gate: req.inv.kehadiran?.catatan || undefined,
              },
            });
            seatIndex++;
          } else {
            seats.push({
              id: `${block.id}-${row}-${col}`,
              blockId: block.id,
              blockName: block.name,
              row,
              col,
              seatCode,
              status: "empty",
            });
          }
        }
      });
    });

    return seats;
  }, [blocksConfig]);

  // Listen perubahan konfigurasi blok dari localStorage (saat admin simpan di Pengaturan)
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === "wisuda_blok_kursi") {
        setBlocksConfig(buildBlocksConfig());
      }
    }
    window.addEventListener("storage", handleStorageChange);
    // Refresh saat mount untuk memastikan pakai nilai terbaru dari localStorage
    setBlocksConfig(buildBlocksConfig());
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
  }, [mapInvitationsToSeats]);

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
    blocksConfig.forEach((b) => (grouped[b.id] = []));
    seats.forEach((seat) => {
      if (grouped[seat.blockId]) grouped[seat.blockId].push(seat);
    });
    return grouped;
  }, [seats, blocksConfig]);

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
    <LiquidGlassCard
      noEntrance={false}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="p-6 overflow-hidden relative"
    >
      {/* Ambient glow */}
      <div className="absolute -top-40 left-1/3 -z-10 size-[500px] rounded-full bg-violet-600/10 blur-[120px] animate-pulse dark:bg-violet-600/10" />
      <div className="absolute -bottom-40 right-1/4 -z-10 size-[450px] rounded-full bg-blue-600/5 blur-[120px]" />

      {/* -- Header -------------------------------------------------- */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-5 transition-colors duration-300">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2 transition-colors duration-300">
              Auditorium Seat Monitor{" "}
            </h2>
          </div>
          <p className="text-sm font-semibold text-slate-500 dark:text-white/40 mt-1 leading-relaxed transition-colors duration-300">
            Layout Auditorium Utama ·{" "}
            <span className="text-slate-800 dark:text-white font-bold transition-colors duration-300">
              {statsSummary.totalCheckedIn}
            </span>{" "}
            hadir dari{" "}
            <span className="text-slate-800 dark:text-white font-bold transition-colors duration-300">
              {statsSummary.totalAssigned}
            </span>{" "}
            terdaftar
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 lg:gap-6">
          <div className="flex flex-wrap gap-4 bg-slate-100/60 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] rounded-2xl px-4 py-2.5 backdrop-blur-md transition-all duration-300">
            {(
              Object.entries(statusConfig) as [
                SeatStatus,
                (typeof statusConfig)[SeatStatus],
              ][]
            ).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-2">
                {/* Mini chair preview in legend */}
                <Armchair
                  className={cn("size-4 object-contain", cfg.textClass, cfg.glowClass)}
                />
                <span className="text-[11px] font-bold text-slate-600 dark:text-white/50">
                  {cfg.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* -- Scan Alert Banner --------------------------------------- */}
      <AnimatePresence>
        {recentArrival && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-emerald-400/30 bg-emerald-50/70 p-4 text-emerald-800 shadow-[0_4px_12px_rgba(16,185,129,0.08)] dark:border-emerald-500/20 dark:bg-emerald-500/[0.06] dark:text-emerald-300 dark:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="size-5 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Scan QR Code Berhasil
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                    {recentArrival.name}
                  </span>{" "}
                  ({recentArrival.nim}) menempati kursi{" "}
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {recentArrival.blockName} {recentArrival.seatCode}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-emerald-100/80 px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" /> Real-time
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* -- Main Seat Map ------------------------------------------- */}
      <div className="relative w-full border border-slate-200/80 dark:border-white/[0.08] bg-[#0d121f]/95 dark:bg-black/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300">
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

          {/* -- 4 Seat Blocks (Flat 2D, no skew) -------------------- */}
          {blocksConfig.map((block) => {
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
                            <Armchair
                              className={cn(
                                "w-full h-full object-contain transition-all duration-300 pointer-events-none",
                                cfg.textClass,
                                cfg.glowClass,
                                seat.status === "vip" && "animate-pulse"
                              )}
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
    </LiquidGlassCard>
  );
}
