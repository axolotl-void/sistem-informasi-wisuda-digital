"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Plus, Sparkles } from "lucide-react";
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
import { glassBtnPrimary } from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";

export default function MahasiswaPage() {
  const { data, total, isLoading, fetchAll } = useWisudawan();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fakultasFilter, setFakultasFilter] = useState("");

  const [editTarget, setEditTarget] = useState<WisudawanRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WisudawanRow | null>(null);
  const [resetTarget, setResetTarget] = useState<WisudawanRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const listKey = [search, statusFilter, fakultasFilter].join("|");

  const load = useCallback(() => {
    fetchAll(
      {
        search: search || undefined,
        fakultas: fakultasFilter || undefined,
        status: statusFilter || undefined,
      },
      1,
      500,
    );
  }, [fetchAll, search, statusFilter, fakultasFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="dashboard-mesh relative -m-4 min-h-full overflow-hidden rounded-none p-4 sm:-m-6 sm:p-6 sm:rounded-3xl">
      <div className="relative z-10 space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/90 bg-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_16px_rgba(59,130,246,0.1)] dark:border-white/10 dark:bg-white/[0.08]">
              <Users className="size-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <div className="mb-1.5 inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-blue-800 dark:border-white/10 dark:bg-white/[0.08] dark:text-white/50">
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
              <p className="mt-0.5 text-sm font-medium text-slate-600 dark:text-white/40">
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
          </div>
        </header>

        <AccountStats data={data} total={total} />

        <AccountToolbar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          fakultasFilter={fakultasFilter}
          onFakultasFilterChange={setFakultasFilter}
          onCreateClick={() => setCreateOpen(true)}
        />

        <StudentTable
          data={data}
          isLoading={isLoading}
          total={total}
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
      </div>
    </div>
  );
}
