"use client";

import { Search, UserPlus } from "lucide-react";
import {
  LiquidGlassCard,
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
  prodiFilter: string;
  onProdiFilterChange: (v: string) => void;
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

const majors: Record<string, string[]> = {
  "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)": [
    "S1 Pendidikan Bahasa dan Sastra Aceh",
    "S1 Pendidikan Bahasa Indonesia",
    "S1 Pendidikan Bahasa Inggris",
    "S1 Pendidikan Matematika",
    "S1 Pendidikan Jasmani",
    "S1 Pendidikan Guru Sekolah Dasar (PGSD)",
    "S1 Pendidikan Guru Pendidikan Anak Usia Dini (PG PAUD)",
    "S1 Pendidikan Ilmu Pengetahuan Alam (Pendidikan IPA)",
    "S1 Pendidikan Seni Pertunjukan",
    "S2 Penjaminan Mutu Pendidikan",
    "S2 Pendidikan Dasar",
    "Pendidikan Profesi Guru (PPG)"
  ],
  "Fakultas Sains, Teknologi, dan Ilmu Kesehatan (FSTIK)": [
    "S1 Ilmu Komputer",
    "S1 Keperawatan",
    "S1 Kebidanan"
  ],
};

export function AccountToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  fakultasFilter,
  onFakultasFilterChange,
  prodiFilter,
  onProdiFilterChange,
  onCreateClick,
}: ToolbarProps) {
  const selectCls = cn(glassInput, "h-9 cursor-pointer px-3 text-[11px] font-medium");

  const availableProdis = fakultasFilter
    ? (majors[fakultasFilter] ?? [])
    : Object.values(majors).flat();

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
            onChange={(e) => {
              onFakultasFilterChange(e.target.value);
              onProdiFilterChange("");
            }}
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

          <select
            value={prodiFilter}
            onChange={(e) => onProdiFilterChange(e.target.value)}
            className={cn(selectCls, "max-w-[200px]")}
          >
            <option value="" className="bg-white dark:bg-[#0B1424]">
              Semua Prodi
            </option>
            {availableProdis.map((p) => (
              <option key={p} value={p} className="bg-white dark:bg-[#0B1424]">
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
