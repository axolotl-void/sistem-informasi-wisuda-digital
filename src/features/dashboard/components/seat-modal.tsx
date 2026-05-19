"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, Hash, Building2, Ticket, Clock, DoorOpen, CheckCircle2 } from "lucide-react";
import type { SeatData } from "./seat-monitor";

interface SeatModalProps {
  seat: SeatData | null;
  onClose: () => void;
}

const statusLabels: Record<string, { text: string; color: string }> = {
  "checked-in": { text: "Hadir", color: "text-emerald-400 bg-emerald-500/10" },
  "not-arrived": { text: "Belum Hadir", color: "text-orange-400 bg-orange-500/10" },
  vip: { text: "VIP", color: "text-blue-400 bg-blue-500/10" },
};

export function SeatModal({ seat, onClose }: SeatModalProps) {
  return (
    <AnimatePresence>
      {seat && seat.student && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[#0F172A] p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium tracking-widest text-white/30 uppercase">
                  Detail Kursi {String.fromCharCode(65 + seat.row)}{seat.col + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  {seat.student.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Status badge */}
            <div className="mb-5">
              {statusLabels[seat.status] && (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusLabels[seat.status].color}`}>
                  <CheckCircle2 className="size-3" />
                  {statusLabels[seat.status].text}
                </span>
              )}
            </div>

            {/* Info rows */}
            <div className="space-y-3">
              {[
                { icon: Hash, label: "NIM", value: seat.student.nim },
                { icon: Building2, label: "Fakultas", value: seat.student.faculty },
                { icon: Ticket, label: "No. Undangan", value: seat.student.invitationNo },
                { icon: Clock, label: "Waktu Scan", value: seat.student.scanTime ?? "—" },
                { icon: DoorOpen, label: "Gate Masuk", value: seat.student.gate ?? "—" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-4 py-2.5">
                  <Icon className="size-4 text-white/25 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.68rem] text-white/30">{label}</p>
                    <p className="text-sm font-medium text-white/80 truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
