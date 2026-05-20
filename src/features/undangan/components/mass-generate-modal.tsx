"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Zap,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Users,
  CalendarDays,
  Building2,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { useUndanganStore } from "../store";

type Step = "config" | "progress" | "done";

interface PreviewData {
  total: number;
  eligible: number;
  alreadyGenerated: number;
  sesi: string;
}

interface GenerateResult {
  generated: number;
  skipped: number;
}

const SESI_LIST = [
  { value: "all", label: "Semua Sesi" },
  { value: "Sesi Pagi", label: "Sesi Pagi" },
  { value: "Sesi Siang", label: "Sesi Siang" },
  { value: "Sesi Sore", label: "Sesi Sore" },
];

const GEDUNG_LIST = [
  "Auditorium Utama",
  "Gedung Serbaguna",
  "Aula Besar",
  "Balai Sidang",
];

export function MassGenerateModal() {
  const { isMassGenerateOpen, closeMassGenerate, init } = useUndanganStore();

  const [step, setStep] = useState<Step>("config");
  const [progress, setProgress] = useState(0);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const [config, setConfig] = useState({
    sesi: "all",
    kuotaTamu: 2,
    tanggalWisuda: new Date().toISOString().slice(0, 10),
    gedung: "Auditorium Utama",
  });

  // ── Fetch preview count from API ──────────────────────────────────────────
  const fetchPreview = useCallback(async (sesi: string) => {
    setIsLoadingPreview(true);
    setPreview(null);
    try {
      const params = new URLSearchParams({ sesi });
      const res = await fetch(`/api/undangan/generate/preview?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Gagal mengambil data preview");
      const json = await res.json();
      setPreview(json.data);
    } catch {
      toast.error("Gagal memuat data mahasiswa eligible");
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  // Fetch when modal opens or sesi changes
  useEffect(() => {
    if (isMassGenerateOpen && step === "config") {
      fetchPreview(config.sesi);
    }
  }, [isMassGenerateOpen, config.sesi, step, fetchPreview]);

  // ── Generate handler ──────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!preview || preview.eligible === 0) {
      toast.error("Tidak ada mahasiswa yang perlu digenerate undangannya");
      return;
    }

    setStep("progress");
    setProgress(10);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) {
          clearInterval(progressInterval);
          return 88;
        }
        return prev + Math.random() * 8 + 4;
      });
    }, 400);

    try {
      const res = await fetch("/api/undangan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tanggalWisuda: new Date(config.tanggalWisuda).toISOString(),
          tempatWisuda: config.gedung,
          kuotaTamu: config.kuotaTamu,
          sesi: config.sesi,
        }),
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Gagal generate massal");
      }

      const json = await res.json();
      setProgress(100);
      setResult(json.data);
      setStep("done");

      // Refresh store
      await init();
      toast.success(json.message || "Bulk generate berhasil");
    } catch (err) {
      clearInterval(progressInterval);
      setStep("config");
      setProgress(0);
      const message = err instanceof Error ? err.message : "Gagal generate massal";
      toast.error(message);
    }
  }

  function handleClose() {
    closeMassGenerate();
    setTimeout(() => {
      setStep("config");
      setProgress(0);
      setPreview(null);
      setResult(null);
    }, 300);
  }

  const eligible = preview?.eligible ?? 0;

  return (
    <AnimatePresence>
      {isMassGenerateOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={step === "config" ? handleClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#080f1e] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <Zap className="size-4 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white/90">Generate Massal</h2>
                    <p className="text-xs text-white/30 mt-0.5">
                      Buat undangan untuk semua wisudawan sekaligus
                    </p>
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
                {/* ── CONFIG STEP ──────────────────────────────────────── */}
                {step === "config" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-5"
                  >
                    {/* Preview Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      {/* Total Mahasiswa */}
                      <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-center">
                        <Users className="size-4 text-blue-400 mx-auto mb-1.5" />
                        <p className="text-xl font-bold text-white/90">
                          {isLoadingPreview ? (
                            <span className="inline-block w-6 h-5 bg-white/10 rounded animate-pulse" />
                          ) : (
                            preview?.total ?? "—"
                          )}
                        </p>
                        <p className="text-[0.65rem] text-white/30 mt-0.5 leading-tight">Total<br/>Wisudawan</p>
                      </div>

                      {/* Eligible */}
                      <div className={`rounded-xl border p-3 text-center transition-all ${
                        eligible > 0
                          ? "border-violet-500/30 bg-violet-500/[0.07]"
                          : "border-white/[0.07] bg-white/[0.03]"
                      }`}>
                        <Zap className={`size-4 mx-auto mb-1.5 ${eligible > 0 ? "text-violet-400" : "text-white/20"}`} />
                        <p className={`text-xl font-bold ${eligible > 0 ? "text-violet-300" : "text-white/90"}`}>
                          {isLoadingPreview ? (
                            <span className="inline-block w-6 h-5 bg-white/10 rounded animate-pulse" />
                          ) : (
                            eligible
                          )}
                        </p>
                        <p className="text-[0.65rem] text-white/30 mt-0.5 leading-tight">Akan<br/>Digenerate</p>
                      </div>

                      {/* Already generated */}
                      <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-center">
                        <UserCheck className="size-4 text-emerald-400 mx-auto mb-1.5" />
                        <p className="text-xl font-bold text-white/90">
                          {isLoadingPreview ? (
                            <span className="inline-block w-6 h-5 bg-white/10 rounded animate-pulse" />
                          ) : (
                            preview?.alreadyGenerated ?? "—"
                          )}
                        </p>
                        <p className="text-[0.65rem] text-white/30 mt-0.5 leading-tight">Sudah<br/>Punya</p>
                      </div>
                    </div>

                    {/* Warning if no eligible */}
                    {!isLoadingPreview && preview && eligible === 0 && (
                      <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3">
                        <AlertCircle className="size-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[0.78rem] text-amber-300/80 leading-relaxed">
                          Semua wisudawan pada sesi ini sudah memiliki undangan. Tidak ada yang perlu digenerate.
                        </p>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-white/[0.05]" />

                    {/* Form Fields */}
                    <div className="space-y-4">
                      {/* Filter Sesi */}
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-wider text-white/30">
                          <Users className="size-3" />
                          Filter Sesi
                        </label>
                        <select
                          value={config.sesi}
                          onChange={(e) =>
                            setConfig((c) => ({ ...c, sesi: e.target.value }))
                          }
                          className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-[0.82rem] text-white/70 outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 cursor-pointer transition-all"
                        >
                          {SESI_LIST.map((s) => (
                            <option key={s.value} value={s.value} className="bg-[#0F172A]">
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Tanggal Wisuda */}
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-wider text-white/30">
                          <CalendarDays className="size-3" />
                          Tanggal Wisuda
                        </label>
                        <input
                          type="date"
                          value={config.tanggalWisuda}
                          onChange={(e) =>
                            setConfig((c) => ({ ...c, tanggalWisuda: e.target.value }))
                          }
                          className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-[0.82rem] text-white/70 outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 transition-all [color-scheme:dark]"
                        />
                      </div>

                      {/* Gedung / Tempat Wisuda */}
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-wider text-white/30">
                          <Building2 className="size-3" />
                          Tempat / Gedung Wisuda
                        </label>
                        <select
                          value={config.gedung}
                          onChange={(e) =>
                            setConfig((c) => ({ ...c, gedung: e.target.value }))
                          }
                          className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-[0.82rem] text-white/70 outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 cursor-pointer transition-all"
                        >
                          {GEDUNG_LIST.map((g) => (
                            <option key={g} value={g} className="bg-[#0F172A]">
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Kuota Tamu */}
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-wider text-white/30">
                          <UserX className="size-3" />
                          Kuota Tamu Default
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={1}
                            max={10}
                            value={config.kuotaTamu}
                            onChange={(e) =>
                              setConfig((c) => ({ ...c, kuotaTamu: Number(e.target.value) }))
                            }
                            className="flex-1 accent-violet-500"
                          />
                          <div className="flex size-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-bold text-white/70">
                            {config.kuotaTamu}
                          </div>
                        </div>
                        <p className="text-[0.68rem] text-white/20">
                          Setiap wisudawan dapat membawa {config.kuotaTamu} tamu
                        </p>
                      </div>
                    </div>

                    {/* Generate Button */}
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isLoadingPreview || eligible === 0}
                      className="w-full h-11 rounded-xl border border-violet-500/30 bg-violet-500/10 text-sm font-semibold text-violet-400 transition-all hover:border-violet-500/50 hover:bg-violet-500/15 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isLoadingPreview ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Memuat data...
                        </>
                      ) : (
                        <>
                          <Zap className="size-4" />
                          Generate {eligible} Undangan
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {/* ── PROGRESS STEP ─────────────────────────────────────── */}
                {step === "progress" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6 py-4"
                  >
                    <div className="flex flex-col items-center gap-4">
                      {/* Spinner */}
                      <div className="relative flex size-20 items-center justify-center">
                        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
                          <circle
                            cx="40" cy="40" r="34"
                            fill="none"
                            stroke="rgba(255,255,255,0.06)"
                            strokeWidth="5"
                          />
                          <circle
                            cx="40" cy="40" r="34"
                            fill="none"
                            stroke="url(#grad)"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 34}
                            strokeDashoffset={2 * Math.PI * 34 * (1 - progress / 100)}
                            className="transition-all duration-300"
                          />
                          <defs>
                            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <Loader2 className="size-7 text-violet-400 animate-spin" />
                      </div>

                      <div className="text-center">
                        <p className="text-3xl font-bold text-white/90">
                          {Math.round(progress)}%
                        </p>
                        <p className="text-xs text-white/30 mt-1">
                          Sedang meng-generate undangan & QR code...
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>

                    <p className="text-center text-xs text-white/20">
                      Proses mungkin memerlukan beberapa menit. Jangan tutup halaman ini.
                    </p>
                  </motion.div>
                )}

                {/* ── DONE STEP ─────────────────────────────────────────── */}
                {step === "done" && result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-5 py-4 text-center"
                  >
                    {/* Success icon */}
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl scale-150" />
                      <div className="relative flex size-18 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 p-4">
                        <CheckCircle2 className="size-9 text-emerald-400" />
                      </div>
                    </div>

                    <div>
                      <p className="text-lg font-bold text-white/90">Selesai!</p>
                      <p className="text-sm text-white/40 mt-1">
                        Proses generate massal telah selesai
                      </p>
                    </div>

                    {/* Result stats */}
                    <div className="w-full grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-400">{result.generated}</p>
                        <p className="text-xs text-white/30 mt-0.5">Berhasil Dibuat</p>
                      </div>
                      <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-center">
                        <p className="text-2xl font-bold text-white/50">{result.skipped}</p>
                        <p className="text-xs text-white/30 mt-0.5">Dilewati</p>
                      </div>
                    </div>

                    {result.skipped > 0 && (
                      <p className="text-[0.72rem] text-white/25 leading-relaxed">
                        {result.skipped} mahasiswa dilewati karena sudah memiliki undangan aktif.
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-medium text-white/60 transition-all hover:bg-white/[0.07] hover:text-white/80 cursor-pointer"
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
