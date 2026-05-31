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
  "checked-in": {
    text: "Hadir (Regular)",
    color: "text-emerald-700 bg-emerald-100 border border-emerald-200/80 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20",
  },
  "not-arrived": {
    text: "Dipesan (Belum Hadir)",
    color: "text-blue-700 bg-blue-100 border border-blue-200/80 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
  },
  "vip": {
    text: "VIP Hadir",
    color: "text-red-700 bg-red-100 border border-red-200/80 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20",
  },
  "empty": {
    text: "Kosong / Tersedia",
    color: "text-slate-600 bg-slate-100 border border-slate-200/80 dark:text-gray-400 dark:bg-gray-500/10 dark:border-gray-500/20",
  },
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden dark:border-white/[0.08] dark:bg-[#090D16]/95"
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
              className="flex size-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 cursor-pointer dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Header Card / Profile section */}
          <div className="flex flex-col items-center text-center mt-2 mb-6">
            <div className="relative mb-4 flex size-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-1 shadow-inner dark:border-white/[0.08] dark:bg-white/[0.02]">
              <div className="size-full rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden dark:bg-white/[0.03]">
                {hasStudent ? (
                  <User className="size-9 text-slate-400 dark:text-white/30 animate-pulse" />
                ) : (
                  <Armchair className="size-9 text-slate-300 dark:text-white/20" />
                )}
              </div>
              
              {/* Floating Status Indicator Badge */}
              <div className={cn(
                "absolute -bottom-1 -right-1 size-6.5 rounded-xl border-2 border-white flex items-center justify-center shadow-lg dark:border-[#090D16]",
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

            <p className="text-[10px] font-black tracking-widest text-slate-500 dark:text-white/35 uppercase">
              Kursi {seat.blockName}
            </p>
            <h3 className="mt-1 text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-snug">
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
                <div className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-white/[0.04] dark:bg-white/[0.01]">
                  <User className="size-4.5 text-slate-400 dark:text-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest">Nama Lengkap</p>
                    <p className="text-sm font-extrabold text-slate-800 truncate dark:text-white">{seat.student.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-white/[0.04] dark:bg-white/[0.01]">
                  <Hash className="size-4.5 text-slate-400 dark:text-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest">Nomor Induk Mahasiswa (NIM)</p>
                    <p className="text-sm font-extrabold text-slate-800 truncate dark:text-white">{seat.student.nim}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-white/[0.04] dark:bg-white/[0.01]">
                  <Building2 className="size-4.5 text-slate-400 dark:text-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest">Fakultas</p>
                    <p className="text-sm font-extrabold text-slate-800 truncate dark:text-white">{seat.student.faculty}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-white/[0.04] dark:bg-white/[0.01]">
                  <BookOpen className="size-4.5 text-slate-400 dark:text-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest">Program Studi</p>
                    <p className="text-sm font-extrabold text-slate-800 truncate dark:text-white">{seat.student.prodi}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-white/[0.04] dark:bg-white/[0.01]">
                  <Calendar className="size-4.5 text-slate-400 dark:text-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest">Sesi Wisuda</p>
                    <p className="text-sm font-extrabold text-slate-800 truncate dark:text-white">{seat.student.sesi}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-white/[0.04] dark:bg-white/[0.01]">
                  <Ticket className="size-4.5 text-slate-400 dark:text-white/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-slate-500 dark:text-white/30 uppercase tracking-widest">No. Kode Undangan</p>
                    <p className="text-sm font-mono font-extrabold text-violet-600 truncate dark:text-violet-400">{seat.student.invitationNo}</p>
                  </div>
                </div>

                {/* Scan Time Details */}
                {(seat.status === "checked-in" || seat.status === "vip") && (
                  <div className="mt-4 border-t border-slate-200 dark:border-white/[0.06] pt-4 space-y-2.5">
                    <p className="text-[10px] font-black text-slate-500 dark:text-white/40 tracking-widest uppercase mb-1">Riwayat Log Scan</p>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 dark:border-emerald-500/10 dark:bg-emerald-500/[0.02]">
                        <Clock className="size-4.5 text-emerald-500 dark:text-emerald-400/50 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold text-emerald-600/80 uppercase tracking-widest leading-none dark:text-emerald-400/40">Scan Masuk</p>
                          <p className="text-sm font-black text-emerald-700 mt-1 dark:text-emerald-400">{seat.student.scanTime || "—"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-white/[0.04] dark:bg-white/[0.01]">
                        <DoorOpen className="size-4.5 text-slate-400 dark:text-white/25 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold text-slate-500 dark:text-white/35 uppercase tracking-widest leading-none">Gate Masuk</p>
                          <p className="text-sm font-extrabold text-slate-700 truncate mt-1 dark:text-white/80">{seat.student.gate || "Gate Utama"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 border border-slate-100 rounded-2xl p-4 dark:bg-white/[0.01] dark:border-white/[0.04]">
                <Armchair className="size-10 text-slate-300 mb-2.5 dark:text-white/10" />
                <p className="text-sm font-extrabold text-slate-600 dark:text-white/70">Kursi Fisik Kosong</p>
                <p className="text-xs text-slate-500 max-w-[260px] leading-relaxed mt-1 dark:text-white/30">
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

