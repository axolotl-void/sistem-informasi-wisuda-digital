"use client";

import { Search, UserPlus, Upload, Download, Trash2, MailCheck, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import {
  LiquidGlassCard,
  glassBtnPrimary,
  glassBtnGhost,
  glassInput,
} from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  onAddClick: () => void;
  onImportClick: () => void;
  onExportClick: () => void;
  onDeleteAllClick: () => void;
  isExporting: boolean;
  totalData: number;
}

const statusOptions = [
  { value: "all", label: "Semua Status" },
  { value: "hadir", label: "Sudah Hadir" },
  { value: "belum_hadir", label: "Belum Hadir" },
];

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ["Nama", "Jabatan", "NIDN", "Email", "No WhatsApp"],
    ["Prof. Dr. Ir. H. Abdurrahman, M.Pd.", "Rektor UBBG", "0011223344", "rektor@ubbg.ac.id", "628112233445"],
    ["Dr. Cut Dahlia, M.Si.", "Dekan FKIP", "0022334455", "dekan.fkip@ubbg.ac.id", "628223344556"],
  ]);

  ws["!cols"] = [
    { wch: 35 }, { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 16 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template Dosen");
  XLSX.writeFile(wb, "Template_Import_Dosen.xlsx");
}

export function UndanganDosenToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAddClick,
  onImportClick,
  onExportClick,
  onDeleteAllClick,
  isExporting,
  totalData,
}: ToolbarProps) {
  const selectCls = cn(glassInput, "h-9 cursor-pointer px-3 text-[11px] font-medium");
  const glassBtnDanger = cn(
    glassBtnGhost,
    "border-red-400/35 bg-red-500/10 text-red-700 hover:bg-red-500/15",
    "dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/18",
  );

  return (
    <LiquidGlassCard noEntrance hover={false} className="p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative min-w-0 flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Cari nama, NIDN, jabatan, atau kode..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(glassInput, "h-9 w-full pl-10 pr-3 text-[13px] font-medium")}
          />
        </div>

        {/* Filters */}
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
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          {/* Add Manual */}
          <button
            type="button"
            onClick={onAddClick}
            className={cn(glassBtnPrimary, "h-9 text-[11px] font-bold px-3.5 flex items-center gap-1.5")}
          >
            <UserPlus className="size-3.5" /> Tambah Undangan
          </button>

          {/* Import Excel */}
          <button
            type="button"
            onClick={onImportClick}
            className={cn(glassBtnGhost, "h-9 text-[11px] font-semibold px-3 flex items-center gap-1.5")}
            title="Import data dosen dari file Excel"
          >
            <Upload className="size-3.5" />
            <span className="hidden sm:inline">Import Excel</span>
          </button>

          {/* Export Excel */}
          <button
            type="button"
            onClick={onExportClick}
            disabled={isExporting || totalData === 0}
            className={cn(glassBtnGhost, "h-9 text-[11px] font-semibold px-3 flex items-center gap-1.5 disabled:opacity-40")}
            title="Export semua data undangan ke Excel"
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">{isExporting ? "Mengekspor..." : "Export Excel"}</span>
          </button>

          {/* Template Excel */}
          <button
            type="button"
            onClick={downloadTemplate}
            className={cn(glassBtnGhost, "h-9 text-[11px] font-semibold px-3 flex items-center gap-1.5")}
            title="Download template Excel untuk import data dosen"
          >
            <FileSpreadsheet className="size-3.5" />
            <span className="hidden sm:inline">Template Excel</span>
          </button>

          {/* Delete All */}
          {totalData > 0 && (
            <button
              type="button"
              onClick={onDeleteAllClick}
              className={cn(glassBtnDanger, "h-9 text-[11px] font-bold px-3.5 flex items-center gap-1.5")}
            >
              <Trash2 className="size-3.5" />
              <span className="hidden sm:inline">Hapus Semua</span>
            </button>
          )}
        </div>
      </div>
    </LiquidGlassCard>
  );
}
