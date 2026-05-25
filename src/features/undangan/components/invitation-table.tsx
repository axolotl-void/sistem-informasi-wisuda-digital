"use client";

import { memo, useState } from "react";
import { QrCode, RefreshCw, Download, Trash2 } from "lucide-react";
import { useUndanganStore } from "../store";
import { StatusBadge, AttendanceBadge } from "./status-badge";
import { QrCell } from "./qr-cell";
import { EmptyState } from "./empty-state";
import { LoadingSkeleton } from "./loading-skeleton";
import type { Invitation } from "../types";
import {
  LiquidGlassCard,
  glassBtnGhost,
} from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";

const glassBtnDanger = cn(
  glassBtnGhost,
  "border-red-400/35 bg-red-500/10 text-red-700",
  "dark:border-red-500/30 dark:text-red-300",
);

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
      <div
        className="absolute inset-0 bg-black/55"
        onClick={onCancel}
      />
      <LiquidGlassCard hover={false} className="relative z-10 w-full max-w-sm p-6">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-red-400/30 bg-red-500/10 dark:border-red-500/25">
          <Trash2 className="size-4 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white/90">
          Hapus Undangan?
        </h2>
        <p className="mt-1.5 text-[0.78rem] leading-relaxed text-slate-600 dark:text-white/45">
          Undangan milik{" "}
          <span className="font-semibold text-slate-800 dark:text-white/75">{nama}</span>{" "}
          akan dihapus permanen.
        </p>
        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className={cn(glassBtnGhost, "h-9 flex-1 justify-center")}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(glassBtnDanger, "h-9 flex-1 justify-center font-bold")}
          >
            Hapus
          </button>
        </div>
      </LiquidGlassCard>
    </div>
  );
}

function ActionMenu({ inv }: { inv: Invitation }) {
  const { openDrawer, generateInvitation, markDownloaded, deleteInvitation } =
    useUndanganStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDownload(id: string) {
    markDownloaded(id);
  }

  function handleDeleteConfirm() {
    deleteInvitation(inv.id);
    setConfirmDelete(false);
  }

  const actionBtn = cn(
    glassBtnGhost,
    "size-7 justify-center p-0 hover:scale-100",
  );

  return (
    <>
      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => openDrawer(inv)}
          className={actionBtn}
          title="Detail QR"
        >
          <QrCode className="size-3.5" />
        </button>

        {inv.status === "belum_generate" && (
          <button
            type="button"
            onClick={() => generateInvitation(inv.id)}
            className={cn(actionBtn, "text-blue-600 dark:text-blue-400")}
            title="Generate QR"
          >
            <RefreshCw className="size-3.5" />
          </button>
        )}

        {inv.status !== "belum_generate" && (
          <button
            type="button"
            onClick={() => handleDownload(inv.id)}
            className={cn(actionBtn, "text-emerald-600 dark:text-emerald-400")}
            title="Download Undangan"
          >
            <Download className="size-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className={cn(actionBtn, "text-red-600 dark:text-red-400")}
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

const TableRow = memo(function TableRow({ inv }: { inv: Invitation }) {
  const { openDrawer, openPreview } = useUndanganStore();

  return (
    <tr
      onClick={() => openPreview(inv)}
      className={cn(
        "group cursor-pointer border-b border-white/40 last:border-0",
        "hover:bg-white/50 dark:border-white/[0.05] dark:hover:bg-white/[0.04]",
      )}
    >
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
            <div className="flex size-9 items-center justify-center rounded-md border border-dashed border-white/80 bg-white/40 dark:border-white/[0.12] dark:bg-white/[0.03]">
              <QrCode className="size-4 text-slate-300 dark:text-white/15" />
            </div>
          )}
        </div>
      </td>

      <td className="py-3 pr-4">
        <span className="font-mono text-[0.72rem] font-medium text-slate-500 dark:text-white/50">
          {inv.kode}
        </span>
      </td>

      <td className="py-3 pr-4">
        <div>
          <p className="text-[0.82rem] font-semibold leading-tight text-slate-800 dark:text-white/85">
            {inv.mahasiswaNama}
          </p>
          <p className="mt-0.5 text-[0.68rem] font-medium text-slate-500 dark:text-white/35">
            {inv.nim}
          </p>
        </div>
      </td>

      <td className="hidden py-3 pr-4 lg:table-cell">
        <div>
          <p className="text-[0.75rem] font-medium leading-tight text-slate-600 dark:text-white/55">
            {inv.fakultas}
          </p>
          <p className="mt-0.5 text-[0.65rem] text-slate-400 dark:text-white/28">
            {inv.prodi}
          </p>
        </div>
      </td>

      <td className="hidden py-3 pr-4 md:table-cell">
        <span className="text-[0.72rem] font-medium text-slate-500 dark:text-white/45">
          {inv.sesi}
        </span>
      </td>

      <td className="hidden py-3 pr-4 xl:table-cell">
        <span className="rounded-md border border-white/70 bg-white/80 px-2 py-0.5 font-mono text-[0.7rem] font-medium text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white/55">
          {inv.nomorKursi}
        </span>
      </td>

      <td className="hidden py-3 pr-4 xl:table-cell">
        <div className="flex items-center gap-1.5">
          <span className="text-[0.75rem] font-semibold text-slate-700 dark:text-white/65">
            {inv.tamuHadir}
          </span>
          <span className="text-[0.65rem] text-slate-300 dark:text-white/20">/</span>
          <span className="text-[0.72rem] text-slate-500 dark:text-white/40">
            {inv.kuotaTamu}
          </span>
        </div>
      </td>

      <td className="py-3 pr-4">
        <StatusBadge status={inv.status} />
      </td>

      <td className="hidden py-3 pr-4 sm:table-cell">
        <AttendanceBadge status={inv.attendance} />
      </td>

      <td className="py-3 pr-4" onClick={(e) => e.stopPropagation()}>
        <ActionMenu inv={inv} />
      </td>
    </tr>
  );
});

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

  const headers = [
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
  ];

  return (
    <LiquidGlassCard
      id="invitation-table-print"
      noEntrance
      hover={false}
      className="overflow-hidden p-0"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-white/60 bg-white/30 dark:border-white/[0.08] dark:bg-white/[0.03]">
              {headers.map((h) => (
                <th
                  key={h.label || "actions"}
                  className={cn(
                    "py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/30",
                    h.cls,
                  )}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10}>
                  <EmptyState />
                </td>
              </tr>
            ) : (
              filtered.map((inv) => <TableRow key={inv.id} inv={inv} />)
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="border-t border-white/50 px-4 py-3 dark:border-white/[0.06]">
          <p className="text-[0.7rem] font-medium text-slate-500 dark:text-white/25">
            Menampilkan {filtered.length} undangan
          </p>
        </div>
      )}
    </LiquidGlassCard>
  );
}
