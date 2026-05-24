"use client";

import { Search, Upload, Download, KeyRound, UserPlus } from "lucide-react";

interface ToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  fakultasFilter: string;
  onFakultasFilterChange: (v: string) => void;
  onCreateClick: () => void;
}

const statusOptions = [
  { value: "", label: "Semua Status" },
  { value: "AKTIF", label: "Aktif" },
  { value: "LULUS", label: "Terverifikasi" },
  { value: "CUTI", label: "Cuti" },
  { value: "DROPOUT", label: "Ditolak" },
];

const fakultasOptions = [
  "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)",
  "Fakultas Sains, Teknologi, dan Ilmu Kesehatan (FSTIK)",
];

export function AccountToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  fakultasFilter,
  onFakultasFilterChange,
  onCreateClick,
}: ToolbarProps) {
  const selectCls =
    "h-8 rounded-lg border px-2.5 text-[11px] font-medium outline-none transition-all cursor-pointer " +
    "border-slate-200 bg-white text-slate-700 " +
    "dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/50 " +
    "focus:border-blue-500/50 dark:focus:border-blue-500/30 " +
    "dark:focus:bg-white/[0.05]";

  const btnCls =
    "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium transition-all duration-200 active:scale-[0.97] cursor-pointer " +
    "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 " +
    "dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white/40 dark:hover:border-white/[0.12] dark:hover:bg-white/[0.06] dark:hover:text-white/70";

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.02] p-3 shadow-sm dark:shadow-none">
      {/* Top row — Search + Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 dark:text-white/20" />
          <input
            type="text"
            placeholder="Cari nama, NIM, atau email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-full rounded-lg border pl-8 pr-3 text-[13px] font-medium outline-none transition-all
              border-slate-200 bg-white text-slate-900 placeholder:text-slate-400
              dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/15
              focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20
              dark:focus:border-blue-500/30 dark:focus:bg-white/[0.05] dark:focus:ring-blue-500/10"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5">
          <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} className={selectCls}>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value} className="bg-white dark:bg-[#0B1424]">{o.label}</option>
            ))}
          </select>

          <select value={fakultasFilter} onChange={(e) => onFakultasFilterChange(e.target.value)} className={selectCls}>
            <option value="" className="bg-white dark:bg-[#0B1424]">Semua Fakultas</option>
            {fakultasOptions.map((f) => (
              <option key={f} value={f} className="bg-white dark:bg-[#0B1424]">{f}</option>
            ))}
          </select>
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-white/[0.06]" />

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button type="button" className={btnCls}>
            <Upload className="size-3" /> Import
          </button>
          <button type="button" className={btnCls}>
            <Download className="size-3" /> Export
          </button>
          <button type="button" className={btnCls}>
            <KeyRound className="size-3" /> Password
          </button>

          <button
            type="button"
            onClick={onCreateClick}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[11px] font-semibold text-white transition-all duration-200 hover:bg-blue-700 active:scale-[0.97] cursor-pointer shadow-sm shadow-blue-500/20"
          >
            <UserPlus className="size-3" /> Tambah
          </button>
        </div>
      </div>
    </div>
  );
}
