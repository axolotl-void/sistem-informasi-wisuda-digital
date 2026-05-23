"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Clock, CheckCircle2, XCircle,
  AlertTriangle, Loader2, Send, X,
  Ticket, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusPengajuan = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

interface TamuData {
  requestedTamu: number;
  statusPengajuan: StatusPengajuan;
  sesiWisuda: string | null;
  undangan: {
    id: string;
    kode: string;
    statusUndangan: string;
    kuotaTamu: number;
  } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("wisuda-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    return parsed?.state?.token ?? null;
  } catch { return null; }
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Status UI configs ────────────────────────────────────────────────────────

const STATUS_CFG = {
  NONE: null,
  PENDING: {
    icon: Clock,
    title: "Menunggu Persetujuan Admin",
    desc: "Pengajuan Anda sedang ditinjau. Anda akan mendapat notifikasi setelah admin memproses.",
    color: "text-amber-400",
    bg: "bg-amber-500/[0.07]",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/10",
    dot: "bg-amber-400 animate-pulse",
  },
  APPROVED: {
    icon: CheckCircle2,
    title: "Pengajuan Disetujui!",
    desc: "Admin telah menyetujui pengajuan tamu Anda. Undangan Anda sudah aktif.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/[0.07]",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/10",
    dot: "bg-emerald-400",
  },
  REJECTED: {
    icon: XCircle,
    title: "Pengajuan Ditolak",
    desc: "Pengajuan tamu Anda ditolak oleh admin. Anda dapat mengajukan kembali.",
    color: "text-red-400",
    bg: "bg-red-500/[0.07]",
    border: "border-red-500/20",
    iconBg: "bg-red-500/10",
    dot: "bg-red-400",
  },
};

// ─── Components ───────────────────────────────────────────────────────────────

function StatusCard({ status, requestedTamu, undangan }: {
  status: StatusPengajuan;
  requestedTamu: number;
  undangan: TamuData["undangan"];
}) {
  const cfg = STATUS_CFG[status];
  if (!cfg) return null;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-5 space-y-3`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${cfg.iconBg}`}>
          <Icon className={`size-5 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`size-1.5 rounded-full ${cfg.dot}`} />
            <p className={`text-sm font-bold ${cfg.color}`}>{cfg.title}</p>
          </div>
          <p className="text-xs text-white/35 mt-1 leading-relaxed">{cfg.desc}</p>
        </div>
      </div>

      {/* Detail */}
      {requestedTamu > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="size-3.5 text-white/25" />
            <span className="text-xs text-white/40">Jumlah tamu diajukan</span>
          </div>
          <span className={`text-sm font-bold ${cfg.color}`}>{requestedTamu} orang</span>
        </div>
      )}

      {/* Undangan info jika sudah approved */}
      {status === "APPROVED" && undangan && (
        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="size-3.5 text-emerald-400/60" />
            <span className="text-xs text-white/40">Kode Undangan</span>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-400">{undangan.kode}</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TamuPage() {
  const [tamuData, setTamuData] = useState<TamuData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [jumlahTamu, setJumlahTamu] = useState(2);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/portal/tamu", {
        headers: authHeaders(),
        credentials: "include",
      });
      const result = await res.json();
      if (result.data) {
        setTamuData(result.data);
        if (result.data.requestedTamu > 0) {
          setJumlahTamu(result.data.requestedTamu);
        }
      }
    } catch {
      toast.error("Gagal memuat data pengajuan tamu");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (jumlahTamu < 1 || jumlahTamu > 10) {
      toast.error("Jumlah tamu harus antara 1–10 orang");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/portal/tamu", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
        body: JSON.stringify({ jumlahTamu }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal mengirim pengajuan");
      toast.success("Pengajuan tamu berhasil dikirim!");
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengirim pengajuan");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel() {
    setIsCancelling(true);
    try {
      const res = await fetch("/api/portal/tamu", {
        method: "DELETE",
        headers: authHeaders(),
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal membatalkan");
      toast.success("Pengajuan berhasil dibatalkan");
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membatalkan pengajuan");
    } finally {
      setIsCancelling(false);
    }
  }

  const status = tamuData?.statusPengajuan ?? "NONE";
  const isPending = status === "PENDING";
  const isApproved = status === "APPROVED";
  const isFormDisabled = isPending || isApproved;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-16 rounded-2xl bg-white/[0.03] animate-pulse" />
        <div className="h-32 rounded-2xl bg-white/[0.03] animate-pulse" />
        <div className="h-48 rounded-2xl bg-white/[0.03] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
            <Users className="size-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white/90">Pengajuan Tamu</h1>
            <p className="text-xs text-white/30">Ajukan jumlah tamu untuk wisuda Anda</p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchData}
          className="flex size-8 items-center justify-center rounded-xl text-white/25 hover:bg-white/[0.06] hover:text-white/50 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="size-4" />
        </button>
      </div>

      {/* Status card */}
      <AnimatePresence mode="wait">
        {status !== "NONE" && (
          <StatusCard
            key={status}
            status={status}
            requestedTamu={tamuData?.requestedTamu ?? 0}
            undangan={tamuData?.undangan ?? null}
          />
        )}
      </AnimatePresence>

      {/* Form pengajuan */}
      {!isApproved && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-5"
        >
          <div className="flex items-center gap-2">
            <Users className="size-3.5 text-indigo-400/60" />
            <p className="text-[0.7rem] font-black uppercase tracking-widest text-white/25">
              {isPending ? "Pengajuan Terkirim" : "Form Pengajuan Tamu"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input jumlah */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/40">
                Berapa jumlah tamu/keluarga yang ingin diundang?
              </label>
              <div className="flex items-center gap-3">
                {/* Decrement */}
                <button
                  type="button"
                  onClick={() => setJumlahTamu((v) => Math.max(1, v - 1))}
                  disabled={isFormDisabled || jumlahTamu <= 1}
                  className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-xl font-bold text-white/50 hover:bg-white/[0.08] hover:text-white/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  −
                </button>

                {/* Number display */}
                <div className={`flex-1 h-14 rounded-2xl border flex items-center justify-center gap-2 ${
                  isFormDisabled
                    ? "border-white/[0.05] bg-white/[0.02]"
                    : "border-indigo-500/30 bg-indigo-500/[0.06]"
                }`}>
                  <Users className={`size-4 ${isFormDisabled ? "text-white/20" : "text-indigo-400/60"}`} />
                  <span className={`text-2xl font-black tabular-nums ${isFormDisabled ? "text-white/30" : "text-white/90"}`}>
                    {jumlahTamu}
                  </span>
                  <span className={`text-xs ${isFormDisabled ? "text-white/20" : "text-white/40"}`}>orang</span>
                </div>

                {/* Increment */}
                <button
                  type="button"
                  onClick={() => setJumlahTamu((v) => Math.min(10, v + 1))}
                  disabled={isFormDisabled || jumlahTamu >= 10}
                  className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-xl font-bold text-white/50 hover:bg-white/[0.08] hover:text-white/80 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  +
                </button>
              </div>
              <p className="text-[0.65rem] text-white/20">Maksimal 10 orang tamu</p>
            </div>

            {/* Sesi info */}
            {tamuData?.sesiWisuda && (
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
                <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs text-white/35">Sesi wisuda Anda:</span>
                <span className="text-xs font-bold text-cyan-400">{tamuData.sesiWisuda}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2.5">
              {isPending ? (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex-1 h-12 rounded-2xl border border-red-500/20 bg-red-500/[0.06] text-sm font-semibold text-red-400/70 hover:bg-red-500/[0.12] hover:text-red-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCancelling ? (
                    <><Loader2 className="size-4 animate-spin" /> Membatalkan...</>
                  ) : (
                    <><X className="size-4" /> Batalkan Pengajuan</>
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || isFormDisabled}
                  className="flex-1 h-12 rounded-2xl border border-indigo-500/30 bg-indigo-500/15 text-sm font-bold text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <><Loader2 className="size-4 animate-spin" /> Mengirim...</>
                  ) : (
                    <><Send className="size-4" /> Kirim Pengajuan</>
                  )}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      )}

      {/* Info box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-start gap-2.5 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3.5"
      >
        <AlertTriangle className="size-4 text-white/15 shrink-0 mt-0.5" />
        <p className="text-[0.68rem] text-white/22 leading-relaxed">
          Pengajuan tamu akan ditinjau oleh admin. Setelah disetujui, undangan digital Anda akan otomatis digenerate dengan kuota tamu sesuai pengajuan.
        </p>
      </motion.div>
    </div>
  );
}
