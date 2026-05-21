"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Hash, Building2, Ticket, Clock, 
  DoorOpen, CheckCircle2, BookOpen, Calendar, HelpCircle, Armchair
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SeatData } from "./seat-monitor";

interface SeatModalProps {
  seat: SeatData | null;
  onClose: () => void;
}

const statusLabels: Record<string, { text: string; color: string }> = {
  "checked-in": { text: "Hadir (Regular)", color: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" },
  "not-arrived": { text: "Dipesan (Belum Hadir)", color: "text-blue-400 bg-blue-500/10 border border-blue-500/20" },
  "vip": { text: "VIP Hadir", color: "text-red-400 bg-red-500/10 border border-red-500/20" },
  "empty": { text: "Kosong / Tersedia", color: "text-gray-400 bg-gray-500/10 border border-gray-500/20" },
};

export function SeatModal({ seat, onClose }: SeatModalProps) {
  if (!seat) return null;

  const hasStudent = !!seat.student;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#090D16]/95 p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
          {/* Neon Top Accent bar */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-1",
            seat.status === "checked-in" && "bg-emerald-500",
            seat.status === "not-arrived" && "bg-blue-500",
            seat.status === "vip" && "bg-red-500",
            seat.status === "empty" && "bg-gray-500"
          )} />

          {/* Close Button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 transition-all hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Header Card / Profile section */}
          <div className="flex flex-col items-center text-center mt-2 mb-6">
            <div className="relative mb-4 flex size-20 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] p-1 shadow-inner">
              <div className="size-full rounded-xl bg-white/[0.03] flex items-center justify-center overflow-hidden">
                {hasStudent ? (
                  <User className="size-9 text-white/30 animate-pulse" />
                ) : (
                  <Armchair className="size-9 text-white/20" />
                )}
              </div>
              
              {/* Floating Status Indicator Badge */}
              <div className={cn(
                "absolute -bottom-1 -right-1 size-6.5 rounded-xl border-2 border-[#090D16] flex items-center justify-center shadow-lg",
                seat.status === "checked-in" && "bg-emerald-500 text-white",
                seat.status === "not-arrived" && "bg-blue-500 text-white",
                seat.status === "vip" && "bg-red-500 text-white",
                seat.status === "empty" && "bg-zinc-600 text-white"
              )}>
                {seat.status === "checked-in" || seat.status === "vip" ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <HelpCircle className="size-3.5" />
                )}
              </div>
            </div>

            <p className="text-[10px] font-black tracking-widest text-white/35 uppercase">
              Kursi {seat.blockName}
            </p>
            <h3 className="mt-1 text-2xl font-black text-white tracking-tight leading-snug">
              {seat.seatCode}
            </h3>
            
            {/* Status Pill */}
            <div className="mt-3">
              <span className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider",
                statusLabels[seat.status].color
              )}>
                {statusLabels[seat.status].text}
              </span>
            </div>
          </div>

          {/* Info Details List */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
            {hasStudent && seat.student ? (
              <>
                <div className="flex items-center gap-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.01] px-4 py-3">
                  <User className="size-4.5 text-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Nama Lengkap</p>
                    <p className="text-sm font-extrabold text-white truncate">{seat.student.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.01] px-4 py-3">
                  <Hash className="size-4.5 text-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Nomor Induk Mahasiswa (NIM)</p>
                    <p className="text-sm font-extrabold text-white truncate">{seat.student.nim}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.01] px-4 py-3">
                  <Building2 className="size-4.5 text-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Fakultas</p>
                    <p className="text-sm font-extrabold text-white truncate">{seat.student.faculty}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.01] px-4 py-3">
                  <BookOpen className="size-4.5 text-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Program Studi</p>
                    <p className="text-sm font-extrabold text-white truncate">{seat.student.prodi}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.01] px-4 py-3">
                  <Calendar className="size-4.5 text-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Sesi Wisuda</p>
                    <p className="text-sm font-extrabold text-white truncate">{seat.student.sesi}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.01] px-4 py-3">
                  <Ticket className="size-4.5 text-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">No. Kode Undangan</p>
                    <p className="text-sm font-mono font-extrabold text-violet-400 truncate">{seat.student.invitationNo}</p>
                  </div>
                </div>

                {/* Scan Time Details */}
                {(seat.status === "checked-in" || seat.status === "vip") && (
                  <div className="mt-4 border-t border-white/[0.06] pt-4 space-y-2.5">
                    <p className="text-[10px] font-black text-white/40 tracking-widest uppercase mb-1">Riwayat Log Scan</p>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] px-4 py-3">
                        <Clock className="size-4.5 text-emerald-400/50 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold text-emerald-400/40 uppercase tracking-widest leading-none">Scan Masuk</p>
                          <p className="text-sm font-black text-emerald-400 mt-1">{seat.student.scanTime || "—"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl border border-white/[0.04] bg-white/[0.01] px-4 py-3">
                        <DoorOpen className="size-4.5 text-white/25 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold text-white/35 uppercase tracking-widest leading-none">Gate Masuk</p>
                          <p className="text-sm font-extrabold text-white/80 truncate mt-1">{seat.student.gate || "Gate Utama"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-white/[0.01] border border-white/[0.04] rounded-2xl p-4">
                <Armchair className="size-10 text-white/10 mb-2.5" />
                <p className="text-sm font-extrabold text-white/70">Kursi Fisik Kosong</p>
                <p className="text-xs text-white/30 max-w-[260px] leading-relaxed mt-1">
                  Belum ada data mahasiswa yang dikaitkan atau melakukan scan untuk nomor kursi ini.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
