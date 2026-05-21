"use client";

import { Search, Upload, Download, KeyRound, RotateCcw, UserPlus } from "lucide-react";

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
    "h-8 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 text-[11px] font-medium text-white/50 outline-none transition-all focus:border-blue-500/30 focus:bg-white/[0.05] cursor-pointer";

  const btnCls =
    "flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 text-[11px] font-medium text-white/40 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white/70 active:scale-[0.97] cursor-pointer";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      {/* Top row — Search + Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            placeholder="Cari nama, NIM, atau email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-full rounded-lg border border-white/[0.06] bg-white/[0.03] pl-8 pr-3 text-[13px] font-medium text-white placeholder:text-white/15 outline-none transition-all focus:border-blue-500/30 focus:bg-white/[0.05] focus:ring-1 focus:ring-blue-500/10"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} className={selectCls}>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#0B1424]">{o.label}</option>
            ))}
          </select>

          <select value={fakultasFilter} onChange={(e) => onFakultasFilterChange(e.target.value)} className={selectCls}>
            <option value="" className="bg-[#0B1424]">Semua Fakultas</option>
            {fakultasOptions.map((f) => (
              <option key={f} value={f} className="bg-[#0B1424]">{f}</option>
            ))}
          </select>
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-5 bg-white/[0.06]" />

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

          <button type="button" onClick={onCreateClick}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-blue-600/90 px-3 text-[11px] font-semibold text-white transition-all duration-200 hover:bg-blue-500 active:scale-[0.97] cursor-pointer shadow-sm shadow-blue-500/20">
            <UserPlus className="size-3" /> Tambah
          </button>
        </div>
      </div>
    </div>
  );
}
