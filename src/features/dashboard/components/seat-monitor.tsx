"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SeatModal } from "./seat-modal";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SeatStatus = "checked-in" | "not-arrived" | "vip" | "blocked";

export interface SeatData {
  id: number;
  row: number;
  col: number;
  status: SeatStatus;
  student?: {
    name: string;
    nim: string;
    faculty: string;
    invitationNo: string;
    scanTime?: string;
    gate?: string;
  };
}

// ─── Dummy data generator ────────────────────────────────────────────────────

const faculties = [
  "Fakultas Teknik",
  "Fakultas Ekonomi",
  "Fakultas Hukum",
  "Fakultas Kedokteran",
  "Fakultas MIPA",
  "Fakultas Ilmu Sosial",
  "Fakultas Pertanian",
  "Fakultas Keguruan",
];
const firstNames = ["Ahmad", "Siti", "Budi", "Rina", "Dimas", "Putri", "Rizky", "Ayu", "Fajar", "Dewi"];
const lastNames = ["Pratama", "Sari", "Hidayat", "Lestari", "Ramadhan", "Utami", "Nugroho", "Wati"];

function generateSeats(): SeatData[] {
  const seats: SeatData[] = [];
  const statuses: SeatStatus[] = ["checked-in", "not-arrived", "vip", "blocked"];
  const weights = [0.45, 0.30, 0.10, 0.15]; // weighted distribution

  for (let i = 0; i < 200; i++) {
    const rand = Math.random();
    let cumulative = 0;
    let status: SeatStatus = "not-arrived";
    for (let s = 0; s < weights.length; s++) {
      cumulative += weights[s];
      if (rand < cumulative) {
        status = statuses[s];
        break;
      }
    }

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const hours = String(8 + Math.floor(Math.random() * 4)).padStart(2, "0");
    const mins = String(Math.floor(Math.random() * 60)).padStart(2, "0");

    seats.push({
      id: i + 1,
      row: Math.floor(i / 25),
      col: i % 25,
      status,
      student:
        status !== "blocked"
          ? {
              name: `${firstName} ${lastName}`,
              nim: `2024${String(i + 1).padStart(4, "0")}`,
              faculty: faculties[Math.floor(Math.random() * faculties.length)],
              invitationNo: `INV-${String(i + 1).padStart(4, "0")}`,
              scanTime: status === "checked-in" ? `${hours}:${mins}` : undefined,
              gate: status === "checked-in" ? `Gate ${(i % 4) + 1}` : undefined,
            }
          : undefined,
    });
  }
  return seats;
}

// ─── Status config ───────────────────────────────────────────────────────────

const statusConfig: Record<SeatStatus, { color: string; label: string }> = {
  "checked-in": { color: "bg-emerald-500", label: "Hadir" },
  "not-arrived": { color: "bg-orange-500", label: "Belum Hadir" },
  vip: { color: "bg-blue-500", label: "VIP" },
  blocked: { color: "bg-zinc-600", label: "Diblokir" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SeatMonitor() {
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Generate random seats only on client to avoid SSR/hydration mismatch
  useEffect(() => {
    setSeats(generateSeats());
    setMounted(true);
  }, []);

  const rows = 8;
  const cols = 25;

  const stats = useMemo(() => {
    const s = { total: 200, checkedIn: 0, notArrived: 0, vip: 0, blocked: 0 };
    seats.forEach((seat) => {
      if (seat.status === "checked-in") s.checkedIn++;
      else if (seat.status === "not-arrived") s.notArrived++;
      else if (seat.status === "vip") s.vip++;
      else s.blocked++;
    });
    return s;
  }, [seats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Seat Monitoring
          </h2>
          <p className="text-sm font-medium text-white/35">
            Auditorium Utama · {mounted ? `${stats.checkedIn}/${stats.total} terisi` : "Memuat..."}
          </p>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {(Object.entries(statusConfig) as [SeatStatus, typeof statusConfig[SeatStatus]][]).map(
            ([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={cn("size-2.5 rounded-full", cfg.color)} />
                <span className="text-xs font-medium text-white/35">{cfg.label}</span>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Seat grid — horizontally scrollable */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-black/20 p-4">
        {/* Stage indicator */}
        <div className="mx-auto mb-4 w-48 rounded-full bg-white/[0.06] py-1.5 text-center text-[0.7rem] font-medium tracking-widest text-white/25 uppercase">
          Panggung
        </div>

        {!mounted ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="size-8 rounded-full border-2 border-white/10 border-t-blue-400 animate-spin" />
              <p className="text-xs text-white/25">Memuat denah kursi...</p>
            </div>
          </div>
        ) : (
        <div className="mx-auto" style={{ minWidth: 700 }}>
          {Array.from({ length: rows }).map((_, row) => (
            <div key={row} className="flex items-center justify-center gap-0.5 mb-0.5">
              <span className="mr-2 w-4 text-right text-[0.65rem] font-mono text-white/20">
                {String.fromCharCode(65 + row)}
              </span>
              {Array.from({ length: cols }).map((_, col) => {
                const seatIndex = row * cols + col;
                const seat = seats[seatIndex];
                if (!seat) return null;
                const cfg = statusConfig[seat.status];
                const isHovered = hoveredId === seat.id;

                return (
                  <button
                    key={seat.id}
                    type="button"
                    onMouseEnter={() => setHoveredId(seat.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => seat.status !== "blocked" && setSelectedSeat(seat)}
                    className={cn(
                      "relative size-[22px] rounded-[4px] transition-all duration-200 cursor-pointer",
                      "border border-transparent",
                      seat.status === "blocked"
                        ? "bg-zinc-700/40 cursor-not-allowed"
                        : seat.status === "checked-in"
                          ? "bg-emerald-500/70 hover:bg-emerald-400"
                          : seat.status === "vip"
                            ? "bg-blue-500/70 hover:bg-blue-400"
                            : "bg-orange-500/50 hover:bg-orange-400/70",
                      isHovered && seat.status !== "blocked" && "ring-1 ring-white/40 scale-125 z-10",
                    )}
                    aria-label={`Seat ${String.fromCharCode(65 + row)}${col + 1} - ${cfg.label}`}
                  >
                    {/* Tooltip */}
                    <AnimatePresence>
                      {isHovered && seat.student && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap rounded-lg bg-zinc-900 border border-white/10 px-3 py-1.5 shadow-xl"
                        >
                          <p className="text-[0.68rem] font-medium text-white">
                            {seat.student.name}
                          </p>
                          <p className="text-[0.6rem] text-white/40">
                            {String.fromCharCode(65 + row)}{col + 1} · {cfg.label}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
              <span className="ml-2 w-4 text-[0.65rem] font-mono text-white/20">
                {String.fromCharCode(65 + row)}
              </span>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Modal */}
      <SeatModal seat={selectedSeat} onClose={() => setSelectedSeat(null)} />
    </motion.div>
  );
}
