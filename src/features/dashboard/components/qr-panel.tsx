"use client";

import { useEffect, useMemo } from "react";
import { ScanLine, ShieldCheck, ShieldX, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { useScannerStore } from "@/store/scanner.store";
import { useSocket } from "@/hooks/use-socket";

export function QrPanel() {
  const { status, lastResult, isConnected } = useScannerStore();

  // Pastikan dashboard juga join room untuk menerima event scan/stats
  useSocket("admin");

  const state: "idle" | "valid" | "invalid" = useMemo(() => {
    if (!lastResult) return "idle";
    return lastResult.success ? "valid" : "invalid";
  }, [lastResult]);

  const subtitle = useMemo(() => {
    if (!lastResult) return "Scanner Gate aktif";
    if (lastResult.success) return "QR Code valid, akses diizinkan";
    return "QR Code tidak valid / sudah digunakan";
  }, [lastResult]);

  useEffect(() => {
    if (!lastResult) return;
    // Bisa ditambahkan efek suara di sini (mis. Audio API) jika dibutuhkan.
  }, [lastResult]);

  return (
    <LiquidGlassCard noEntrance hover={false} className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            QR Validation
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-white/35">
            {subtitle}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1 backdrop-blur-md",
            isConnected
              ? "border-emerald-500/30 bg-emerald-500/15"
              : "border-slate-400/40 bg-slate-200/40 dark:border-white/20 dark:bg-white/[0.06]",
          )}
        >
          <div
            className={cn(
              "size-1.5 rounded-full",
              isConnected
                ? "bg-emerald-500 animate-pulse dark:bg-emerald-400"
                : "bg-slate-400 dark:bg-white/30",
            )}
          />
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            {isConnected ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      <div
        className={cn(
          "relative flex h-52 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed backdrop-blur-md transition-all duration-500",
          state === "idle" &&
            "border-slate-400/50 bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-white/15 dark:bg-white/[0.03] dark:shadow-none",
          state === "valid" &&
            "border-emerald-400/60 bg-emerald-500/10 dark:border-emerald-500/40",
          state === "invalid" &&
            "border-red-400/60 bg-red-500/10 dark:border-red-500/40",
        )}
      >
        {state === "idle" && (
          <>
            <div className="absolute inset-4 rounded-xl border border-white/40 dark:border-white/10" />
            <ScanLine className="relative mb-2 size-10 text-slate-300 dark:text-white/20" />
            <p className="relative text-sm font-medium text-slate-500 dark:text-white/30">
              Menunggu scan QR Code...
            </p>
          </>
        )}
        {state === "valid" && lastResult && lastResult.mahasiswa && (
          <div className="relative text-center">
            <ShieldCheck className="mx-auto mb-2 size-10 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              VALID
            </p>
            <p className="mt-1 text-xs font-medium text-slate-700 dark:text-white/70">
              {lastResult.mahasiswa.nama}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-white/40">
              NIM {lastResult.mahasiswa.nim}
            </p>
          </div>
        )}
        {state === "invalid" && lastResult && (
          <div className="relative px-4 text-center">
            <ShieldX className="mx-auto mb-2 size-10 text-red-500 dark:text-red-400" />
            <p className="text-sm font-bold text-red-600 dark:text-red-400">
              INVALID
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-white/45">
              {lastResult.message}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-slate-400 dark:text-white/25">
        <Volume2 className="size-3.5" />
        <span className="text-[11px] font-medium">Notifikasi suara aktif</span>
      </div>
    </LiquidGlassCard>
  );
}
