"use client";

import { useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import {
  Camera, CameraOff, CheckCircle2, XCircle,
  Clock, User, ScanLine, Wifi, WifiOff, Hash,
  Building2, Armchair,
} from "lucide-react";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import { useScannerStore } from "@/store/scanner.store";
import { useSocket } from "@/hooks/use-socket";
import { API_ROUTES } from "@/utils/constants";
import type { ScanResult } from "@/types/kehadiran.type";

// ─── Scan result card ─────────────────────────────────────────────────────────

function ScanResultCard({ result }: { result: ScanResult }) {
  const isSuccess = result.success;

  return (
    <motion.div
      key={result.message}
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className={`rounded-2xl border p-5 ${
        isSuccess
          ? "border-emerald-500/20 bg-emerald-500/8"
          : "border-red-500/20 bg-red-500/8"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
          isSuccess ? "bg-emerald-500/15" : "bg-red-500/15"
        }`}>
          {isSuccess
            ? <CheckCircle2 className="size-5 text-emerald-400" />
            : <XCircle className="size-5 text-red-400" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${isSuccess ? "text-emerald-400" : "text-red-400"}`}>
            {isSuccess ? "VALID" : "INVALID"}
          </p>
          <p className="text-xs text-white/50 mt-0.5">{result.message}</p>

          {isSuccess && result.mahasiswa && (
            <div className="mt-3 space-y-2">
              {[
                { icon: User, value: result.mahasiswa.nama },
                { icon: Hash, value: result.mahasiswa.nim },
                { icon: Building2, value: result.mahasiswa.fakultas },
              ].map(({ icon: Icon, value }) => (
                <div key={value} className="flex items-center gap-2">
                  <Icon className="size-3.5 text-white/25 shrink-0" />
                  <span className="text-xs font-medium text-white/60 truncate">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── History item ─────────────────────────────────────────────────────────────

function HistoryItem({ result, index }: { result: ScanResult; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5"
    >
      {result.success
        ? <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
        : <XCircle className="size-3.5 text-red-400 shrink-0" />
      }
      <span className="flex-1 truncate text-[0.75rem] font-medium text-white/50">
        {result.mahasiswa?.nama ?? result.message}
      </span>
      <span className="text-[0.65rem] text-white/20 shrink-0">
        {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
      </span>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ScanPage() {
  const { setScanResult, lastResult, status, totalScanned, scanHistory, isConnected, setConnected } = useScannerStore();
  useSocket("scanner");

  const handleScan = useCallback(async (decodedText: string) => {
    try {
      const res = await axios.post(API_ROUTES.KEHADIRAN.SCAN, { qrToken: decodedText });
      const result: ScanResult = res.data.data;
      setScanResult(result);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memproses scan";
      setScanResult({ success: false, message });
      toast.error(message);
    }
  }, [setScanResult]);

  const { containerId, isScanning, hasPermission, startScanning, stopScanning } = useQrScanner({
    onScan: handleScan,
    onError: (err) => console.warn("[QR]", err),
  });

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-white/90">Scanner Undangan</h1>
          <p className="text-xs text-white/30 mt-0.5">Arahkan kamera ke QR Code undangan</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.7rem] font-semibold ${
            isConnected
              ? "border border-emerald-500/20 bg-emerald-500/8 text-emerald-400"
              : "border border-white/[0.08] bg-white/[0.04] text-white/30"
          }`}>
            {isConnected
              ? <><Wifi className="size-3" /><span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />Live</>
              : <><WifiOff className="size-3" />Offline</>
            }
          </div>
          <div className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[0.7rem] font-bold text-white/60">
            {totalScanned} scan
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Left — Camera */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-3"
        >
          {/* Camera viewport */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40">
            {/* Scanner frame overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
              <div className="relative size-48">
                {/* Corner brackets */}
                {[
                  "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                  "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                  "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                  "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                ].map((cls, i) => (
                  <div
                    key={i}
                    className={`absolute size-8 ${cls} ${
                      isScanning ? "border-blue-400" : "border-white/20"
                    } transition-colors duration-300`}
                  />
                ))}
                {/* Scan line */}
                {isScanning && (
                  <motion.div
                    className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                    animate={{ top: ["10%", "90%", "10%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </div>
            </div>

            {/* QR scanner container */}
            <div
              id={containerId}
              className="w-full aspect-square"
              style={{ minHeight: 280 }}
            />

            {/* Idle overlay */}
            {!isScanning && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                <ScanLine className="size-12 text-white/15 mb-3" />
                <p className="text-sm font-medium text-white/30">Kamera tidak aktif</p>
              </div>
            )}
          </div>

          {/* Permission error */}
          {hasPermission === false && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
              <p className="text-xs text-red-400">Akses kamera ditolak. Izinkan akses kamera di pengaturan browser.</p>
            </div>
          )}

          {/* Toggle button */}
          <button
            type="button"
            onClick={isScanning ? stopScanning : startScanning}
            className={`flex w-full h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
              isScanning
                ? "border-red-500/30 bg-red-500/10 text-red-400 hover:border-red-500/50 hover:bg-red-500/15"
                : "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/15"
            }`}
          >
            {isScanning
              ? <><CameraOff className="size-4" /> Stop Scanner</>
              : <><Camera className="size-4" /> Mulai Scanner</>
            }
          </button>
        </motion.div>

        {/* Right — Result + History */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          {/* Result */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 min-h-[140px] flex flex-col justify-center">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/20 mb-3">Hasil Scan</p>
            <AnimatePresence mode="wait">
              {status === "idle" ? (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-4 text-center"
                >
                  <Clock className="size-8 text-white/10 mb-2" />
                  <p className="text-xs text-white/20">Menunggu scan...</p>
                </motion.div>
              ) : lastResult ? (
                <ScanResultCard key={lastResult.message} result={lastResult} />
              ) : null}
            </AnimatePresence>
          </div>

          {/* Counter */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-center">
              <p className="text-2xl font-bold text-white/90">{totalScanned}</p>
              <p className="text-[0.65rem] text-white/25 mt-0.5">Scan Berhasil</p>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-center">
              <p className="text-2xl font-bold text-white/90">{scanHistory.filter(r => !r.success).length}</p>
              <p className="text-[0.65rem] text-white/25 mt-0.5">Scan Gagal</p>
            </div>
          </div>

          {/* History */}
          {scanHistory.length > 0 && (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/20 mb-3">
                Riwayat ({scanHistory.length})
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {scanHistory.slice(0, 10).map((r, i) => (
                  <HistoryItem key={i} result={r} index={i} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
