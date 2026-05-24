"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Plus } from "lucide-react";
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

export default function MahasiswaPage() {
  const { data, total, totalPages, isLoading, fetchAll } = useWisudawan();

  const [page, setPage]                   = useState(1);
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState("");
  const [fakultasFilter, setFakultasFilter] = useState("");

  const [editTarget, setEditTarget]           = useState<WisudawanRow | null>(null);
  const [deleteTarget, setDeleteTarget]       = useState<WisudawanRow | null>(null);
  const [resetTarget, setResetTarget]         = useState<WisudawanRow | null>(null);
  const [createOpen, setCreateOpen]           = useState(false);

  const load = useCallback(() => {
    fetchAll({ search: search || undefined, fakultas: fakultasFilter || undefined, status: statusFilter || undefined }, page, 15);
  }, [fetchAll, search, statusFilter, fakultasFilter, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-white/[0.04]">
            <Users className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[1.1rem] font-bold tracking-tight text-slate-900 dark:text-white/90 leading-tight">
                Akun Wisudawan
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/[0.18] bg-emerald-500/[0.07] px-1.5 py-px">
                <span className="size-1 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span className="text-[0.55rem] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400/80">
                  Live
                </span>
              </span>
            </div>
            <p className="text-[0.68rem] text-slate-500 dark:text-white/28 mt-0.5 leading-tight">
              Kelola akun dan data wisudawan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <ImportExportButtons onImportSuccess={load} />
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-blue-500/25 bg-blue-600 dark:bg-blue-500/[0.08] px-2.5 text-[0.68rem] font-semibold text-white dark:text-blue-400 transition-all duration-150 hover:bg-blue-700 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/[0.14] active:scale-[0.97] cursor-pointer"
          >
            <Plus className="size-3" />
            Tambah
          </button>
        </div>
      </motion.div>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.04 }}
      >
        <AccountStats data={data} total={total} />
      </motion.div>

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
      >
        <AccountToolbar
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          statusFilter={statusFilter}
          onStatusFilterChange={(v) => { setStatusFilter(v); setPage(1); }}
          fakultasFilter={fakultasFilter}
          onFakultasFilterChange={(v) => { setFakultasFilter(v); setPage(1); }}
          onCreateClick={() => setCreateOpen(true)}
        />
      </motion.div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12 }}
      >
        <StudentTable
          data={data}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
          onSelect={(s) => setEditTarget(s)}
          onEdit={(s) => setEditTarget(s)}
          onDelete={(s) => setDeleteTarget(s)}
        />
      </motion.div>

      {/* ── Overlays ────────────────────────────────────────────────── */}
      <EditModal
        student={editTarget}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onUpdated={(updated) => setEditTarget(updated)}
        onSuccess={() => { load(); }}
      />

      <CreateAccountModal
        open={createOpen}
        onClose={() => { setCreateOpen(false); load(); }}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        target={deleteTarget}
        onClose={() => { setDeleteTarget(null); load(); }}
      />

      <ResetPasswordModal
        open={!!resetTarget}
        target={resetTarget}
        onClose={() => setResetTarget(null)}
      />
    </div>
  );
}
