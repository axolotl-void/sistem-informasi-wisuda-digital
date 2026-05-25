"use client";

import { Search, Upload, Download, KeyRound, UserPlus } from "lucide-react";
import {
  LiquidGlassCard,
  glassBtnGhost,
  glassBtnPrimary,
  glassInput,
} from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";

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
  const selectCls = cn(glassInput, "h-9 cursor-pointer px-3 text-[11px] font-medium");

  return (
    <LiquidGlassCard noEntrance hover={false} className="p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Cari nama, NIM, atau email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(glassInput, "h-9 w-full pl-10 pr-3 text-[13px] font-medium")}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className={selectCls}
          >
            {statusOptions.map((o) => (
              <option
                key={o.value}
                value={o.value}
                className="bg-white dark:bg-[#0B1424]"
              >
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={fakultasFilter}
            onChange={(e) => onFakultasFilterChange(e.target.value)}
            className={cn(selectCls, "max-w-[200px]")}
          >
            <option value="" className="bg-white dark:bg-[#0B1424]">
              Semua Fakultas
            </option>
            {fakultasOptions.map((f) => (
              <option key={f} value={f} className="bg-white dark:bg-[#0B1424]">
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden h-8 w-px bg-white/60 dark:bg-white/[0.08] lg:block" />

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={cn(glassBtnGhost, "h-9")}>
            <Upload className="size-3.5" /> Import
          </button>
          <button type="button" className={cn(glassBtnGhost, "h-9")}>
            <Download className="size-3.5" /> Export
          </button>
          <button type="button" className={cn(glassBtnGhost, "h-9")}>
            <KeyRound className="size-3.5" /> Password
          </button>
          <button
            type="button"
            onClick={onCreateClick}
            className={cn(glassBtnPrimary, "h-9 lg:hidden")}
          >
            <UserPlus className="size-3.5" /> Tambah
          </button>
        </div>
      </div>
    </LiquidGlassCard>
  );
}
