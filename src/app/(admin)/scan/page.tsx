"use client";

import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi, WifiOff, ScanLine, Users, Sparkles, BookOpen,
  Camera, CameraOff, Loader2, AlertCircle, Scan,
} from "lucide-react";
import { useScannerStore } from "@/store/scanner.store";
import { useSocket } from "@/hooks/use-socket";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import { ScanResultPanel } from "@/features/scanner/components/scan-result-panel";
import { API_ROUTES } from "@/utils/constants";
import { cn } from "@/lib/utils";

export default function ScanPage() {
  const { totalScanned, isConnected, setStatus, setScanResult, status } = useScannerStore();
  useSocket("scanner");

  const [localLoading, setLocalLoading] = useState(false);

  const playBeep = useCallback((success: boolean) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (success) {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) { console.warn("Audio not supported", e); }
  }, []);

  const handleScan = useCallback(async (decodedText: string) => {
    if (localLoading || status === "success" || status === "error") return;
    setLocalLoading(true);
    setStatus("scanning");
    try {
      const res = await axios.post(API_ROUTES.KEHADIRAN.SCAN, { qrToken: decodedText });
      const data = res.data.data;
      setScanResult(data);
      playBeep(data.success);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(data.success ? [100, 50, 100] : [300]);
      }
      if (data.success) toast.success(data.message || "Absensi berhasil dicatat!");
      else toast.error(data.message || "QR Code tidak valid!");
    } catch (error: any) {
      const serverResult = error.response?.data?.data;
      const msg = error.response?.data?.message || error.response?.data?.error || "Gagal memproses QR Code";
      if (serverResult) {
        setScanResult(serverResult);
      } else {
        setScanResult({ success: false, message: msg });
      }
      playBeep(false);
      toast.error(msg);
    } finally {
      setLocalLoading(false);
    }
  }, [localLoading, status, setStatus, setScanResult, playBeep]);

  const { containerId, isScanning, hasPermission, startScanning, stopScanning } =
    useQrScanner({ onScan: handleScan, onError: (err) => console.warn("[QR Scanner]", err) });

  useEffect(() => {
    startScanning();
    return () => { stopScanning(); };
  }, [startScanning, stopScanning]);

  return (
    <div className="dashboard-mesh relative -m-4 min-h-full overflow-hidden rounded-none p-4 sm:-m-6 sm:p-6 sm:rounded-3xl flex flex-col gap-5 z-10">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] dark:bg-blue-500/5" />
        <div className="absolute top-[35%] right-[-10%] w-[60%] h-[60%] bg-teal-500/10 rounded-full blur-[140px] dark:bg-teal-500/5" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] dark:bg-indigo-500/5" />
      </div>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200/50 dark:border-white/[0.08]"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <ScanLine className="size-5" />
          </div>
          <div>
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300">
              <Sparkles className="size-3" />
              Monitoring Realtime
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white leading-tight">
              Scanner Gate Absensi
            </h1>
            <p className="text-xs text-slate-500 dark:text-white/40 mt-0.5">
              Validasi kehadiran wisudawan secara langsung dari sistem administrator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected && (
            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <Wifi className="size-3.5" />
              Live
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300">
            <Users className="size-3.5" />
            {totalScanned} Absen
          </div>
        </div>
      </motion.div>

      {/* ── Main Grid ── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-5 items-start w-full">

        {/* ─ Left: Camera Card (inline, no shared component) ─ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="lg:col-span-3 rounded-[28px] border border-gray-200/60 bg-white/80 dark:border-white/[0.08] dark:bg-[#0C1120]/45 backdrop-blur-2xl shadow-xl overflow-hidden flex flex-col"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500 shadow-md shadow-blue-500/30">
                <Camera className="size-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-white/90 leading-none">Kamera Pemindai</p>
                <p className="text-[11px] text-gray-400 dark:text-white/35 mt-0.5">Gate aktif · Sesi realtime</p>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {localLoading ? (
                <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400">
                  <Loader2 className="size-2.5 animate-spin" /> MEMPROSES
                </motion.span>
              ) : !isScanning ? (
                <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-2.5 py-1 text-[10px] font-bold text-gray-400 dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-white/30">
                  STANDBY
                </motion.span>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Viewfinder */}
          <div className="px-5 pt-4 pb-3">
            <div className={cn(
              "relative w-full overflow-hidden rounded-2xl flex items-center justify-center transition-all duration-300",
              "aspect-[16/10]",
              isScanning
                ? "bg-gray-950 ring-1 ring-blue-500/30 shadow-lg shadow-blue-500/10"
                : "bg-gray-50 border-2 border-dashed border-gray-200 dark:bg-white/[0.02] dark:border-white/[0.08]"
            )}>
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                  <div className="relative h-[60%] w-[45%]">
                    {([
                      { h: "top-0 left-0", v: "top-0 left-0" },
                      { h: "top-0 right-0", v: "top-0 right-0" },
                      { h: "bottom-0 left-0", v: "bottom-0 left-0" },
                      { h: "bottom-0 right-0", v: "bottom-0 right-0" },
                    ] as const).map((corner, i) => {
                      const bar = localLoading ? "bg-amber-400" : "bg-blue-400";
                      return (
                        <div key={i}>
                          <span className={cn("absolute h-[2px] w-7 rounded-full", bar, corner.h, corner.h.includes("right") && "right-0", corner.h.includes("bottom") && "bottom-0")} />
                          <span className={cn("absolute h-7 w-[2px] rounded-full", bar, corner.v, corner.v.includes("right") && "right-0", corner.v.includes("bottom") && "bottom-0")} />
                        </div>
                      );
                    })}
                    {!localLoading && (
                      <motion.div
                        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-90 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                        animate={{ top: ["5%", "95%", "5%"] }}
                        transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Camera feed */}
              <div
                id={containerId}
                className={cn(
                  "absolute inset-0 transition-opacity duration-300",
                  localLoading || !isScanning ? "pointer-events-none opacity-0" : "opacity-100",
                )}
              />

              {/* Idle */}
              {!isScanning && (
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm dark:bg-white/[0.04] dark:border-white/[0.08]">
                    <Scan className="size-6 text-gray-300 dark:text-white/20" />
                  </div>
                  <p className="text-xs font-medium text-gray-400 dark:text-white/25">Kamera tidak aktif</p>
                </div>
              )}

              {/* Processing overlay */}
              {localLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 gap-2">
                  <Loader2 className="size-8 text-amber-400 animate-spin" />
                  <p className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">Memvalidasi...</p>
                </div>
              )}
            </div>
          </div>

          {/* Permission alert */}
          {hasPermission === false && (
            <div className="mx-5 mb-3 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 dark:border-red-500/20 dark:bg-red-500/[0.06] p-3">
              <AlertCircle className="size-3.5 shrink-0 mt-0.5 text-red-500 dark:text-red-400" />
              <div>
                <p className="text-[11px] font-bold text-red-600 dark:text-red-400">Akses Kamera Ditolak</p>
                <p className="text-[10px] text-red-400/70 mt-0.5 leading-relaxed">
                  Izinkan akses kamera di pengaturan browser agar pemindai dapat berfungsi.
                </p>
              </div>
            </div>
          )}

          {/* Toggle button */}
          <div className="px-5 pb-4">
            <button
              type="button"
              onClick={isScanning ? stopScanning : startScanning}
              className={cn(
                "flex w-full h-10 items-center justify-center gap-2 rounded-xl text-xs font-bold tracking-wide uppercase transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer",
                isScanning
                  ? "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 dark:bg-red-500/[0.08] dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/15"
                  : "bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-500/25 dark:bg-blue-500/15 dark:border dark:border-blue-500/30 dark:text-blue-400 dark:hover:bg-blue-500/25 dark:shadow-none"
              )}
            >
              {isScanning
                ? <><CameraOff className="size-3.5" /> Matikan Kamera</>
                : <><Camera className="size-3.5" /> Aktifkan Kamera</>
              }
            </button>
          </div>
        </motion.div>

        {/* ─ Right: Validation Panel ─ */}
        <div className="lg:col-span-2 w-full">
          <ScanResultPanel />
        </div>
      </div>

      {/* ── Guide Card (Full Width) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className="relative z-10 rounded-[28px] border border-white/60 bg-white/50 backdrop-blur-xl p-5 shadow-lg shadow-blue-500/5 dark:border-white/[0.08] dark:bg-[#0c1120]/45"
      >
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="size-4 text-blue-500" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-700 dark:text-blue-400">
            Panduan Operasional Scanner
          </h3>
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            <span key={0}>Klik tombol <span className="font-bold text-blue-600 dark:text-blue-400">Aktifkan Kamera</span> untuk menyalakan perangkat pemindai.</span>,
            "Posisikan QR code undangan wisudawan tepat di tengah kotak pemindai.",
            "Pastikan pencahayaan cukup dan kamera fokus untuk mempercepat proses scan.",
            "Hasil absensi dan detail data mahasiswa akan tampil otomatis pada panel kanan.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-xs text-slate-600 dark:text-white/40 leading-relaxed">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 mt-0.5">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </motion.div>
    </div>
  );
}
