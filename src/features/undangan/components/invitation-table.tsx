"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, RefreshCw, Download, Trash2 } from "lucide-react";
import { useUndanganStore } from "../store";
import { StatusBadge, AttendanceBadge } from "./status-badge";
import { QrCell } from "./qr-cell";
import { EmptyState } from "./empty-state";
import { LoadingSkeleton } from "./loading-skeleton";
import type { Invitation } from "../types";

// ─── Delete Row Confirmation ──────────────────────────────────────────────────

function DeleteRowDialog({
  open,
  nama,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  nama: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-gray-200 bg-white dark:border-white/[0.08] dark:bg-[#0F172A] p-6 shadow-2xl">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10">
          <Trash2 className="size-4 text-red-500 dark:text-red-400" />
        </div>
        <h2 className="text-sm font-bold text-gray-900 dark:text-white/90">Hapus Undangan?</h2>
        <p className="mt-1.5 text-[0.78rem] leading-relaxed text-gray-500 dark:text-white/40">
          Undangan milik <span className="font-semibold text-gray-800 dark:text-white/70">{nama}</span> akan dihapus permanen.
        </p>
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-9 rounded-xl border border-gray-200 bg-gray-50 text-[0.78rem] font-semibold text-gray-600 transition-all hover:bg-gray-100 active:scale-[0.98] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/60 dark:hover:bg-white/[0.07]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-9 rounded-xl border border-red-300 bg-red-50 text-[0.78rem] font-bold text-red-600 transition-all hover:bg-red-100 active:scale-[0.98] dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Action Menu ─────────────────────────────────────────────────────────────

function ActionMenu({ inv }: { inv: Invitation }) {
  const { openDrawer, generateInvitation, markDownloaded, deleteInvitation } = useUndanganStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDownload(id: string) {
    markDownloaded(id);
    console.log("Download undangan:", id);
  }

  function handleDeleteConfirm() {
    deleteInvitation(inv.id);
    setConfirmDelete(false);
  }

  return (
    <>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {/* QR Detail */}
        <button
          type="button"
          onClick={() => openDrawer(inv)}
          className="flex size-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 cursor-pointer dark:text-white/30 dark:hover:bg-white/[0.08] dark:hover:text-white/70"
          title="Detail QR"
        >
          <QrCode className="size-3.5" />
        </button>

        {/* Generate (hanya jika belum generate) */}
        {inv.status === "belum_generate" && (
          <button
            type="button"
            onClick={() => generateInvitation(inv.id)}
            className="flex size-7 items-center justify-center rounded-lg text-blue-400/70 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer dark:text-blue-400/50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
            title="Generate QR"
          >
            <RefreshCw className="size-3.5" />
          </button>
        )}

        {/* Download (hanya jika sudah generate) */}
        {inv.status !== "belum_generate" && (
          <button
            type="button"
            onClick={() => handleDownload(inv.id)}
            className="flex size-7 items-center justify-center rounded-lg text-emerald-500/70 transition-colors hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer dark:text-emerald-400/50 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
            title="Download Undangan"
          >
            <Download className="size-3.5" />
          </button>
        )}

        {/* Hapus */}
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="flex size-7 items-center justify-center rounded-lg text-red-400/60 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer dark:text-red-400/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          title="Hapus Undangan"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <DeleteRowDialog
        open={confirmDelete}
        nama={inv.mahasiswaNama}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────

function TableRow({ inv, index }: { inv: Invitation; index: number }) {
  const { openDrawer, openPreview } = useUndanganStore();

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      onClick={() => openPreview(inv)}
      className="group border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50 cursor-pointer dark:border-white/[0.04] dark:hover:bg-white/[0.025]"
    >
      {/* QR Preview */}
      <td className="py-3 pl-4 pr-3">
        <div
          onClick={(e) => {
            e.stopPropagation();
            openDrawer(inv);
          }}
          className="cursor-pointer"
        >
          {inv.status !== "belum_generate" ? (
            <QrCell token={inv.qrToken} size={36} />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-md border border-dashed border-gray-300 dark:border-white/[0.08]">
              <QrCode className="size-4 text-gray-300 dark:text-white/15" />
            </div>
          )}
        </div>
      </td>

      {/* Kode */}
      <td className="py-3 pr-4">
        <span className="font-mono text-[0.72rem] font-medium text-gray-500 dark:text-white/50">
          {inv.kode}
        </span>
      </td>

      {/* Mahasiswa */}
      <td className="py-3 pr-4">
        <div>
          <p className="text-[0.82rem] font-semibold text-gray-800 leading-tight dark:text-white/80">
            {inv.mahasiswaNama}
          </p>
          <p className="text-[0.68rem] font-medium text-gray-400 mt-0.5 dark:text-white/30">{inv.nim}</p>
        </div>
      </td>

      {/* Fakultas */}
      <td className="hidden py-3 pr-4 lg:table-cell">
        <div>
          <p className="text-[0.75rem] font-medium text-gray-600 leading-tight dark:text-white/50">{inv.fakultas}</p>
          <p className="text-[0.65rem] text-gray-400 mt-0.5 dark:text-white/25">{inv.prodi}</p>
        </div>
      </td>

      {/* Sesi */}
      <td className="hidden py-3 pr-4 md:table-cell">
        <span className="text-[0.72rem] font-medium text-gray-500 dark:text-white/40">{inv.sesi}</span>
      </td>

      {/* Kursi */}
      <td className="hidden py-3 pr-4 xl:table-cell">
        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[0.7rem] font-medium text-gray-600 dark:bg-white/[0.05] dark:text-white/50">
          {inv.nomorKursi}
        </span>
      </td>

      {/* Kuota Tamu */}
      <td className="hidden py-3 pr-4 xl:table-cell">
        <div className="flex items-center gap-1.5">
          <span className="text-[0.75rem] font-semibold text-gray-700 dark:text-white/60">{inv.tamuHadir}</span>
          <span className="text-[0.65rem] text-gray-300 dark:text-white/20">/</span>
          <span className="text-[0.72rem] text-gray-400 dark:text-white/35">{inv.kuotaTamu}</span>
        </div>
      </td>

      {/* Status QR */}
      <td className="py-3 pr-4">
        <StatusBadge status={inv.status} />
      </td>

      {/* Attendance */}
      <td className="hidden py-3 pr-4 sm:table-cell">
        <AttendanceBadge status={inv.attendance} />
      </td>

      {/* Actions */}
      <td className="py-3 pr-4" onClick={(e) => e.stopPropagation()}>
        <ActionMenu inv={inv} />
      </td>
    </motion.tr>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────

export function InvitationTable() {
  const {
    invitations,
    isLoading,
    searchQuery,
    filterStatus,
    filterSesi,
    filterAttendance,
  } = useUndanganStore();

  const filtered = (invitations || []).filter((inv) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchNama = inv.mahasiswaNama?.toLowerCase().includes(q);
      const matchNim = inv.nim?.includes(q);
      const matchKode = inv.kode?.toLowerCase().includes(q);
      if (!matchNama && !matchNim && !matchKode) return false;
    }
    if (filterStatus && filterStatus !== "all") {
      if (inv.status !== filterStatus) return false;
    }
    if (filterSesi && filterSesi !== "all") {
      const sessionKeyword = filterSesi.replace("Sesi ", "");
      if (!inv.sesi || !inv.sesi.toLowerCase().includes(sessionKeyword.toLowerCase())) {
        return false;
      }
    }
    if (filterAttendance && filterAttendance !== "all") {
      if (inv.attendance !== filterAttendance) return false;
    }
    return true;
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div id="invitation-table-print" className="rounded-2xl border border-gray-200 bg-white dark:border-white/[0.07] dark:bg-[#080f1e] overflow-hidden shadow-sm dark:shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 dark:border-white/[0.06] dark:bg-white/[0.02]">
              {[
                { label: "QR", cls: "pl-4 pr-3 w-12" },
                { label: "Kode", cls: "pr-4" },
                { label: "Mahasiswa", cls: "pr-4" },
                { label: "Fakultas", cls: "pr-4 hidden lg:table-cell" },
                { label: "Sesi", cls: "pr-4 hidden md:table-cell" },
                { label: "Kursi", cls: "pr-4 hidden xl:table-cell" },
                { label: "Tamu", cls: "pr-4 hidden xl:table-cell" },
                { label: "Status QR", cls: "pr-4" },
                { label: "Kehadiran", cls: "pr-4 hidden sm:table-cell" },
                { label: "", cls: "pr-4 w-28" },
              ].map((h) => (
                <th
                  key={h.label}
                  className={`py-3 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/20 ${h.cls}`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                filtered.map((inv, i) => (
                  <TableRow key={inv.id} inv={inv} index={i} />
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3 dark:border-white/[0.04]">
          <p className="text-[0.7rem] font-medium text-gray-400 dark:text-white/20">
            Menampilkan {filtered.length} undangan
          </p>
        </div>
      )}
    </div>
  );
}
