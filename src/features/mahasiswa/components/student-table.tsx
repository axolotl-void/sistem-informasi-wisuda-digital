"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { WisudawanRow } from "@/services/wisudawan.service";
import { ChevronLeft, ChevronRight, Upload, Pencil, Trash2 } from "lucide-react";

// ─── Status badge ────────────────────────────────────────────────────────────

const statusConfig: Record<string, {
  label: string;
  dot: string;
  lightText: string;
  lightBg: string;
  darkText: string;
  darkBg: string;
}> = {
  AKTIF:   { label: "Aktif",         dot: "bg-blue-500",    lightText: "text-blue-700",    lightBg: "bg-blue-100",    darkText: "dark:text-blue-300/90",    darkBg: "dark:bg-blue-500/10" },
  LULUS:   { label: "Terverifikasi", dot: "bg-emerald-500", lightText: "text-emerald-700", lightBg: "bg-emerald-100", darkText: "dark:text-emerald-300/90", darkBg: "dark:bg-emerald-500/10" },
  CUTI:    { label: "Cuti",          dot: "bg-yellow-500",  lightText: "text-yellow-700",  lightBg: "bg-yellow-100",  darkText: "dark:text-yellow-300/90",  darkBg: "dark:bg-yellow-500/10" },
  DROPOUT: { label: "Ditolak",       dot: "bg-red-500",     lightText: "text-red-700",     lightBg: "bg-red-100",     darkText: "dark:text-red-300/90",     darkBg: "dark:bg-red-500/10" },
};

function StatusPill({ status }: { status: string }) {
  const c = statusConfig[status] ?? statusConfig.AKTIF;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide",
      c.lightBg, c.lightText, c.darkBg, c.darkText,
    )}>
      <span className={cn("size-1 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] overflow-hidden p-4">
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-3">
            <div className="size-7 rounded-md bg-slate-100 dark:bg-white/[0.04]" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-2.5 w-32 rounded bg-slate-100 dark:bg-white/[0.04]" />
              <div className="h-2 w-20 rounded bg-slate-100 dark:bg-white/[0.03]" />
            </div>
            <div className="h-5 w-16 rounded-md bg-slate-100 dark:bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] py-16 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.04]">
        <span className="text-2xl">🎓</span>
      </div>
      <p className="text-sm font-semibold text-slate-600 dark:text-white/50">Belum ada data wisudawan</p>
      <p className="mt-1 text-xs font-medium text-slate-400 dark:text-white/20">Import data mahasiswa untuk memulai</p>
      <button type="button" className="mt-4 flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white cursor-pointer hover:bg-blue-700 transition-colors">
        <Upload className="size-3" /> Import Excel
      </button>
    </div>
  );
}

// ─── Main table ──────────────────────────────────────────────────────────────

interface StudentTableProps {
  data: WisudawanRow[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onSelect?: (student: WisudawanRow) => void;
  onEdit?: (student: WisudawanRow) => void;
  onDelete?: (student: WisudawanRow) => void;
}

export function StudentTable({
  data,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
  onEdit,
  onDelete,
}: StudentTableProps) {
  if (isLoading) return <TableSkeleton />;
  if (data.length === 0 && !isLoading) return <EmptyState />;

  const headers = ["Nama", "NIM", "Fakultas", "Prodi", "Status", "Undangan", "Kehadiran", "Aksi"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] overflow-hidden relative shadow-sm dark:shadow-none"
    >
      {/* Top reflection (dark only) */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent dark:block hidden" />

      <div className="overflow-x-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/[0.05] bg-slate-50 dark:bg-white/[0.02]">
              {headers.map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold tracking-[0.08em] uppercase text-slate-500 dark:text-white/20">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((s, i) => (
              <motion.tr
                key={s.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: i * 0.015 }}
                className={cn(
                  "transition-colors duration-150 group",
                  i < data.length - 1 ? "border-b border-slate-100 dark:border-white/[0.03]" : "",
                  "hover:bg-slate-50 dark:hover:bg-white/[0.03]",
                )}
              >
                {/* Nama */}
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-md flex items-center justify-center bg-blue-100 dark:bg-blue-500/[0.08] text-[10px] font-bold text-blue-700 dark:text-blue-400 shrink-0">
                      {s.nama.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-slate-800 dark:text-white/75 truncate">{s.nama}</p>
                      <p className="text-[10px] font-medium text-slate-400 dark:text-white/20 truncate">{s.email}</p>
                    </div>
                  </div>
                </td>

                {/* NIM */}
                <td className="px-4 py-2.5">
                  <span className="font-mono text-[11px] text-slate-500 dark:text-white/35">{s.nim}</span>
                </td>

                {/* Fakultas */}
                <td className="px-4 py-2.5">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-white/30">{s.fakultas}</span>
                </td>

                {/* Prodi */}
                <td className="px-4 py-2.5">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-white/30">{s.prodi}</span>
                </td>

                {/* Status */}
                <td className="px-4 py-2.5">
                  <StatusPill status={s.status} />
                </td>

                {/* Undangan */}
                <td className="px-4 py-2.5">
                  {s.hasUndangan ? (
                    <span className="font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400/80">
                      {s.undanganKode}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-300 dark:text-white/12">—</span>
                  )}
                </td>

                {/* Kehadiran */}
                <td className="px-4 py-2.5">
                  {s.kehadiranStatus ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400/80">
                      <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                      Hadir
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-300 dark:text-white/12">—</span>
                  )}
                </td>

                {/* Aksi */}
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onEdit?.(s); }}
                      className="flex size-7 items-center justify-center rounded-md border transition-all duration-150 cursor-pointer
                        border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-300
                        dark:border-blue-500/15 dark:bg-blue-500/[0.08] dark:text-blue-400/80 dark:hover:bg-blue-500/15 dark:hover:border-blue-500/30 dark:hover:text-blue-400"
                      title="Edit"
                    >
                      <Pencil className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDelete?.(s); }}
                      className="flex size-7 items-center justify-center rounded-md border transition-all duration-150 cursor-pointer
                        border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300
                        dark:border-red-500/15 dark:bg-red-500/[0.08] dark:text-red-400/80 dark:hover:bg-red-500/15 dark:hover:border-red-500/30 dark:hover:text-red-400"
                      title="Hapus"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/[0.05] px-4 py-2.5">
        <p className="text-[10px] font-medium text-slate-400 dark:text-white/20">
          {data.length} dari {total}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex size-6 items-center justify-center rounded-md text-slate-400 dark:text-white/25 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-700 dark:hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <span className="px-2 text-[10px] font-semibold text-slate-500 dark:text-white/30">
            {page}/{totalPages || 1}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex size-6 items-center justify-center rounded-md text-slate-400 dark:text-white/25 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-700 dark:hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
