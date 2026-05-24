"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ScanLine, ShieldCheck, ShieldX, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ScanState = "idle" | "valid" | "invalid";

const scanResults = {
  valid: {
    name: "Ayu Lestari",
    nim: "20240042",
    faculty: "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)",
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
      className="rounded-2xl border p-6 backdrop-blur-xl
        bg-white/70 border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)]
        dark:bg-white/[0.04] dark:border-white/[0.08] dark:shadow-none"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">QR Validation</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-white/35">Scanner Gate aktif</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-1">
          <div className="size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Online</span>
        </div>
      </div>

      {/* Scanner area */}
      <div
        className={cn(
          "relative flex h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-500",
          state === "idle" && "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]",
          state === "valid" && "border-emerald-400 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/[0.06]",
          state === "invalid" && "border-red-400 dark:border-red-500/40 bg-red-50 dark:bg-red-500/[0.06]",
        )}
      >
        {state === "idle" && (
          <>
            <ScanLine className="size-10 text-slate-300 dark:text-white/15 mb-2" />
            <p className="text-sm font-medium text-slate-400 dark:text-white/25">Menunggu scan QR Code...</p>
          </>
        )}
        {state === "valid" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <ShieldCheck className="mx-auto size-10 text-emerald-500 dark:text-emerald-400 mb-2" />
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">VALID</p>
            <p className="mt-1 text-xs font-medium text-slate-700 dark:text-white/60">{scanResults.valid.name}</p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-white/30">
              {scanResults.valid.seat} · {scanResults.valid.gate}
            </p>
          </motion.div>
        )}
        {state === "invalid" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <ShieldX className="mx-auto size-10 text-red-500 dark:text-red-400 mb-2" />
            <p className="text-sm font-bold text-red-600 dark:text-red-400">INVALID</p>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-white/40">{scanResults.invalid.reason}</p>
          </motion.div>
        )}
      </div>

      {/* Sound indicator */}
      <div className="mt-4 flex items-center gap-2 text-slate-400 dark:text-white/20">
        <Volume2 className="size-3.5" />
        <span className="text-[11px] font-medium">Notifikasi suara aktif</span>
      </div>

      {/* Demo buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => simulateScan("valid")}
          disabled={state !== "idle"}
          className="rounded-lg bg-emerald-100 dark:bg-emerald-500/10 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 transition-colors hover:bg-emerald-200 dark:hover:bg-emerald-500/20 disabled:opacity-30 cursor-pointer"
        >
          Demo Valid
        </button>
        <button
          type="button"
          onClick={() => simulateScan("invalid")}
          disabled={state !== "idle"}
          className="rounded-lg bg-red-100 dark:bg-red-500/10 py-2 text-xs font-medium text-red-700 dark:text-red-400 transition-colors hover:bg-red-200 dark:hover:bg-red-500/20 disabled:opacity-30 cursor-pointer"
        >
          Demo Invalid
        </button>
      </div>
    </motion.div>
  );
}
