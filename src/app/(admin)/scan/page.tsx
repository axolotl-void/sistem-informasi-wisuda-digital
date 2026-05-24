"use client";

import { motion } from "framer-motion";
import { Wifi, WifiOff, ScanLine, Users } from "lucide-react";
import { useScannerStore } from "@/store/scanner.store";
import { useSocket } from "@/hooks/use-socket";
import { QrScannerView } from "@/features/scanner/components/qr-scanner-view";
import { ScanResultPanel } from "@/features/scanner/components/scan-result-panel";
import { cn } from "@/lib/utils";

export default function ScanPage() {
  const { totalScanned, isConnected } = useScannerStore();
  useSocket("scanner");

  return (
    <div className="mx-auto w-full max-w-7xl flex h-full flex-col gap-5">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-200 dark:border-white/[0.06]"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/25">
            <ScanLine className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
              Scanner Gate Absensi
            </h1>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">
              Validasi undangan digital secara realtime
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold",
            isConnected
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/[0.08] dark:text-emerald-400"
              : "border-gray-200 bg-gray-50 text-gray-400 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/40"
          )}>
            {isConnected
              ? <><span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /><Wifi className="size-3.5" /> LIVE</>
              : <><WifiOff className="size-3.5" /> OFFLINE</>
            }
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/[0.08] dark:text-blue-300">
            <Users className="size-3.5" />
            {totalScanned} Absen
          </div>
        </div>
      </motion.div>

      {/* ── Main Grid ── */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          <QrScannerView />

          {/* Instructions */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/80 dark:border-white/[0.05] dark:bg-white/[0.02] p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/25 mb-2.5">
              Panduan
            </p>
            <ol className="space-y-2">
              {[
                <span key={0}>Klik <span className="font-bold text-blue-500">Aktifkan Kamera</span> untuk memulai pemindai.</span>,
                "Arahkan QR code undangan ke tengah viewfinder.",
                "Pastikan pencahayaan cukup agar kamera fokus.",
                "Hasil validasi muncul otomatis di panel kanan.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-gray-500 dark:text-white/35">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-black text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 mt-px">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right */}
        <div className="overflow-y-auto">
          <ScanResultPanel />
        </div>
      </div>
    </div>
  );
}
