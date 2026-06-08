"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Clock, CheckCircle2, XCircle,
  AlertTriangle, Loader2, Send, X,
  Ticket, RefreshCw, Plus, Trash2, UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { PortalPageHeader } from "../_components/portal-page-header";
import { fetchWithAuth, getAuthHeaders } from "@/lib/client-auth";

// --- Types --------------------------------------------------------------------

type StatusPengajuan = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

interface TamuItem {
  id?: string;
  kode?: string;
  namaTamu: string;
  hubungan: string;
  qrToken?: string | null;
  qrImageUrl?: string | null;
  statusUndangan?: string;
  statusHadir?: boolean;
  waktuScan?: string | null;
}

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
  undanganTamu: TamuItem[];
}

const HUBUNGAN_OPTIONS = ["Orang Tua", "Saudara", "Wali", "Pasangan", "Lainnya"];
const MAX_TAMU = 3;

// --- Status UI configs --------------------------------------------------------

const STATUS_CFG = {
  NONE: null,
  PENDING: {
    icon: Clock,
    title: "Menunggu Persetujuan Admin",
    desc: "Pengajuan Anda sedang ditinjau. Anda akan mendapat notifikasi setelah admin memproses.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/[0.05] dark:bg-amber-500/[0.07]",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/10",
    dot: "bg-amber-500 dark:bg-amber-400 animate-pulse",
  },
  APPROVED: {
    icon: CheckCircle2,
    title: "Pengajuan Disetujui!",
    desc: "Admin telah menyetujui pengajuan tamu Anda. QR tamu sudah bisa diakses di menu E-Ticket.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/[0.05] dark:bg-emerald-500/[0.07]",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/10",
    dot: "bg-emerald-500 dark:bg-emerald-400",
  },
  REJECTED: {
    icon: XCircle,
    title: "Pengajuan Ditolak",
    desc: "Pengajuan tamu Anda ditolak oleh admin. Anda dapat mengajukan kembali.",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/[0.05] dark:bg-red-500/[0.07]",
    border: "border-red-500/20",
    iconBg: "bg-red-500/10",
    dot: "bg-red-500 dark:bg-red-400",
  },
};

// --- Status Card Component ----------------------------------------------------

