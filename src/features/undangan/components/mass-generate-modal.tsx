"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useUndanganStore } from "../store";

type Step = "config" | "progress" | "done";

export function MassGenerateModal() {
  const { isMassGenerateOpen, closeMassGenerate, invitations, generateInvitation } = useUndanganStore();
  const [step, setStep] = useState<Step>("config");
  const [progress, setProgress] = useState(0);
  const [config, setConfig] = useState({
    sesi: "all",
    kuotaTamu: 2,
    tanggalWisuda: "2026-05-19",
    gedung: "Auditorium Utama",
  });

  const ungenerated = invitations.filter((i) => i.status === "belum_generate");
  const target = config.sesi === "all"
    ? ungenerated
    : ungenerated.filter((i) => i.sesi === config.sesi);

  async function handleGenerate() {
    if (target.length === 0) {
      toast.error("Tidak ada undangan yang perlu digenerate");
      return;
    }
    setStep("progress");
    setProgress(0);

    for (let i = 0; i < target.length; i++) {
      await new Promise((r) => setTimeout(r, 60));
      generateInvitation(target[i].id);
      setProgress(Math.round(((i + 1) / target.length) * 100));
    }

    setStep("done");
    toast.success(`${target.length} undangan berhasil digenerate`);
  }

  function handleClose() {
    closeMassGenerate();
    setTimeout(() => { setStep("config"); setProgress(0); }, 300);
  }

  return (
    <AnimatePresence>
      {isMassGenerateOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={step === "config" ? handleClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#080f1e] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-violet-500/10">
                    <Zap className="size-4 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white/90">Generate Massal</h2>
                    <p className="text-xs text-white/30">{ungenerated.length} undangan belum digenerate</p>
                  </div>
                </div>
                {step !== "progress" && (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex size-8 items-center justify-center rounded-xl text-white/30 hover:bg-white/[0.08] hover:text-white/60 cursor-pointer transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <div className="p-6">
                {/* Config step */}
                {step === "config" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {/* Target info */}
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="size-3.5 text-orange-400" />
                        <span className="text-xs font-semibold text-white/60">Target Generate</span>
                      </div>
                      <p className="text-2xl font-bold text-white/90">{target.length}</p>
                      <p className="text-xs text-white/30 mt-0.5">undangan akan digenerate</p>
                    </div>

                    {/* Sesi filter */}
                    <div className="space-y-1.5">
                      <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-white/30">Filter Sesi</label>
                      <select
                        value={config.sesi}
                        onChange={(e) => setConfig((c) => ({ ...c, sesi: e.target.value }))}
                        className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-[0.82rem] text-white/70 outline-none focus:border-blue-500/40 cursor-pointer"
                      >
                        <option value="all" className="bg-[#0F172A]">Semua Sesi</option>
                        {["Sesi Pagi", "Sesi Siang", "Sesi Sore"].map((s) => (
                          <option key={s} value={s} className="bg-[#0F172A]">{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Kuota */}
                    <div className="space-y-1.5">
                      <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-white/30">Kuota Tamu Default</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={config.kuotaTamu}
                        onChange={(e) => setConfig((c) => ({ ...c, kuotaTamu: Number(e.target.value) }))}
                        className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-[0.82rem] text-white/70 outline-none focus:border-blue-500/40"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={target.length === 0}
                      className="w-full h-11 rounded-xl border border-violet-500/30 bg-violet-500/10 text-sm font-semibold text-violet-400 transition-all hover:border-violet-500/50 hover:bg-violet-500/15 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Zap className="size-4" />
                      Generate {target.length} Undangan
                    </button>
                  </motion.div>
                )}

                {/* Progress step */}
                {step === "progress" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6 py-4"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative flex size-16 items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-white/[0.06]" />
                        <div
                          className="absolute inset-0 rounded-full border-2 border-violet-400 transition-all duration-300"
                          style={{
                            clipPath: `inset(0 ${100 - progress}% 0 0)`,
                          }}
                        />
                        <Loader2 className="size-6 text-violet-400 animate-spin" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white/90">{progress}%</p>
                        <p className="text-xs text-white/30 mt-1">Generating undangan...</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>

                    <p className="text-center text-xs text-white/25">
                      Jangan tutup halaman ini
                    </p>
                  </motion.div>
                )}

                {/* Done step */}
                {step === "done" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-6 text-center"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl" />
                      <div className="relative flex size-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                        <CheckCircle2 className="size-8 text-emerald-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white/90">Selesai!</p>
                      <p className="text-sm text-white/40 mt-1">
                        {target.length} undangan berhasil digenerate
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="mt-2 h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-medium text-white/60 transition-all hover:bg-white/[0.07] hover:text-white/80 cursor-pointer"
                    >
                      Tutup
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
