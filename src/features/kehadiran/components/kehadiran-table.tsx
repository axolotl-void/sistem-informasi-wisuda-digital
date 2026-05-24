"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, RotateCcw, ClipboardList, Loader2, UserCheck, RefreshCw } from "lucide-react";
import { useKehadiranStore } from "@/store/kehadiran.store";

// --- Status Config ------------------------------------------------------------
const statusCfg: Record<string, { label: string; pill: string; dot: string }> = {
  HADIR: {
    label: "Hadir",
    pill: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ring-1 ring-emerald-500/10",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]",
  },
  TERLAMBAT: {
    label: "Terlambat",
    pill: "bg-amber-500/10 text-amber-400 border-amber-500/20 ring-1 ring-amber-500/10",
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]",
  },
  TIDAK_HADIR: {
    label: "Belum Hadir",
    pill: "bg-rose-500/10 text-rose-400 border-rose-500/20 ring-1 ring-rose-500/10",
    dot: "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]",
  },
};

export function KehadiranTable() {
  const {
    data,
    isLoading,
    page,
    limit,
    total,
    totalPages,
    setPage,
    setLimit,
    manualCheckIn,
    resetCheckIn,
    fetchData,
    search,
    statusFilter,
    fakultasFilter,
    sesiFilter,
  } = useKehadiranStore();

  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Sync data whenever filters or pagination parameters change
  useEffect(() => {
    fetchData();
  }, [fetchData, search, statusFilter, fakultasFilter, sesiFilter, page, limit]);

  const formatTime = (dateInput: Date | string | null) => {
    if (!dateInput) return "—";
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return "—";
    }
  };

  const handleCheckIn = async (mahasiswaId: string) => {
    setActionLoading((prev) => ({ ...prev, [mahasiswaId]: true }));
    try {
      await manualCheckIn(mahasiswaId, "HADIR");
    } catch (err) {
      console.error("Check-in failed:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [mahasiswaId]: false }));
    }
  };

  const handleReset = async (mahasiswaId: string) => {
    setActionLoading((prev) => ({ ...prev, [mahasiswaId]: true }));
    try {
      await resetCheckIn(mahasiswaId);
    } catch (err) {
      console.error("Reset failed:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [mahasiswaId]: false }));
    }
  };

  return (
    <div className="relative z-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[800px]">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="py-3.5 pl-5 pr-3 text-[0.68rem] font-bold uppercase tracking-wider text-white/30">NIM</th>
              <th className="py-3.5 px-4 text-[0.68rem] font-bold uppercase tracking-wider text-white/30">Nama</th>
              <th className="py-3.5 px-4 text-[0.68rem] font-bold uppercase tracking-wider text-white/30">Fakultas</th>
              <th className="py-3.5 px-4 text-[0.68rem] font-bold uppercase tracking-wider text-white/30">Sesi</th>
              <th className="py-3.5 px-4 text-[0.68rem] font-bold uppercase tracking-wider text-white/30">Waktu Scan</th>
              <th className="py-3.5 px-4 text-[0.68rem] font-bold uppercase tracking-wider text-white/30">Petugas/Gate</th>
              <th className="py-3.5 px-4 text-[0.68rem] font-bold uppercase tracking-wider text-white/30">Status</th>
              <th className="py-3.5 pr-5 pl-4 text-center text-[0.68rem] font-bold uppercase tracking-wider text-white/30">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {isLoading && data.length === 0 ? (
              // Loading Skeleton State
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse bg-white/[0.005]">
                  <td className="py-4 pl-5 pr-3"><div className="h-3 w-16 rounded bg-white/10" /></td>
                  <td className="py-4 px-4"><div className="h-3.5 w-32 rounded bg-white/10" /></td>
                  <td className="py-4 px-4"><div className="h-3 w-24 rounded bg-white/10" /></td>
                  <td className="py-4 px-4"><div className="h-3 w-12 rounded bg-white/10" /></td>
                  <td className="py-4 px-4"><div className="h-3 w-16 rounded bg-white/10" /></td>
                  <td className="py-4 px-4"><div className="h-3 w-16 rounded bg-white/10" /></td>
                  <td className="py-4 px-4"><div className="h-5 w-20 rounded-full bg-white/10" /></td>
                  <td className="py-4 pr-5 pl-4"><div className="mx-auto h-7 w-24 rounded-lg bg-white/10" /></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center space-y-3"
                  >
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] text-white/15">
                      <ClipboardList className="size-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/60">Tidak Ada Data Kehadiran</p>
                      <p className="text-xs text-white/30 mt-0.5">Silakan sesuaikan filter pencarian Anda</p>
                    </div>
                  </motion.div>
                </td>
              </tr>
            ) : (
              // Active Data Rows
              <AnimatePresence mode="popLayout">
                {data.map((k, i) => {
                  const cfg = statusCfg[k.statusKehadiran] ?? statusCfg.TIDAK_HADIR;
                  const isRowLoading = actionLoading[k.mahasiswaId];
                  const shortFakultas = k.mahasiswa?.fakultas
                    ? k.mahasiswa.fakultas.includes("FKIP")
                      ? "FKIP"
                      : k.mahasiswa.fakultas.includes("FSTIK")
                      ? "FSTIK"
                      : k.mahasiswa.fakultas
                    : "—";

                  return (
                    <motion.tr
                      key={k.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.015, 0.2) }}
                      className={`transition-colors hover:bg-white/[0.015] ${
                        k.statusKehadiran !== "TIDAK_HADIR" ? "bg-white/[0.005]" : ""
                      }`}
                    >
                      {/* NIM */}
                      <td className="py-3.5 pl-5 pr-3">
                        <span className="font-mono text-xs font-semibold text-white/40 tracking-wider">
                          {k.mahasiswa?.nim ?? "—"}
                        </span>
                      </td>

                      {/* Nama */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-bold text-white/80">
                          {k.mahasiswa?.nama ?? "—"}
                        </span>
                      </td>

                      {/* Fakultas */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-white/50">
                        {shortFakultas}
                      </td>

                      {/* Sesi */}
                      <td className="py-3.5 px-4">
                        <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[0.68rem] font-semibold text-white/40">
                          {k.mahasiswa?.sesiWisuda ?? "Sesi 1"}
                        </span>
                      </td>

                      {/* Waktu Scan */}
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-white/40 tabular-nums">
                        {formatTime(k.waktuScan)}
                      </td>

                      {/* Petugas / Gate */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-white/50">
                        {k.petugasId ?? "—"}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.68rem] font-semibold tracking-wide ${cfg.pill}`}>
                          <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Action Column */}
                      <td className="py-3.5 pr-5 pl-4 align-middle text-center">
                        {k.statusKehadiran === "TIDAK_HADIR" ? (
                          // Mark Present Button
                          <button
                            type="button"
                            onClick={() => handleCheckIn(k.mahasiswaId)}
                            disabled={isRowLoading}
                            className="inline-flex h-7 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.08] px-2.5 text-[0.68rem] font-bold text-emerald-400 transition-all duration-150 hover:border-emerald-500/40 hover:bg-emerald-500/[0.15] hover:text-emerald-300 active:scale-[0.96] disabled:opacity-50 cursor-pointer"
                          >
                            {isRowLoading ? (
                              <Loader2 className="size-3 animate-spin text-emerald-400" />
                            ) : (
                              <UserCheck className="size-3" />
                            )}
                            Hadir Manual
                          </button>
                        ) : (
                          // Reset Check-in Button
                          <button
                            type="button"
                            onClick={() => handleReset(k.mahasiswaId)}
                            disabled={isRowLoading}
                            className="inline-flex h-7 items-center justify-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.04] px-2.5 text-[0.68rem] font-bold text-white/40 transition-all duration-150 hover:border-rose-500/20 hover:bg-rose-500/[0.1] hover:text-rose-400 active:scale-[0.96] disabled:opacity-50 cursor-pointer"
                          >
                            {isRowLoading ? (
                              <Loader2 className="size-3 animate-spin text-rose-400" />
                            ) : (
                              <RotateCcw className="size-3" />
                            )}
                            Batal
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Glassmorphism Pagination controls */}
      <div className="border-t border-white/[0.06] bg-white/[0.01] px-5 py-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 text-xs font-semibold text-white/30">
          <span>
            Total: <strong className="text-white/60 tabular-nums">{total}</strong> wisudawan
          </span>
          <div className="flex items-center gap-1.5">
            <span>Tampilkan:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-[#07111F] border border-white/[0.08] rounded-lg text-xs font-bold text-white/60 px-2 py-1 outline-none focus:border-emerald-500/50 cursor-pointer hover:bg-white/[0.02]"
            >
              <option value={10} className="bg-[#0F172A]">10 Baris</option>
              <option value={25} className="bg-[#0F172A]">25 Baris</option>
              <option value={50} className="bg-[#0F172A]">50 Baris</option>
              <option value={100} className="bg-[#0F172A]">100 Baris</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-start gap-3">
          <button
            type="button"
            disabled={page === 1 || isLoading}
            onClick={() => setPage(page - 1)}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-xs font-bold text-white/60 transition-all hover:bg-white/[0.06] active:scale-[0.97] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            Prev
          </button>
          
          <span className="text-xs text-white/40 font-bold tabular-nums">
            Halaman <strong className="text-white/70">{page}</strong> dari <strong className="text-white/70">{totalPages || 1}</strong>
          </span>

          <button
            type="button"
            disabled={page === totalPages || totalPages === 0 || isLoading}
            onClick={() => setPage(page + 1)}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-xs font-bold text-white/60 transition-all hover:bg-white/[0.06] active:scale-[0.97] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
