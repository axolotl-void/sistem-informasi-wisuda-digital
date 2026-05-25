"use client";

import { useState } from "react";
import { ScanLine, ShieldCheck, ShieldX, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";

type ScanState = "idle" | "valid" | "invalid";

const scanResults = {
  valid: {
    name: "Ayu Lestari",
    seat: "C-12",
    gate: "Gate 2",
  },
  invalid: {
    reason: "Undangan tidak ditemukan atau sudah digunakan",
  },
};

export function QrPanel() {
  const [state, setState] = useState<ScanState>("idle");

  function simulateScan(result: "valid" | "invalid") {
    setState(result);
    setTimeout(() => setState("idle"), 4000);
  }

  return (
    <LiquidGlassCard noEntrance hover={false} className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            QR Validation
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-white/35">
            Scanner Gate aktif
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 backdrop-blur-md">
          <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse dark:bg-emerald-400" />
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            Online
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
        {state === "valid" && (
          <div className="relative text-center">
            <ShieldCheck className="mx-auto mb-2 size-10 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              VALID
            </p>
            <p className="mt-1 text-xs font-medium text-slate-700 dark:text-white/70">
              {scanResults.valid.name}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-white/40">
              {scanResults.valid.seat} · {scanResults.valid.gate}
            </p>
          </div>
        )}
        {state === "invalid" && (
          <div className="relative px-4 text-center">
            <ShieldX className="mx-auto mb-2 size-10 text-red-500 dark:text-red-400" />
            <p className="text-sm font-bold text-red-600 dark:text-red-400">
              INVALID
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-white/45">
              {scanResults.invalid.reason}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-slate-400 dark:text-white/25">
        <Volume2 className="size-3.5" />
        <span className="text-[11px] font-medium">Notifikasi suara aktif</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => simulateScan("valid")}
          disabled={state !== "idle"}
          className="cursor-pointer rounded-xl border border-emerald-500/25 bg-emerald-500/15 py-2.5 text-xs font-semibold text-emerald-800 backdrop-blur-md transition-colors hover:bg-emerald-500/25 disabled:opacity-30 dark:text-emerald-300"
        >
          Demo Valid
        </button>
        <button
          type="button"
          onClick={() => simulateScan("invalid")}
          disabled={state !== "idle"}
          className="cursor-pointer rounded-xl border border-red-500/25 bg-red-500/15 py-2.5 text-xs font-semibold text-red-800 backdrop-blur-md transition-colors hover:bg-red-500/25 disabled:opacity-30 dark:text-red-300"
        >
          Demo Invalid
        </button>
      </div>
    </LiquidGlassCard>
  );
}
