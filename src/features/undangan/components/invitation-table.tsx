"use client";

import { memo, useState, useMemo, useEffect, useCallback } from "react";
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
import { AnimatedList } from "@/components/ui/animated-list";
import { cn } from "@/lib/utils";

const glassBtnDanger = cn(
  glassBtnGhost,
  "border-red-400/35 bg-red-500/10 text-red-700",
  "dark:border-red-500/30 dark:text-red-300",
);

/** Satu baris — layout flex sama seperti tabel sebelumnya (min-w 800px) */
const ROW_FLEX =
  "flex w-full min-w-[800px] items-center border-b border-white/40 last:border-0 hover:bg-white/50 dark:border-white/[0.05] dark:hover:bg-white/[0.04]";

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
      <div className="absolute inset-0 bg-black/55" onClick={onCancel} />
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
      <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
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

function TamuDetailsModal({
  open,
  mahasiswaNama,
  tamuList,
  onClose,
}: {
  open: boolean;
  mahasiswaNama: string;
  tamuList: any[];
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <LiquidGlassCard hover={false} className="relative z-10 w-full max-w-md p-6 overflow-hidden border border-white/20 dark:border-white/[0.08] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white/90">
              Detail Tamu Undangan
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-white/35 mt-0.5">
              Wisudawan: <span className="font-semibold text-slate-700 dark:text-white/60">{mahasiswaNama}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-400 dark:text-white/30 transition-colors"
          >
            <span className="text-sm">✕</span>
          </button>
        </div>

        {tamuList.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-slate-400 dark:text-white/25">Tidak ada data tamu untuk wisudawan ini.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
            {tamuList.map((tamu, idx) => (
              <div
                key={tamu.id || idx}
                className="rounded-xl border border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.02] p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-white/80">{tamu.namaTamu}</p>
                  <p className="text-[10px] text-slate-400 dark:text-white/30">{tamu.hubungan} · {tamu.kode}</p>
                  {tamu.waktuScan && (
                    <p className="text-[9px] text-slate-400 dark:text-white/20 mt-0.5">
                      Masuk: {new Date(tamu.waktuScan).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`size-1.5 rounded-full ${tamu.statusHadir ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/20"}`} />
                  <span className={`text-[10px] font-semibold ${tamu.statusHadir ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-white/30"}`}>
                    {tamu.statusHadir ? "Hadir" : "Belum Hadir"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={cn(glassBtnGhost, "h-9 px-4 justify-center font-semibold text-xs")}
          >
            Tutup
          </button>
        </div>
      </LiquidGlassCard>
    </div>
  );
}

const InvitationRow = memo(function InvitationRow({ inv }: { inv: Invitation }) {
  const { openDrawer, openPreview } = useUndanganStore();
  const [showTamuModal, setShowTamuModal] = useState(false);

  return (
    <div
      role="row"
      onClick={() => openPreview(inv)}
      className={cn(ROW_FLEX, "group cursor-pointer text-[13px]")}
    >
      <div className="w-12 shrink-0 py-3 pl-4 pr-3">
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
      </div>

      <div className="min-w-[88px] shrink-0 py-3 pr-4">
        <span className="font-mono text-[0.72rem] font-medium text-slate-500 dark:text-white/50">
          {inv.kode}
        </span>
      </div>

      <div className="min-w-[120px] flex-1 py-3 pr-4">
        <p className="text-[0.82rem] font-semibold leading-tight text-slate-800 dark:text-white/85">
          {inv.mahasiswaNama}
        </p>
        <p className="mt-0.5 text-[0.68rem] font-medium text-slate-500 dark:text-white/35">
          {inv.nim}
        </p>
      </div>

      <div className="hidden min-w-[140px] flex-1 py-3 pr-4 lg:block">
        <p className="truncate text-[0.75rem] font-medium leading-tight text-slate-600 dark:text-white/55">
          {inv.fakultas}
        </p>
        <p className="mt-0.5 truncate text-[0.65rem] text-slate-400 dark:text-white/28">
          {inv.prodi}
        </p>
      </div>

      <div className="hidden w-24 shrink-0 py-3 pr-4 md:block">
        <span className="text-[0.72rem] font-medium text-slate-500 dark:text-white/45">
          {inv.sesi}
        </span>
      </div>

      <div className="hidden w-20 shrink-0 py-3 pr-4 xl:block">
        <span className="rounded-md border border-white/70 bg-white/80 px-2 py-0.5 font-mono text-[0.7rem] font-medium text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white/55">
          {inv.nomorKursi}
        </span>
      </div>

      <div 
        className="hidden w-16 shrink-0 py-3 pr-4 xl:block cursor-pointer hover:underline decoration-dashed decoration-indigo-500 underline-offset-4"
        onClick={(e) => {
          e.stopPropagation();
          setShowTamuModal(true);
        }}
        title="Klik untuk detail tamu"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[0.75rem] font-semibold text-slate-700 dark:text-white/65">
            {inv.tamuHadir}
          </span>
          <span className="text-[0.65rem] text-slate-300 dark:text-white/20">/</span>
          <span className="text-[0.72rem] text-slate-500 dark:text-white/40">
            {inv.kuotaTamu}
          </span>
        </div>
      </div>

      <div className="w-24 shrink-0 py-3 pr-4">
        <StatusBadge status={inv.status} />
      </div>

      <div className="hidden w-24 shrink-0 py-3 pr-4 sm:block">
        <AttendanceBadge status={inv.attendance} />
      </div>

      <div
        className="w-28 shrink-0 py-3 pr-4"
        onClick={(e) => e.stopPropagation()}
      >
        <ActionMenu inv={inv} />
      </div>

      <TamuDetailsModal
        open={showTamuModal}
        mahasiswaNama={inv.mahasiswaNama}
        tamuList={inv.undanganTamu || []}
        onClose={() => setShowTamuModal(false)}
      />
    </div>
  );
});

const TABLE_HEADERS: { label: string; cls: string }[] = [
  { label: "QR", cls: "w-12 shrink-0 pl-4 pr-3" },
  { label: "Kode", cls: "min-w-[88px] shrink-0 pr-4" },
  { label: "Mahasiswa", cls: "min-w-[120px] flex-1 pr-4" },
  { label: "Fakultas", cls: "hidden min-w-[140px] flex-1 pr-4 lg:block" },
  { label: "Sesi", cls: "hidden w-24 shrink-0 pr-4 md:block" },
  { label: "Kursi", cls: "hidden w-20 shrink-0 pr-4 xl:block" },
  { label: "Tamu", cls: "hidden w-16 shrink-0 pr-4 xl:block" },
  { label: "Status QR", cls: "w-24 shrink-0 pr-4" },
  { label: "Kehadiran", cls: "hidden w-24 shrink-0 pr-4 sm:block" },
  { label: "", cls: "w-28 shrink-0 pr-4" },
];

export function InvitationTable() {
  const {
    invitations,
    isLoading,
    searchQuery,
    filterStatus,
    filterSesi,
    filterAttendance,
  } = useUndanganStore();

  const [visibleCount, setVisibleCount] = useState(15);

  const filtered = useMemo(
    () =>
      (invitations || []).filter((inv) => {
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
          if (
            !inv.sesi ||
            !inv.sesi.toLowerCase().includes(sessionKeyword.toLowerCase())
          ) {
            return false;
          }
        }
        if (filterAttendance && filterAttendance !== "all") {
          if (inv.attendance !== filterAttendance) return false;
        }
        return true;
      }),
    [invitations, searchQuery, filterStatus, filterSesi, filterAttendance],
  );

  // Reset page size when filter or search changes data length
  useEffect(() => {
    setVisibleCount(15);
  }, [filtered.length]);

  const loadMore = useCallback(() => {
    if (visibleCount < filtered.length) {
      setVisibleCount((prev) => Math.min(prev + 15, filtered.length));
    }
  }, [visibleCount, filtered.length]);

  const visibleData = filtered.slice(0, visibleCount);

  const listKey = [searchQuery, filterStatus, filterSesi, filterAttendance].join(
    "|",
  );

  if (isLoading) return <LoadingSkeleton />;

  if (filtered.length === 0) {
    return (
      <LiquidGlassCard
        id="invitation-table-print"
        noEntrance
        hover={false}
        className="overflow-hidden p-0"
      >
        <EmptyState />
      </LiquidGlassCard>
    );
  }

  const tableHeader = (
    <div
      className={cn(
        ROW_FLEX,
        "border-b border-white/60 bg-white/90 backdrop-blur-sm dark:border-white/[0.08] dark:bg-[#0f1a2e]/98",
      )}
    >
      {TABLE_HEADERS.map((h) => (
        <div
          key={h.label || "actions"}
          className={cn(
            "py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/30",
            h.cls,
          )}
        >
          {h.label}
        </div>
      ))}
    </div>
  );

  const listItems = visibleData.map((inv) => <InvitationRow key={inv.id} inv={inv} />);

  return (
    <LiquidGlassCard
      id="invitation-table-print"
      noEntrance
      hover={false}
      className="overflow-hidden p-0"
    >
      <div className="overflow-x-auto">
        <AnimatedList
          key={listKey}
          items={listItems}
          itemKeys={visibleData.map((inv) => inv.id)}
          header={tableHeader}
          showGradients
          enableArrowNavigation={false}
          displayScrollbar
          itemEnterDelay={0.035} // Staggered delays
          inViewAmount={0.05}
          maxHeight="min(72vh, 680px)"
          itemClassName="!m-0 !rounded-none"
          className="min-w-0"
          onScrollBottom={loadMore}
        />
      </div>

      <div className="border-t border-white/50 bg-white/40 px-5 py-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
        <p className="text-[11px] font-medium text-slate-500 dark:text-white/35">
          Menampilkan <span className="font-semibold text-slate-700 dark:text-white/55">{Math.min(visibleCount, filtered.length)}</span> dari <span className="font-semibold text-slate-700 dark:text-white/55">{filtered.length}</span> undangan
          {visibleCount < filtered.length && (
            <span className="text-slate-400 dark:text-white/20"> · scroll ke bawah untuk melihat lebih banyak</span>
          )}
        </p>
      </div>
    </LiquidGlassCard>
  );
}
