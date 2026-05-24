"use client";

import { useState } from "react";
import { Search, ChevronDown, Plus, Zap, FileSpreadsheet, FileDown, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { useUndanganStore } from "../store";

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
        className="h-9 appearance-none rounded-xl border border-gray-200 bg-white text-gray-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/60 pl-3 pr-8 text-[0.78rem] font-medium outline-none transition-all hover:border-gray-300 dark:hover:border-white/[0.12] dark:hover:bg-white/[0.06] focus:border-blue-400 dark:focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 cursor-pointer shadow-sm dark:shadow-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-white text-gray-800 dark:bg-[#0F172A] dark:text-white">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-gray-400 dark:text-white/30" />
    </div>
  );
}

function GlassButton({
  onClick,
  icon: Icon,
  label,
  variant = "default",
}: {
  onClick?: () => void;
  icon: React.ElementType;
  label: string;
  variant?: "default" | "primary" | "ghost" | "danger";
}) {
  const styles = {
    default:
      "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/60 dark:hover:border-white/[0.12] dark:hover:bg-white/[0.07] dark:hover:text-white/80 shadow-sm dark:shadow-none",
    primary:
      "border-blue-300 bg-blue-50 text-blue-600 hover:border-blue-400 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/15",
    ghost:
      "border-transparent bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-white/40 dark:hover:bg-white/[0.04] dark:hover:text-white/60",
    danger:
      "border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:hover:border-red-500/50 dark:hover:bg-red-500/15",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[0.78rem] font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${styles[variant]}`}
    >
      <Icon className="size-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ─── Delete All Confirmation Dialog ──────────────────────────────────────────

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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={!isDeleting ? onCancel : undefined}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white dark:border-white/[0.08] dark:bg-[#0F172A] p-6 shadow-2xl">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10">
          <Trash2 className="size-5 text-red-500 dark:text-red-400" />
        </div>

        <h2 className="text-base font-bold text-gray-900 dark:text-white/90">
          Hapus Semua Undangan?
        </h2>
        <p className="mt-2 text-[0.82rem] leading-relaxed text-gray-500 dark:text-white/40">
          Anda akan menghapus{" "}
          <span className="font-semibold text-red-500 dark:text-red-400">{count} undangan</span>.
          Tindakan ini tidak dapat dibatalkan dan semua data QR code akan hilang permanen dari database.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 h-10 rounded-xl border border-gray-200 bg-gray-50 text-[0.82rem] font-semibold text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-800 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/60 dark:hover:bg-white/[0.07] dark:hover:text-white/80"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 h-10 rounded-xl border border-red-300 bg-red-50 text-[0.82rem] font-bold text-red-600 transition-all hover:border-red-400 hover:bg-red-100 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-400 dark:hover:border-red-500/50 dark:hover:bg-red-500/25"
          >
            {isDeleting ? (
              <>
                <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menghapus...
              </>
            ) : (
              "Ya, Hapus Semua"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

export function InvitationToolbar() {
  const {
    searchQuery, setSearch,
    filterStatus, setFilterStatus,
    filterSesi, setFilterSesi,
    filterAttendance, setFilterAttendance,
    openGenerateModal, openMassGenerate,
    invitations, deleteAll,
  } = useUndanganStore();

  const filtered = (invitations || []).filter((inv) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchNama = inv.mahasiswaNama?.toLowerCase().includes(q);
      const matchNim = inv.nim?.includes(q);
      const matchKode = inv.kode?.toLowerCase().includes(q);
      if (!matchNama && !matchNim && !matchKode) return false;
    }
    if (filterStatus && filterStatus !== "all") {
      if (inv.status !== filterStatus) return false;
    }
    if (filterSesi && filterSesi !== "all") {
      const sessionKeyword = filterSesi.replace("Sesi ", "");
      if (!inv.sesi || !inv.sesi.toLowerCase().includes(sessionKeyword.toLowerCase())) {
        return false;
      }
    }
    if (filterAttendance && filterAttendance !== "all") {
      if (inv.attendance !== filterAttendance) return false;
    }
    return true;
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteAllConfirm() {
    setIsDeleting(true);
    try {
      await deleteAll();
      setShowDeleteDialog(false);
      toast.success(`Semua undangan berhasil dihapus dari database`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus semua undangan";
      toast.error(message);
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
        "NIM": inv.nim,
        "Nama Mahasiswa": inv.mahasiswaNama,
        "Fakultas": inv.fakultas,
        "Prodi": inv.prodi,
        "Sesi Wisuda": inv.sesi,
        "Tempat/Gedung": inv.gedung,
        "Nomor Kursi": inv.nomorKursi,
        "Kuota Tamu": inv.kuotaTamu,
        "Tamu Hadir": inv.tamuHadir,
        "Status Undangan": inv.status === "qr_aktif" ? "QR Aktif" :
                           inv.status === "sudah_download" ? "Sudah Download" :
                           inv.status === "sudah_hadir" ? "Sudah Hadir" :
                           inv.status === "expired" ? "Expired" : "Belum Generate",
        "Status Kehadiran": inv.attendance === "hadir" ? "Hadir" :
                            inv.attendance === "terlambat" ? "Terlambat" :
                            inv.attendance === "tidak_hadir" ? "Tidak Hadir" : "Belum Hadir",
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Undangan");
      XLSX.writeFile(workbook, `Daftar_Undangan_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("Data berhasil diekspor ke Excel");
    } catch (error) {
      console.error("Export Excel error:", error);
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
      } as any);
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
    } catch (error) {
      console.error("Export PDF error:", error);
      toast.dismiss(toastId);
      toast.error("Gagal mengekspor data ke PDF");
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left — Search + Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400 dark:text-white/25" />
            <input
              type="text"
              placeholder="Cari nama, NIM, kode..."
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-56 rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-[0.78rem] text-gray-700 placeholder-gray-400 outline-none transition-all hover:border-gray-300 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/70 dark:placeholder-white/20 dark:hover:border-white/[0.12] dark:focus:border-blue-500/40 dark:focus:bg-white/[0.06] dark:shadow-none"
            />
          </div>

          <GlassSelect value={filterStatus} onChange={setFilterStatus} options={statusOptions} />
          <GlassSelect value={filterSesi} onChange={setFilterSesi} options={sesiOptions} />
          <GlassSelect value={filterAttendance} onChange={setFilterAttendance} options={attendanceOptions} />
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          <GlassButton icon={FileSpreadsheet} label="Export Excel" onClick={handleExportExcel} />
          <GlassButton icon={FileDown} label="Export PDF" onClick={handleExportPDF} />
          <GlassButton icon={Zap} label="Generate Massal" onClick={openMassGenerate} />
          <GlassButton icon={Plus} label="Generate Undangan" variant="primary" onClick={openGenerateModal} />
          {invitations.length > 0 && (
            <GlassButton
              icon={Trash2}
              label="Hapus Semua"
              variant="danger"
              onClick={() => setShowDeleteDialog(true)}
            />
          )}
        </div>
      </div>

      {/* Delete All Confirmation Dialog */}
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
