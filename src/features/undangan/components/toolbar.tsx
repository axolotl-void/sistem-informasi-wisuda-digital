"use client";

import { useState } from "react";
import { Search, ChevronDown, Plus, Zap, FileSpreadsheet, FileDown, Trash2 } from "lucide-react";
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
        className="h-9 appearance-none rounded-xl border border-white/[0.08] bg-white/[0.04] pl-3 pr-8 text-[0.78rem] font-medium text-white/60 outline-none transition-all hover:border-white/[0.12] hover:bg-white/[0.06] focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0F172A] text-white">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-white/30" />
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
    default: "border-white/[0.08] bg-white/[0.04] text-white/60 hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-white/80",
    primary: "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/15",
    ghost: "border-transparent bg-transparent text-white/40 hover:bg-white/[0.04] hover:text-white/60",
    danger: "border-red-500/30 bg-red-500/10 text-red-400 hover:border-red-500/50 hover:bg-red-500/15",
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
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  count: number;
}) {
  if (!open) return null;

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0F172A] p-6 shadow-2xl">
        {/* Icon */}
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
          <Trash2 className="size-5 text-red-400" />
        </div>

        {/* Title */}
        <h2 className="text-base font-bold text-white/90">
          Hapus Semua Undangan?
        </h2>
        <p className="mt-2 text-[0.82rem] leading-relaxed text-white/40">
          Anda akan menghapus{" "}
          <span className="font-semibold text-red-400">{count} undangan</span>.
          Tindakan ini tidak dapat dibatalkan dan semua data QR code akan hilang permanen.
        </p>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] text-[0.82rem] font-semibold text-white/60 transition-all hover:bg-white/[0.07] hover:text-white/80 active:scale-[0.98]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-10 rounded-xl border border-red-500/30 bg-red-500/15 text-[0.82rem] font-bold text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/25 active:scale-[0.98]"
          >
            Ya, Hapus Semua
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

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  function handleDeleteAllConfirm() {
    deleteAll();
    setShowDeleteDialog(false);
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left — Search + Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/25" />
            <input
              type="text"
              placeholder="Cari nama, NIM, kode..."
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-56 rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-3 text-[0.78rem] text-white/70 placeholder-white/20 outline-none transition-all hover:border-white/[0.12] focus:border-blue-500/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          <GlassSelect value={filterStatus} onChange={setFilterStatus} options={statusOptions} />
          <GlassSelect value={filterSesi} onChange={setFilterSesi} options={sesiOptions} />
          <GlassSelect value={filterAttendance} onChange={setFilterAttendance} options={attendanceOptions} />
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          <GlassButton icon={FileSpreadsheet} label="Export Excel" />
          <GlassButton icon={FileDown} label="Export PDF" />
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
      />
    </>
  );
}
