"use client";

import { useCallback, useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Camera, CameraOff, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import { useScannerStore } from "@/store/scanner.store";
import { API_ROUTES } from "@/utils/constants";
import { cn } from "@/lib/utils";

export function QrScannerView() {
  const { setStatus, setScanResult, status } = useScannerStore();
  const [localLoading, setLocalLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sound effects helper for premium feedback
  const playBeep = useCallback((success: boolean) => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);

      if (success) {
        // High pitch beep for success
        osc.frequency.setValueAtTime(880, context.currentTime); // A5
        gain.gain.setValueAtTime(0.1, context.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.15);
        osc.stop(context.currentTime + 0.15);
      } else {
        // Low pitch buzz for error
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, context.currentTime); // low buzz
        gain.gain.setValueAtTime(0.15, context.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.35);
        osc.stop(context.currentTime + 0.35);
      }
    } catch (e) {
      console.warn("Audio Context not supported or allowed yet.", e);
    }
  }, []);

  const handleScan = useCallback(
    async (decodedText: string) => {
      // Prevent double scanning if already processing or showing a result
      if (localLoading || status === "success" || status === "error") return;

      setLocalLoading(true);
      setStatus("scanning");
      setErrorMessage(null);

      try {
        const res = await axios.post(API_ROUTES.KEHADIRAN.SCAN, {
          qrToken: decodedText,
        });

        const data = res.data.data;
        setScanResult(data);
        playBeep(data.success);

        if (data.success) {
          toast.success(data.message || "Absensi berhasil dicatat!");
        } else {
          toast.error(data.message || "QR Code tidak valid!");
        }
      } catch (error: any) {
        console.error("Scan error details:", error);
        const serverMsg = error.response?.data?.message || error.response?.data?.error;
        const msg = serverMsg || "Gagal memproses QR Code undangan";
        
        setScanResult({ success: false, message: msg });
        playBeep(false);
        toast.error(msg);
        setErrorMessage(msg);
      } finally {
        setLocalLoading(false);
      }
    },
    [localLoading, status, setStatus, setScanResult, playBeep]
  );

  const { containerId, isScanning, hasPermission, startScanning, stopScanning } =
    useQrScanner({
      onScan: handleScan,
      onError: (err) => console.warn("[QR Scanner]", err),
    });

  // Automatically start scanner on mount for ease of use
  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  }, [startScanning, stopScanning]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-3xl border border-white/[0.08] bg-[#090D16]/80 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden"
    >
      {/* Background glowing gradients */}
      <div className="absolute -right-24 -top-24 -z-10 size-48 rounded-full bg-blue-500/10 blur-[80px]" />
      <div className="absolute -left-24 -bottom-24 -z-10 size-48 rounded-full bg-violet-500/10 blur-[80px]" />

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Camera className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Kamera Pemindai
            </h3>
            <p className="text-xs font-semibold text-white/35">
              Gate aktif · Sesi realtime
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {localLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-400 border border-amber-500/20"
              >
                <Loader2 className="size-3 animate-spin" />
                MEMPROSES
              </motion.div>
            ) : isScanning ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/20"
              >
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                READY TO SCAN
              </motion.div>
            ) : (
              <motion.div
                key="standby"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1 text-[11px] font-bold text-white/40 border border-white/[0.06]"
              >
                STANDBY
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Viewfinder area */}
      <div className="relative aspect-square w-full max-w-[340px] mx-auto rounded-2xl border border-white/[0.08] bg-black/60 overflow-hidden shadow-inner flex items-center justify-center">
        
        {/* Corner camera-like brackets */}
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="relative w-[70%] h-[70%]">
            {[
              "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
              "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
              "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
              "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
            ].map((cls, i) => (
              <div
                key={i}
                className={cn(
                  "absolute size-6",
                  cls,
                  localLoading
                    ? "border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    : isScanning
                    ? "border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-pulse"
                    : "border-white/20",
                  "transition-colors duration-300"
                )}
              />
            ))}

            {/* Scan animation line */}
            {isScanning && !localLoading && (
              <motion.div
                className="absolute left-1.5 right-1.5 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                animate={{ top: ["8%", "92%", "8%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>
        </div>

        {/* The HTML5 QR Code element container */}
        <div
          id={containerId}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            (localLoading || !isScanning) ? "opacity-30" : "opacity-100"
          )}
        />

        {/* Camera not active mask */}
        {!isScanning && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#06080E]/90 backdrop-blur-md">
            <div className="flex size-14 items-center justify-center rounded-full bg-white/[0.03] border border-white/[0.08] text-white/25 mb-3">
              <CameraOff className="size-6 animate-pulse" />
            </div>
            <p className="text-xs font-black uppercase tracking-wider text-white/30">
              Kamera Mati
            </p>
            <p className="text-[10px] font-semibold text-white/20 mt-1 max-w-[200px] text-center">
              Klik tombol di bawah untuk mengaktifkan pemindai
            </p>
          </div>
        )}

        {/* Loading overlay when api processing */}
        {localLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <Loader2 className="size-10 text-amber-400 animate-spin" />
            <p className="text-xs font-bold text-amber-400 mt-3 tracking-widest uppercase">
              Memvalidasi...
            </p>
          </div>
        )}
      </div>

      {/* Permission alert */}
      {hasPermission === false && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-3 text-red-400">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wide">
              Akses Kamera Ditolak
            </p>
            <p className="text-[10px] font-semibold text-red-400/70 mt-0.5 leading-relaxed">
              Izinkan akses kamera di pengaturan browser Anda agar pemindai dapat berfungsi.
            </p>
          </div>
        </div>
      )}

      {/* Camera Toggle Button */}
      <div className="mt-5">
        <button
          type="button"
          onClick={isScanning ? stopScanning : startScanning}
          className={cn(
            "flex w-full h-12 items-center justify-center gap-2.5 rounded-2xl border text-xs font-black tracking-widest uppercase transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer",
            isScanning
              ? "border-red-500/20 bg-red-500/[0.08] text-red-400 hover:bg-red-500/15"
              : "border-blue-500/20 bg-blue-500/[0.08] text-blue-400 hover:bg-blue-500/15"
          )}
        >
          {isScanning ? (
            <>
              <CameraOff className="size-4.5" />
              Matikan Kamera
            </>
          ) : (
            <>
              <Camera className="size-4.5" />
              Aktifkan Kamera
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
