"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AccountStats } from "@/features/mahasiswa/components/account-stats";
import { AccountToolbar } from "@/features/mahasiswa/components/account-toolbar";
import { StudentTable } from "@/features/mahasiswa/components/student-table";
import { EditModal } from "@/features/mahasiswa/components/edit-modal";
import { CreateAccountModal } from "@/features/mahasiswa/components/create-modal";
import { DeleteConfirmModal } from "@/features/mahasiswa/components/delete-modal";
import { ResetPasswordModal } from "@/features/mahasiswa/components/reset-password-modal";
import { ImportExportButtons } from "@/features/mahasiswa/components/import-export-buttons";
import { useWisudawan } from "@/hooks/use-wisudawan";
import type { WisudawanRow } from "@/services/wisudawan.service";
import { glassBtnPrimary, glassBtnGhost, LiquidGlassCard } from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";

const glassBtnDanger = cn(
  glassBtnGhost,
  "border-red-400/35 bg-red-500/10 text-red-700 hover:bg-red-500/15",
  "dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/18",
);

function DeleteAllDialog({
  open,
  onConfirm,
  onCancel,
  count,
  isDeleting,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  count: number;
  isDeleting: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/55"
        onClick={!isDeleting ? onCancel : undefined}
      />
      <LiquidGlassCard hover={false} className="relative z-10 w-full max-w-md p-6">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/10 dark:border-red-500/25 dark:bg-red-500/10">
          <Trash2 className="size-5 text-red-600 dark:text-red-400" />
        </div>

        <h2 className="text-base font-bold text-slate-900 dark:text-white/90">
          Hapus Semua Akun Wisudawan?
        </h2>
        <p className="mt-2 text-[0.82rem] leading-relaxed text-slate-600 dark:text-white/45">
          Anda akan menghapus{" "}
          <span className="font-semibold text-red-600 dark:text-red-400">{count} akun wisudawan</span> beserta seluruh data kehadiran, undangan, dan user login terkait.
          Tindakan ini tidak dapat dibatalkan dan semua data akan hilang permanen.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className={cn(glassBtnGhost, "h-10 flex-1 justify-center disabled:opacity-40")}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={cn(glassBtnDanger, "h-10 flex-1 justify-center font-bold disabled:opacity-60")}
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus Semua"}
          </button>
        </div>
      </LiquidGlassCard>
    </div>
  );
}

function BulkVerifyDialog({
  open,
  onConfirm,
  onCancel,
  count,
  isVerifying,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  count: number;
  isVerifying: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/55"
        onClick={!isVerifying ? onCancel : undefined}
      />
      <LiquidGlassCard hover={false} className="relative z-10 w-full max-w-md p-6">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/10 dark:border-emerald-500/25 dark:bg-emerald-500/10">
          <Sparkles className="size-5 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h2 className="text-base font-bold text-slate-900 dark:text-white/90">
          Verifikasi Massal Akun Wisudawan?
        </h2>
        <p className="mt-2 text-[0.82rem] leading-relaxed text-slate-600 dark:text-white/45 font-semibold">
          Anda akan memverifikasi (menyetujui) sebanyak{" "}
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{count} akun wisudawan</span> yang saat ini berstatus <span className="font-extrabold text-blue-600 dark:text-blue-400">Aktif</span> sesuai filter yang dipilih.
        </p>
        <p className="mt-2 text-[0.78rem] leading-relaxed text-slate-500 dark:text-white/30">
          Mahasiswa yang sudah berstatus **Ditolak** atau **Revisi** sebelumnya tidak akan ikut berubah statusnya.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isVerifying}
            className={cn(glassBtnGhost, "h-10 flex-1 justify-center disabled:opacity-40")}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isVerifying}
            className={cn(glassBtnPrimary, "h-10 flex-1 justify-center font-bold disabled:opacity-60")}
          >
            {isVerifying ? "Memproses..." : "Ya, Setujui Semua"}
          </button>
        </div>
      </LiquidGlassCard>
    </div>
  );
}

