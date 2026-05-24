"use client";

import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Camera, CameraOff, Loader2, AlertCircle, Scan } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import { useScannerStore } from "@/store/scanner.store";
import { API_ROUTES } from "@/utils/constants";
import { cn } from "@/lib/utils";

export function QrScannerView() {
  const { setStatus, setScanResult, status } = useScannerStore();
  const [localLoading, setLocalLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setErrorMessage(null);
    try {
      const res = await axios.post(API_ROUTES.KEHADIRAN.SCAN, { qrToken: decodedText });
      const data = res.data.data;
      setScanResult(data);
      playBeep(data.success);
      if (data.success) toast.success(data.message || "Absensi berhasil dicatat!");
      else toast.error(data.message || "QR Code tidak valid!");
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data?.error || "Gagal memproses QR Code";
      setScanResult({ success: false, message: msg });
      playBeep(false);
      toast.error(msg);
      setErrorMessage(msg);
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl border border-gray-200/80 bg-white dark:border-white/[0.08] dark:bg-[#0C1120] shadow-sm overflow-hidden"
    >
      {/* -- Top bar -- */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
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
          ) : isScanning ? (
            <motion.span key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> READY
            </motion.span>
          ) : (
            <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-2.5 py-1 text-[10px] font-bold text-gray-400 dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-white/30">
              STANDBY
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* -- Viewfinder -- */}
      <div className="px-4 pt-3 pb-3">
        <div className={cn(
          "relative w-full overflow-hidden rounded-xl flex items-center justify-center transition-all duration-300",
          "aspect-[4/3]",
          isScanning
            ? "bg-gray-950 ring-1 ring-blue-500/30 shadow-lg shadow-blue-500/10"
            : "bg-gray-50 border-2 border-dashed border-gray-200 dark:bg-white/[0.02] dark:border-white/[0.08]"
        )}>
          {/* Scan frame */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              <div className="relative w-[55%] h-[55%]">
                {[
                  "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
                  "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
                  "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
                  "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
                ].map((cls, i) => (
                  <div key={i} className={cn(
                    "absolute size-5 transition-colors duration-300", cls,
                    localLoading ? "border-amber-400" : "border-blue-400"
                  )} />
                ))}
                {!localLoading && (
                  <motion.div
                    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-80"
                    animate={{ top: ["5%", "95%", "5%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Camera feed */}
          <div id={containerId} className={cn(
            "w-full h-full transition-opacity duration-300",
            (localLoading || !isScanning) ? "opacity-0 pointer-events-none absolute" : "opacity-100"
          )} />

          {/* Idle placeholder */}
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

      {/* -- Permission alert -- */}
      {hasPermission === false && (
        <div className="mx-4 mb-3 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 dark:border-red-500/20 dark:bg-red-500/[0.06] p-3">
          <AlertCircle className="size-3.5 shrink-0 mt-0.5 text-red-500 dark:text-red-400" />
          <div>
            <p className="text-[11px] font-bold text-red-600 dark:text-red-400">Akses Kamera Ditolak</p>
            <p className="text-[10px] text-red-400/70 mt-0.5 leading-relaxed">
              Izinkan akses kamera di pengaturan browser agar pemindai dapat berfungsi.
            </p>
          </div>
        </div>
      )}

      {/* -- Toggle button -- */}
      <div className="px-4 pb-4">
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
  );
}
