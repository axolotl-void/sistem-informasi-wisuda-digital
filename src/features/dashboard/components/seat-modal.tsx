"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Hash, Building2, Ticket, Clock, 
  DoorOpen, CheckCircle2, BookOpen, Calendar, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SeatData } from "./seat-monitor";

interface SeatModalProps {
  seat: SeatData | null;
  onClose: () => void;
}

const statusLabels: Record<string, { text: string; color: string }> = {
  "checked-in": { text: "Hadir / Terisi", color: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" },
  "not-arrived": { text: "Belum Hadir", color: "text-zinc-400 bg-zinc-500/10 border border-zinc-500/20" },
  "vip": { text: "VIP (Belum Hadir)", color: "text-amber-400 bg-amber-500/10 border border-amber-500/20" },
};

export function SeatModal({ seat, onClose }: SeatModalProps) {
  if (!seat || !seat.student) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0B0F19]/90 p-6 shadow-2xl backdrop-blur-md"
        >
          {/* Close Button */}
          <div className="absolute top-4 right-4">
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-white/40 transition-all hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Header Card / Profile */}
          <div className="flex flex-col items-center text-center mt-2 mb-6">
            <div className="relative mb-4 flex size-20 items-center justify-center rounded-full border-2 border-white/[0.08] bg-white/[0.02] p-1 shadow-inner">
              <div className="size-full rounded-full bg-white/[0.03] flex items-center justify-center overflow-hidden">
                <User className="size-9 text-white/20" />
              </div>
              {/* Status Badge Pin */}
              <div className={cn(
                "absolute bottom-0 right-0 size-6 rounded-full border-2 border-[#0B0F19] flex items-center justify-center shadow-lg",
                seat.status === "checked-in" ? "bg-emerald-500 text-white" : seat.status === "vip" ? "bg-amber-500 text-black" : "bg-zinc-600 text-white"
              )}>
                {seat.status === "checked-in" ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <User className="size-3.5" />
                )}
              </div>
            </div>

            <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">
              Kursi {seat.blockName} · {seat.seatCode}
            </p>
            <h3 className="mt-1.5 text-xl font-bold text-white tracking-tight px-4 leading-snug">
              {seat.student.name}
            </h3>
            
            {/* Status Pill */}
            <div className="mt-3">
              {statusLabels[seat.status] && (
                <span className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                  statusLabels[seat.status].color
                )}>
                  {statusLabels[seat.status].text}
                </span>
              )}
            </div>
          </div>

          {/* Info Rows */}
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {[
              { icon: Hash, label: "NIM", value: seat.student.nim },
              { icon: Building2, label: "Fakultas", value: seat.student.faculty },
              { icon: BookOpen, label: "Program Studi", value: seat.student.prodi },
              { icon: Calendar, label: "Sesi Wisuda", value: seat.student.sesi },
              { icon: Ticket, label: "No. Undangan", value: seat.student.invitationNo },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3.5 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-2.5 hover:bg-white/[0.04] transition-all">
                <Icon className="size-4 text-white/20 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[0.65rem] font-semibold text-white/30 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-semibold text-white/85 truncate">{value || "—"}</p>
                </div>
              </div>
            ))}

            {/* Attendance Specific Log */}
            {seat.status === "checked-in" && (
              <div className="mt-4 border-t border-white/[0.06] pt-4 space-y-2.5">
                <p className="text-xs font-semibold text-white/40 tracking-wider uppercase mb-1">Data Kehadiran</p>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-emerald-500/[0.02] px-4 py-2.5">
                    <Clock className="size-4 text-emerald-400/50 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[0.65rem] font-semibold text-emerald-400/40 uppercase tracking-wider">Scan Masuk</p>
                      <p className="text-sm font-bold text-emerald-400">{seat.student.scanTime || "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-2.5">
                    <DoorOpen className="size-4 text-white/25 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[0.65rem] font-semibold text-white/30 uppercase tracking-wider">Pintu / Catatan</p>
                      <p className="text-sm font-bold text-white/80 truncate">{seat.student.gate || "Gate Utama"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
