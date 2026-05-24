"use client";

import { motion } from "framer-motion";
import { Wifi, WifiOff, Shield, Users } from "lucide-react";
import { useScannerStore } from "@/store/scanner.store";
import { useSocket } from "@/hooks/use-socket";
import { QrScannerView } from "@/features/scanner/components/qr-scanner-view";
import { ScanResultPanel } from "@/features/scanner/components/scan-result-panel";

export default function ScanPage() {
  const { totalScanned, isConnected } = useScannerStore();

  useSocket("scanner");

  return (
    <div className="mx-auto w-full max-w-7xl flex h-full flex-col gap-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-white/[0.06] pb-4 shrink-0"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <Shield className="size-6 text-blue-500 dark:text-blue-400" />
            Scanner Gate Absensi
          </h1>
          <p className="text-xs font-semibold text-gray-400 dark:text-white/40 mt-1">
            Validasi undangan digital secara realtime menggunakan kamera belakang perangkat
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all ${
            isConnected
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/[0.04] dark:text-emerald-400"
              : "border-gray-200 bg-gray-50 text-gray-400 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-white/40"
          }`}>
            {isConnected ? (
              <><Wifi className="size-4 animate-pulse" /><span>SERVER CONNECTED</span></>
            ) : (
              <><WifiOff className="size-4" /><span>OFFLINE MODE</span></>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-sm dark:border-white/[0.08] dark:bg-[#090D16]/50 dark:text-white/80 dark:shadow-none">
            <Users className="size-4 text-blue-500 dark:text-blue-400" />
            <span>{totalScanned} ABSEN</span>
          </div>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Viewfinder */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-1">
          <QrScannerView />

          {/* Instructions */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/[0.06] dark:bg-white/[0.01] p-4 text-xs leading-relaxed space-y-1.5 shrink-0">
            <p className="font-extrabold text-gray-500 dark:text-white/50 uppercase tracking-wider text-[10px]">
              Panduan Penggunaan:
            </p>
            <p className="text-gray-500 dark:text-white/35">
              1. Klik tombol{" "}
              <span className="text-blue-500 dark:text-blue-400 font-bold">AKTIFKAN KAMERA</span>{" "}
              jika viewfinder belum berjalan.
            </p>
            <p className="text-gray-500 dark:text-white/35">
              2. Posisikan QR code undangan di tengah kotak viewfinder yang disediakan.
            </p>
            <p className="text-gray-500 dark:text-white/35">
              3. Pastikan pencahayaan cukup dan kamera fokus untuk mempercepat proses identifikasi.
            </p>
            <p className="text-gray-500 dark:text-white/35">
              4. Status validasi dan rincian alokasi kursi wisudawan akan muncul di panel kanan.
            </p>
          </div>
        </div>

        {/* Right: Result Panel */}
        <div className="overflow-y-auto pr-1">
          <ScanResultPanel />
        </div>
      </div>
    </div>
  );
}
