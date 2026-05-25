"use client";

import { useState } from "react";
import { Search, ChevronDown, Plus, Zap, FileSpreadsheet, FileDown, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { useUndanganStore } from "../store";
import type { Invitation } from "../types";
import {
  LiquidGlassCard,
  glassBtnGhost,
  glassBtnPrimary,
  glassBtnDanger,
  glassInput,
} from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";

const statusOptions = [
  { value: "all", label: "Semua Status" },
  { value: "belum_generate", label: "Belum Generate" },
  { value: "qr_aktif", label: "QR Aktif" },
  { value: "sudah_download", label: "Sudah Download" },
  { value: "sudah_hadir", label: "Sudah Hadir" },
  { value: "expired", label: "Expired" },
];

const sesiOptions = [
  { value: "all", label: "Semua Sesi" },
  { value: "Sesi Pagi", label: "Sesi Pagi" },
  { value: "Sesi Siang", label: "Sesi Siang" },
  { value: "Sesi Sore", label: "Sesi Sore" },
];

const attendanceOptions = [
  { value: "all", label: "Semua Kehadiran" },
  { value: "belum_hadir", label: "Belum Hadir" },
  { value: "hadir", label: "Hadir" },
  { value: "terlambat", label: "Terlambat" },
  { value: "tidak_hadir", label: "Tidak Hadir" },
];

function GlassSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(glassInput, "h-9 cursor-pointer appearance-none pl-3 pr-8 text-[12px] font-medium")}
      >
        {options.map((o) => (
          <option
            key={o.value}
            value={o.value}
            className="bg-white dark:bg-[#0F172A]"
          >
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 dark:text-white/30" />
    </div>
  );
}

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
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/55"
        onClick={!isDeleting ? onCancel : undefined}
      />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/90 bg-white/95 p-6 shadow-xl dark:border-white/15 dark:bg-[#0f172a]/98">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-red-400/40 bg-red-500/15">
          <Trash2 className="size-5 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Hapus Semua Undangan?
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/50">
          {count} undangan akan dihapus permanen dari database.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className={cn(glassBtnGhost, "h-10 flex-1 justify-center")}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={cn(glassBtnDanger, "h-10 flex-1 justify-center font-bold")}
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus Semua"}
          </button>
        </div>
      </div>
    </div>
  );
}

function filterInvitations(
  invitations: Invitation[],
  searchQuery: string,
  filterStatus: string,
  filterSesi: string,
  filterAttendance: string,
) {
  return (invitations || []).filter((inv) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      if (
        !inv.mahasiswaNama?.toLowerCase().includes(q) &&
        !inv.nim?.includes(q) &&
        !inv.kode?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (filterStatus && filterStatus !== "all" && inv.status !== filterStatus) {
      return false;
    }
    if (filterSesi && filterSesi !== "all") {
      const sessionKeyword = filterSesi.replace("Sesi ", "");
      if (!inv.sesi?.toLowerCase().includes(sessionKeyword.toLowerCase())) {
        return false;
      }
    }
    if (filterAttendance && filterAttendance !== "all" && inv.attendance !== filterAttendance) {
      return false;
    }
    return true;
  });
}

export function InvitationToolbar() {
  const {
    searchQuery,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterSesi,
    setFilterSesi,
    filterAttendance,
    setFilterAttendance,
    openGenerateModal,
    openMassGenerate,
    invitations,
    deleteAll,
  } = useUndanganStore();

  const filtered = filterInvitations(
    invitations,
    searchQuery,
    filterStatus,
    filterSesi,
    filterAttendance,
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteAllConfirm() {
    setIsDeleting(true);
    try {
      await deleteAll();
      setShowDeleteDialog(false);
      toast.success("Semua undangan berhasil dihapus dari database");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus semua undangan",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function handleExportExcel() {
    if (filtered.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }
    try {
      const dataToExport = filtered.map((inv) => ({
        "Kode Undangan": inv.kode,
        NIM: inv.nim,
        "Nama Mahasiswa": inv.mahasiswaNama,
        Fakultas: inv.fakultas,
        Prodi: inv.prodi,
        "Sesi Wisuda": inv.sesi,
        "Tempat/Gedung": inv.gedung,
        "Nomor Kursi": inv.nomorKursi,
        "Kuota Tamu": inv.kuotaTamu,
        "Tamu Hadir": inv.tamuHadir,
        "Status Undangan":
          inv.status === "qr_aktif"
            ? "QR Aktif"
            : inv.status === "sudah_download"
              ? "Sudah Download"
              : inv.status === "sudah_hadir"
                ? "Sudah Hadir"
                : inv.status === "expired"
                  ? "Expired"
                  : "Belum Generate",
        "Status Kehadiran":
          inv.attendance === "hadir"
            ? "Hadir"
            : inv.attendance === "terlambat"
              ? "Terlambat"
              : inv.attendance === "tidak_hadir"
                ? "Tidak Hadir"
                : "Belum Hadir",
      }));
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Undangan");
      XLSX.writeFile(
        workbook,
        `Daftar_Undangan_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      toast.success("Data berhasil diekspor ke Excel");
    } catch {
      toast.error("Gagal mengekspor data ke Excel");
    }
  }

  async function handleExportPDF() {
    const input = document.getElementById("invitation-table-print");
    if (!input) {
      toast.error("Tabel tidak ditemukan untuk diekspor");
      return;
    }
    const toastId = toast.loading("Sedang menyiapkan dokumen PDF...");
    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#080f1e",
      } as Parameters<typeof html2canvas>[1]);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`Daftar_Undangan_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.dismiss(toastId);
      toast.success("Dokumen PDF berhasil diunduh");
    } catch {
      toast.dismiss(toastId);
      toast.error("Gagal mengekspor data ke PDF");
    }
  }

  return (
    <>
      <LiquidGlassCard noEntrance hover={false} className="p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
              <input
                type="text"
                placeholder="Cari nama, NIM, kode..."
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(glassInput, "h-9 w-full pl-10 pr-3 text-[13px]")}
              />
            </div>
            <GlassSelect value={filterStatus} onChange={setFilterStatus} options={statusOptions} />
            <GlassSelect value={filterSesi} onChange={setFilterSesi} options={sesiOptions} />
            <GlassSelect
              value={filterAttendance}
              onChange={setFilterAttendance}
              options={attendanceOptions}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={handleExportExcel} className={cn(glassBtnGhost, "h-9")}>
              <FileSpreadsheet className="size-3.5" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button type="button" onClick={handleExportPDF} className={cn(glassBtnGhost, "h-9")}>
              <FileDown className="size-3.5" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
            <button type="button" onClick={openMassGenerate} className={cn(glassBtnGhost, "h-9")}>
              <Zap className="size-3.5" />
              <span className="hidden sm:inline">Generate Massal</span>
            </button>
            <button type="button" onClick={openGenerateModal} className={cn(glassBtnPrimary, "h-9")}>
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">Generate Undangan</span>
            </button>
            {invitations.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDeleteDialog(true)}
                className={cn(glassBtnDanger, "h-9")}
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Hapus Semua</span>
              </button>
            )}
          </div>
        </div>
      </LiquidGlassCard>

      <DeleteAllDialog
        open={showDeleteDialog}
        count={invitations.length}
        onConfirm={handleDeleteAllConfirm}
        onCancel={() => setShowDeleteDialog(false)}
        isDeleting={isDeleting}
      />
    </>
  );
}
