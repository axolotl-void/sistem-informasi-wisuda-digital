"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, DoorOpen, ScanLine, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { useUndanganStore } from "../store";
import { QrLarge } from "./qr-cell";
import { StatusBadge, AttendanceBadge } from "./status-badge";
import type { ScanHistory } from "../types";

function ScanHistoryItem({ scan }: { scan: ScanHistory }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] px-3 py-2.5">
      <div className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg ${
        scan.type === "masuk"
          ? "bg-emerald-100 dark:bg-emerald-500/10"
          : "bg-orange-100 dark:bg-orange-500/10"
      }`}>
        {scan.type === "masuk"
          ? <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          : <XCircle className="size-3.5 text-orange-500 dark:text-orange-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[0.75rem] font-semibold text-gray-700 dark:text-white/70 capitalize">{scan.type}</span>
          <span className="font-mono text-[0.65rem] text-gray-400 dark:text-white/30">
            {scan.timestamp?.includes("T") ? scan.timestamp.split("T")[1]?.slice(0, 8) : scan.timestamp || "—"}
          </span>
        </div>
        <p className="text-[0.68rem] text-gray-400 dark:text-white/30 mt-0.5">{scan.gate} · {scan.petugasName}</p>
      </div>
    </div>
  );
}

export function QRDrawer() {
  const { isDrawerOpen, drawerInvitation, closeDrawer } = useUndanganStore();
  const inv = drawerInvitation;

  return (
    <AnimatePresence>
      {isDrawerOpen && inv && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/55"
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-gray-200 bg-white dark:border-white/[0.08] dark:bg-[#080f1e] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/[0.06]">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white/90">Detail QR</h3>
                <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{inv.kode}</p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="flex size-8 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 cursor-pointer dark:text-white/30 dark:hover:bg-white/[0.08] dark:hover:text-white/60"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* QR Code */}
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/[0.07] dark:bg-white/[0.03] p-6">
                <QrLarge token={inv.qrToken} size={180} />
                <div className="text-center space-y-1">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/25">Token Validasi</p>
                  <p className="font-mono text-[0.68rem] text-gray-500 dark:text-white/50 break-all">{inv.qrToken}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <StatusBadge status={inv.status} size="md" />
                <AttendanceBadge status={inv.attendance} size="md" />
              </div>

              {/* Student info */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/[0.07] dark:bg-white/[0.03] p-4 space-y-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/25">Mahasiswa</p>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/80">{inv.mahasiswaNama}</p>
                  <p className="text-xs text-gray-400 dark:text-white/35 mt-0.5">{inv.nim} · {inv.fakultas}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {[
                    { label: "Sesi", value: inv.sesi },
                    { label: "Kursi", value: inv.nomorKursi },
                    { label: "Gedung", value: inv.gedung },
                    { label: "Kuota Tamu", value: `${inv.kuotaTamu} orang` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[0.65rem] text-gray-400 dark:text-white/25 font-medium">{label}</p>
                      <p className="text-[0.75rem] text-gray-600 dark:text-white/60 font-medium mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scan stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: ScanLine, label: "Total Scan", value: String(inv.scanCount ?? 0) },
                  { icon: Clock, label: "Pertama Scan", value: inv.firstScanAt ? (inv.firstScanAt.includes("T") ? inv.firstScanAt.split("T")[1]?.slice(0, 5) : inv.firstScanAt) : "—" },
                  { icon: DoorOpen, label: "Gate Masuk", value: inv.gate ?? "—" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl border border-gray-200 bg-gray-50 dark:border-white/[0.06] dark:bg-white/[0.03] p-3 text-center">
                    <Icon className="mx-auto size-4 text-gray-300 dark:text-white/20 mb-1.5" />
                    <p className="text-sm font-bold text-gray-700 dark:text-white/70">{value}</p>
                    <p className="text-[0.6rem] text-gray-400 dark:text-white/25 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Scan history */}
              <div className="space-y-2">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/25">
                  Riwayat Scan
                </p>
                {!inv.scanHistory || inv.scanHistory.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/[0.06] py-6 text-center">
                    <ScanLine className="mx-auto size-5 text-gray-300 dark:text-white/15 mb-2" />
                    <p className="text-xs text-gray-400 dark:text-white/20">Belum ada riwayat scan</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {inv.scanHistory.map((scan) => (
                      <ScanHistoryItem key={scan.id} scan={scan} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer action */}
            <div className="border-t border-gray-100 dark:border-white/[0.06] p-4">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-xs font-medium text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700 cursor-pointer dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/50 dark:hover:border-white/[0.12] dark:hover:bg-white/[0.07] dark:hover:text-white/70"
              >
                <RotateCcw className="size-3.5" />
                Regenerate QR
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
