"use client";

import { useEffect, useState, useCallback } from "react";
import { Mail, Sparkles } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useUndanganDosenStore } from "@/store/undangan-dosen.store";
import { api } from "@/lib/axios";

// Import components
import { UndanganDosenStatsCards } from "@/features/undangan-dosen/components/stats-cards";
import { UndanganDosenToolbar } from "@/features/undangan-dosen/components/toolbar";
import { UndanganDosenTable } from "@/features/undangan-dosen/components/invitation-table";
import { CreateUndanganDosenModal } from "@/features/undangan-dosen/components/create-modal";
import { EditUndanganDosenModal } from "@/features/undangan-dosen/components/edit-modal";
import { ImportUndanganDosenModal } from "@/features/undangan-dosen/components/import-modal";
import { PreviewUndanganDosenModal } from "@/features/undangan-dosen/components/preview-modal";
import {
  DeleteUndanganDosenModal,
  DeleteAllUndanganDosenDialog,
} from "@/features/undangan-dosen/components/delete-modal";

export default function UndanganDosenPage() {
  const {
    data,
    stats,
    isLoading,
    search,
    statusFilter,
    page,
    limit,
    total,
    setSearch,
    setStatusFilter,
    setPage,
    fetchData,
    createInvitation,
    updateInvitation,
    deleteInvitation,
    deleteAllInvitations,
  } = useUndanganDosenStore();

  // Dialog open states
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [previewTarget, setPreviewTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  // Loading actions
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData, search, statusFilter, page]);

  // Handle Export Excel
  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading("Mengambil data untuk diekspor…");
    try {
      const res = await api.get("/api/undangan-dosen/export");
      const rows = res.data.data;

      if (!rows || rows.length === 0) {
        toast.info("Tidak ada data untuk diekspor", { id: toastId });
        return;
      }

      toast.loading(`Membuat file Excel untuk ${rows.length} data…`, { id: toastId });

      // Create sheet
      const ws = XLSX.utils.json_to_sheet(rows);

      // Autofit headers
      const headers = Object.keys(rows[0]);
      ws["!cols"] = headers.map((h) => ({
        wch: Math.max(h.length + 2, 14),
      }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Undangan Dosen");

      XLSX.writeFile(wb, `Data_Undangan_Dosen_${Date.now()}.xlsx`);

      toast.success(`${rows.length} data berhasil diekspor`, {
        id: toastId,
        duration: 4000,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mengekspor data";
      toast.error(message, { id: toastId, duration: 6000 });
    } finally {
      setIsExporting(false);
    }
  };

  // Confirm delete single
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteInvitation(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      // Handled by store
    } finally {
      setIsDeleting(false);
    }
  };

  // Confirm delete all
  const handleDeleteAllConfirm = async () => {
    setIsDeletingAll(true);
    try {
      await deleteAllInvitations();
      setDeleteAllOpen(false);
    } catch (err) {
      // Handled by store
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <>
      <div className="dashboard-mesh relative -m-4 min-h-full overflow-hidden rounded-none p-4 sm:-m-6 sm:rounded-3xl sm:p-6">
        <div className="relative z-10 space-y-5">
          {/* Header */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/90 bg-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_16px_rgba(59,130,246,0.1)] dark:border-white/10 dark:bg-white/[0.08]">
                <Mail className="size-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <div className="mb-1.5 inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-blue-800 dark:border-white/10 dark:bg-white/[0.08] dark:text-white/50">
                  <Sparkles className="size-3 text-blue-600 dark:text-blue-400" />
                  Kelola undangan dosen
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                  <span className="bg-gradient-to-br from-slate-900 via-blue-900 to-violet-800 bg-clip-text text-transparent dark:hidden">
                    Undangan Dosen
                  </span>
                  <span className="hidden dark:inline">Undangan Dosen</span>
                </h1>
                <p className="mt-0.5 text-sm font-medium text-slate-600 dark:text-white/40">
                  Generate, sebar, dan pantau kehadiran undangan dosen & tamu VIP
                </p>
              </div>
            </div>
          </header>

          {/* Stats Cards */}
          <UndanganDosenStatsCards stats={stats} />

          {/* Toolbar */}
          <UndanganDosenToolbar
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onAddClick={() => setAddOpen(true)}
            onImportClick={() => setImportOpen(true)}
            onExportClick={handleExport}
            onDeleteAllClick={() => setDeleteAllOpen(true)}
            isExporting={isExporting}
            totalData={total}
          />

          {/* Table */}
          <UndanganDosenTable
            data={data}
            isLoading={isLoading}
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
            onPreviewClick={(item) => setPreviewTarget(item)}
            onShareClick={(item) => setPreviewTarget(item)} // Show preview modal which includes share action
            onEditClick={(item) => setEditTarget(item)}
            onDeleteClick={(item) => setDeleteTarget(item)}
            onImportClick={() => setImportOpen(true)}
          />
        </div>
      </div>

      {/* Dialog Modals */}
      <CreateUndanganDosenModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={createInvitation}
      />

      <EditUndanganDosenModal
        open={!!editTarget}
        item={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={updateInvitation}
      />

      <ImportUndanganDosenModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={fetchData}
      />

      <PreviewUndanganDosenModal
        open={!!previewTarget}
        item={previewTarget}
        onClose={() => setPreviewTarget(null)}
      />

      <DeleteUndanganDosenModal
        open={!!deleteTarget}
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      <DeleteAllUndanganDosenDialog
        open={deleteAllOpen}
        count={total}
        onClose={() => setDeleteAllOpen(false)}
        onConfirm={handleDeleteAllConfirm}
        isDeleting={isDeletingAll}
      />
    </>
  );
}