function StatusCard({ status, tamuList }: {
  status: StatusPengajuan;
  tamuList: TamuItem[];
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
          <p className="text-xs text-slate-500 dark:text-white/35 mt-1 leading-relaxed">{cfg.desc}</p>
        </div>
      </div>

      {/* Daftar tamu yang diajukan */}
      {tamuList.length > 0 && (
        <div className="space-y-1.5">
          {tamuList.map((tamu, i) => (
            <div
              key={tamu.id || i}
              className="rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.03] px-4 py-2.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/[0.06] text-[0.65rem] font-bold text-slate-500 dark:text-white/30">
                  {i + 1}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-white/70">{tamu.namaTamu}</p>
                  <p className="text-[0.6rem] text-slate-400 dark:text-white/25">{tamu.hubungan}</p>
                </div>
              </div>
              {status === "APPROVED" && (
                <div className="flex items-center gap-1.5">
                  <span className={`size-1.5 rounded-full ${tamu.statusHadir ? "bg-emerald-500" : "bg-blue-500 animate-pulse"}`} />
                  <span className={`text-[0.6rem] font-semibold ${tamu.statusHadir ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"}`}>
                    {tamu.statusHadir ? "Sudah Hadir" : "QR Aktif"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Redirect ke E-Ticket jika approved */}
      {status === "APPROVED" && (
        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] px-4 py-3 flex items-center gap-2">
          <Ticket className="size-3.5 text-emerald-500/70 dark:text-emerald-400/60" />
          <span className="text-xs text-slate-500 dark:text-white/40">
            Lihat QR tamu di menu <strong className="text-emerald-600 dark:text-emerald-400">E-Ticket</strong>
          </span>
        </div>
      )}
    </motion.div>
  );
}

// --- Form Tamu Entry ----------------------------------------------------------

interface TamuFormEntry {
  nama: string;
  hubungan: string;
}

function TamuFormRow({ entry, index, onChange, onRemove, canRemove }: {
  entry: TamuFormEntry;
  index: number;
  onChange: (index: number, field: keyof TamuFormEntry, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-slate-100 dark:border-white/[0.06] bg-slate-50/30 dark:bg-white/[0.02] p-3.5 space-y-2.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-lg bg-indigo-500/10 dark:bg-indigo-500/15 text-[0.6rem] font-black text-indigo-600 dark:text-indigo-400">
            {index + 1}
          </div>
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 dark:text-white/25">
            Tamu {index + 1}
          </span>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="flex size-7 items-center justify-center rounded-lg text-red-400 dark:text-red-400/60 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors touch-manipulation"
            title="Hapus tamu"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Nama lengkap tamu..."
          value={entry.nama}
          onChange={(e) => onChange(index, "nama", e.target.value)}
          className="w-full h-10 rounded-xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.04] px-3 text-sm text-slate-800 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-white/15 outline-none focus:border-indigo-500/40 dark:focus:border-indigo-500/40 transition-colors"
          maxLength={100}
        />
        <select
          value={entry.hubungan}
          onChange={(e) => onChange(index, "hubungan", e.target.value)}
          className="w-full h-10 rounded-xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.04] px-3 text-sm text-slate-700 dark:text-white/70 outline-none focus:border-indigo-500/40 dark:focus:border-indigo-500/40 transition-colors appearance-none cursor-pointer"
        >
          {HUBUNGAN_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </motion.div>
  );
}

// --- Page ---------------------------------------------------------------------

export default function TamuPage() {
  const [tamuData, setTamuData] = useState<TamuData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [formEntries, setFormEntries] = useState<TamuFormEntry[]>([
    { nama: "", hubungan: "Orang Tua" },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth("/api/portal/tamu");
      const result = await res.json();
      if (result.data) {
        setTamuData(result.data);
        // Isi form jika ada data tamu existing (untuk re-submit saat REJECTED)
        if (result.data.undanganTamu?.length > 0 && result.data.statusPengajuan !== "APPROVED") {
          setFormEntries(
            result.data.undanganTamu.map((t: TamuItem) => ({
              nama: t.namaTamu,
              hubungan: t.hubungan || "Lainnya",
            }))
          );
        }
      }
    } catch {
      toast.error("Gagal memuat data pengajuan tamu");
    } finally {
      setIsLoading(false);
    }
  }

  function handleEntryChange(index: number, field: keyof TamuFormEntry, value: string) {
    setFormEntries((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function handleAddEntry() {
    if (formEntries.length >= MAX_TAMU) return;
    setFormEntries((prev) => [...prev, { nama: "", hubungan: "Orang Tua" }]);
  }

  function handleRemoveEntry(index: number) {
    if (formEntries.length <= 1) return;
    setFormEntries((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Validate
    const emptyNames = formEntries.filter((e) => e.nama.trim().length < 2);
    if (emptyNames.length > 0) {
      toast.error("Setiap nama tamu harus diisi minimal 2 karakter");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth("/api/portal/tamu", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          tamu: formEntries.map((e) => ({
            nama: e.nama.trim(),
            hubungan: e.hubungan,
          })),
        }),
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
      const res = await fetchWithAuth("/api/portal/tamu", { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal membatalkan");
      toast.success("Pengajuan berhasil dibatalkan");
      setFormEntries([{ nama: "", hubungan: "Orang Tua" }]);
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
      <PortalPageHeader
        icon={Users}
        iconClassName="text-indigo-400"
        title="Pengajuan Tamu"
        subtitle="Ajukan jumlah tamu untuk wisuda Anda"
        action={
          <button
            type="button"
            onClick={fetchData}
            className="flex size-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/40 transition-colors touch-manipulation active:bg-white/[0.08]"
            title="Refresh"
            aria-label="Muat ulang"
          >
            <RefreshCw className="size-4" />
          </button>
        }
      />

      {/* Status card */}
      <AnimatePresence mode="wait">
        {status !== "NONE" && (
          <StatusCard
            key={status}
            status={status}
            tamuList={tamuData?.undanganTamu ?? []}
          />
        )}
      </AnimatePresence>

      {/* Form pengajuan */}
      {!isApproved && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-slate-200 bg-white dark:border-white/[0.07] dark:bg-white/[0.03] p-5 space-y-5 shadow-md dark:shadow-xl dark:shadow-black/20"
        >
          <div className="flex items-center gap-2">
            <UserPlus className="size-3.5 text-indigo-500/70 dark:text-indigo-400/60" />
            <p className="text-[0.7rem] font-black uppercase tracking-widest text-slate-400 dark:text-white/25">
              {isPending ? "Daftar Tamu Terkirim" : "Data Tamu Undangan"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form entries */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {formEntries.map((entry, index) => (
                  <TamuFormRow
                    key={index}
                    entry={entry}
                    index={index}
                    onChange={handleEntryChange}
                    onRemove={handleRemoveEntry}
                    canRemove={!isFormDisabled && formEntries.length > 1}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Add button */}
            {!isFormDisabled && formEntries.length < MAX_TAMU && (
              <button
                type="button"
                onClick={handleAddEntry}
                className="flex w-full items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-400 dark:text-white/25 hover:border-indigo-500/30 hover:text-indigo-500 dark:hover:border-indigo-500/30 dark:hover:text-indigo-400 transition-colors touch-manipulation"
              >
                <Plus className="size-3.5" />
                Tambah Tamu ({formEntries.length}/{MAX_TAMU})
              </button>
            )}

            <p className="text-[0.65rem] text-slate-400 dark:text-white/20">
              Maksimal {MAX_TAMU} orang tamu per wisudawan
            </p>

            {/* Sesi info */}
            {tamuData?.sesiWisuda && (
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-white/[0.05] dark:bg-white/[0.02] px-3 py-2.5">
                <span className="size-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
                <span className="text-xs text-slate-500 dark:text-white/35">Sesi wisuda Anda:</span>
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">{tamuData.sesiWisuda}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2.5">
              {isPending ? (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex-1 h-12 rounded-2xl border border-red-200 bg-red-50/50 dark:border-red-500/20 dark:bg-red-500/[0.06] text-sm font-semibold text-red-500 hover:bg-red-100 hover:text-red-600 dark:text-red-400/70 dark:hover:bg-red-500/[0.12] dark:hover:text-red-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
                  className="flex h-12 min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-500/10 dark:border-indigo-500/30 dark:bg-indigo-500/15 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
        className="flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-slate-100/40 dark:border-white/[0.05] dark:bg-white/[0.02] p-3.5"
      >
        <AlertTriangle className="size-4 text-slate-400 dark:text-white/15 shrink-0 mt-0.5" />
        <p className="text-[0.68rem] text-slate-500 dark:text-white/22 leading-relaxed">
          Pengajuan tamu akan ditinjau oleh admin. Setelah disetujui, QR undangan untuk masing-masing tamu akan otomatis digenerate dan bisa diakses di menu E-Ticket.
        </p>
      </motion.div>
    </div>
  );
}