export default function MahasiswaPage() {
  const { data, total, isLoading, fetchAll, removeAll, bulkVerify } = useWisudawan();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fakultasFilter, setFakultasFilter] = useState("");
  const [prodiFilter, setProdiFilter] = useState("");
  const [customFilter, setCustomFilter] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<WisudawanRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WisudawanRow | null>(null);
  const [resetTarget, setResetTarget] = useState<WisudawanRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showBulkVerifyDialog, setShowBulkVerifyDialog] = useState(false);
  const [isBulkVerifying, setIsBulkVerifying] = useState(false);

  const activeCardLabel = customFilter || (
    !search && !statusFilter && !fakultasFilter && !prodiFilter ? "Total Wisudawan" : null
  );

  const handleCardFilter = useCallback((label: string | null) => {
    if (label === activeCardLabel) {
      setCustomFilter(null);
      setSearch("");
      setStatusFilter("");
      setFakultasFilter("");
      setProdiFilter("");
      return;
    }

    if (!label || label === "Total Wisudawan") {
      setCustomFilter(null);
      setSearch("");
      setStatusFilter("");
      setFakultasFilter("");
      setProdiFilter("");
      return;
    }

    if (label === "Terverifikasi") {
      setStatusFilter("LULUS");
      setCustomFilter(null);
    } else {
      setCustomFilter(label);
    }
  }, [activeCardLabel]);

  const filteredData = data.filter((s) => {
    if (!customFilter) return true;
    if (customFilter === "Belum Login") {
      return s.status === "AKTIF" && !s.hasUndangan && !s.kehadiranStatus;
    }
    if (customFilter === "Profile Belum Lengkap") {
      return s.status === "AKTIF" && !s.hasUndangan;
    }
    if (customFilter === "Menunggu Verifikasi") {
      return s.status === "AKTIF" && s.hasUndangan && !s.kehadiranStatus;
    }
    if (customFilter === "Terverifikasi") {
      return s.status === "LULUS";
    }
    if (customFilter === "Sudah Hadir") {
      return s.kehadiranStatus === "HADIR";
    }
    return true;
  });

  const listKey = [search, statusFilter, fakultasFilter, prodiFilter, customFilter].join("|");

  const load = useCallback(() => {
    fetchAll(
      {
        search: search || undefined,
        fakultas: fakultasFilter || undefined,
        prodi: prodiFilter || undefined,
        status: statusFilter || undefined,
      },
      1,
      500,
    );
  }, [fetchAll, search, statusFilter, fakultasFilter, prodiFilter]);

  const handleBulkVerifyConfirm = useCallback(async () => {
    setIsBulkVerifying(true);
    try {
      await bulkVerify({
        fakultas: fakultasFilter || undefined,
        prodi: prodiFilter || undefined,
      });
      setShowBulkVerifyDialog(false);
      load();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memverifikasi massal";
      toast.error(message);
    } finally {
      setIsBulkVerifying(false);
    }
  }, [bulkVerify, fakultasFilter, prodiFilter, load]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDeleteAllConfirm = useCallback(async () => {
    setIsDeletingAll(true);
    try {
      await removeAll();
      setShowDeleteAllDialog(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menghapus semua akun wisudawan";
      toast.error(message);
    } finally {
      setIsDeletingAll(false);
    }
  }, [removeAll]);

  return (
    <div className="dashboard-mesh relative -m-4 min-h-full overflow-hidden rounded-none p-4 sm:-m-6 sm:p-6 sm:rounded-3xl">
      <div className="relative z-10 space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/90 bg-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_16px_rgba(59,130,246,0.1)] dark:border-white/10 dark:bg-white/[0.08]">
              <Users className="size-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <div className="mb-1.5 inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-blue-800 dark:border-white/10 dark:bg-white/[0.08] dark:text-white/55">
                <Sparkles className="size-3 text-blue-600 dark:text-blue-400" />
                Kelola wisudawan
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                  <span className="bg-gradient-to-br from-slate-900 via-blue-900 to-violet-800 bg-clip-text text-transparent dark:hidden">
                    Akun Wisudawan
                  </span>
                  <span className="hidden dark:inline">Akun Wisudawan</span>
                </h1>
              </div>
              <p className="mt-0.5 text-sm font-medium text-slate-600 dark:text-white/45">
                Kelola akun dan data wisudawan
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <ImportExportButtons onImportSuccess={load} />
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className={cn(glassBtnPrimary, "h-9 px-4")}
            >
              <Plus className="size-3.5" />
              Tambah
            </button>
            {total > 0 && (
              <button
                type="button"
                onClick={() => setShowDeleteAllDialog(true)}
                className={cn(glassBtnDanger, "h-9 gap-2 px-3")}
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Hapus Semua</span>
              </button>
            )}
          </div>
        </header>

        <AccountStats
          data={data}
          total={total}
          activeFilter={activeCardLabel}
          onFilterChange={handleCardFilter}
        />

        <AccountToolbar
          search={search}
          onSearchChange={(s) => {
            setSearch(s);
            setCustomFilter(null);
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(v) => {
            setStatusFilter(v);
            setCustomFilter(null);
          }}
          fakultasFilter={fakultasFilter}
          onFakultasFilterChange={(v) => {
            setFakultasFilter(v);
            setCustomFilter(null);
          }}
          prodiFilter={prodiFilter}
          onProdiFilterChange={(v) => {
            setProdiFilter(v);
            setCustomFilter(null);
          }}
          onCreateClick={() => setCreateOpen(true)}
          onBulkVerifyClick={() => {
            const activeCount = filteredData.filter((s) => s.status === "AKTIF").length;
            if (activeCount === 0) {
              toast.info("Tidak ada akun berstatus Aktif untuk diverifikasi");
              return;
            }
            setShowBulkVerifyDialog(true);
          }}
        />

        <StudentTable
          data={filteredData}
          isLoading={isLoading}
          total={filteredData.length}
          listKey={listKey}
          onSelect={(s) => setEditTarget(s)}
          onEdit={(s) => setEditTarget(s)}
          onDelete={(s) => setDeleteTarget(s)}
        />

        <EditModal
          student={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={(updated) => setEditTarget(updated)}
          onSuccess={() => {
            load();
          }}
        />

        <CreateAccountModal
          open={createOpen}
          onClose={() => {
            setCreateOpen(false);
            load();
          }}
        />

        <DeleteConfirmModal
          open={!!deleteTarget}
          target={deleteTarget}
          onClose={() => {
            setDeleteTarget(null);
            load();
          }}
        />

        <ResetPasswordModal
          open={!!resetTarget}
          target={resetTarget}
          onClose={() => setResetTarget(null)}
        />

        <DeleteAllDialog
          open={showDeleteAllDialog}
          count={total}
          onConfirm={handleDeleteAllConfirm}
          onCancel={() => setShowDeleteAllDialog(false)}
          isDeleting={isDeletingAll}
        />

        <BulkVerifyDialog
          open={showBulkVerifyDialog}
          count={filteredData.filter((s) => s.status === "AKTIF").length}
          onConfirm={handleBulkVerifyConfirm}
          onCancel={() => setShowBulkVerifyDialog(false)}
          isVerifying={isBulkVerifying}
        />
      </div>
    </div>
  );
}
