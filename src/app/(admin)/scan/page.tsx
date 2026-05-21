"use client";

import { motion } from "framer-motion";
import { Wifi, WifiOff, Shield, Users } from "lucide-react";
import { useScannerStore } from "@/store/scanner.store";
import { useSocket } from "@/hooks/use-socket";
import { QrScannerView } from "@/features/scanner/components/qr-scanner-view";
import { ScanResultPanel } from "@/features/scanner/components/scan-result-panel";

export default function ScanPage() {
  const { totalScanned, isConnected } = useScannerStore();

  // Establish socket connection for live gate reporting
  useSocket("scanner");

  return (
    <div className="mx-auto w-full max-w-7xl flex h-full flex-col gap-5">
      {/* Upper Status Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.06] pb-4 shrink-0"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Shield className="size-6 text-blue-400" />
            Scanner Gate Absensi
          </h1>
          <p className="text-xs font-semibold text-white/40 mt-1">
            Validasi undangan digital secara realtime menggunakan kamera
            belakang perangkat
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-bold transition-all ${
              isConnected
                ? "border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-400"
                : "border-white/[0.08] bg-white/[0.02] text-white/40"
            }`}
          >
            {isConnected ? (
              <>
                <Wifi className="size-4 animate-pulse" />
                <span>SERVER CONNECTED</span>
              </>
            ) : (
              <>
                <WifiOff className="size-4" />
                <span>OFFLINE MODE</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#090D16]/50 px-3.5 py-2 text-xs font-bold text-white/80">
            <Users className="size-4 text-blue-400" />
            <span>{totalScanned} ABSEN</span>
          </div>
        </div>
      </motion.div>

      {/* Main Grid — fills remaining viewport height */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Side: Realtime Viewfinder */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-1">
          <QrScannerView />

          {/* Quick instructions for Petugas */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4 text-xs text-white/35 leading-relaxed space-y-1.5 shrink-0">
            <p className="font-extrabold text-white/50 uppercase tracking-wider text-[10px]">
              Panduan Penggunaan:
            </p>
            <p>
              1. Klik tombol{" "}
              <span className="text-blue-400 font-bold">AKTIFKAN KAMERA</span>{" "}
              jika viewfinder belum berjalan.
            </p>
            <p>
              2. Posisikan QR code undangan di tengah kotak viewfinder yang
              disediakan.
            </p>
            <p>
              3. Pastikan pencahayaan cukup dan kamera fokus untuk mempercepat
              proses identifikasi.
            </p>
            <p>
              4. Status validasi dan rincian alokasi kursi wisudawan akan muncul
              di panel kanan.
            </p>
          </div>
        </div>

        {/* Right Side: Scan Validation Result */}
        <div className="overflow-y-auto pr-1">
          <ScanResultPanel />
        </div>
      </div>
    </div>
  );
}
