"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { WisudawanRow } from "@/services/wisudawan.service";
import { Upload, Pencil, Trash2, GraduationCap, FileSpreadsheet, UserCheck, Sparkles, ArrowRight } from "lucide-react";
import {
  GlassChip,
  LiquidGlassCard,
  glassBtnPrimary,
  glassBtnGhost,
} from "@/components/ui/liquid-glass";
import { AnimatedList } from "@/components/ui/animated-list";

const TABLE_HEADERS = [
  "No",
  "Nama",
  "NIM",
  "Fakultas",
  "Prodi",
  "Status",
  "Undangan",
  "Kehadiran",
  "Aksi",
] as const;

const ROW_GRID = "grid w-full";
const GRID_STYLE = { gridTemplateColumns: "5% 20% 9% 14% 14% 10% 11% 9% 8%" };

const statusConfig: Record<
  string,
  {
    label: string;
    dot: string;
    light: string;
    dark: string;
  }
> = {
  AKTIF: {
    label: "Aktif",
    dot: "bg-blue-500",
    light: "border-blue-400/30 bg-blue-500/15 text-blue-800",
    dark: "dark:border-blue-500/25 dark:bg-blue-500/12 dark:text-blue-300",
  },
  LULUS: {
    label: "Terverifikasi",
    dot: "bg-emerald-500",
    light: "border-emerald-400/30 bg-emerald-500/15 text-emerald-800",
    dark: "dark:border-emerald-500/25 dark:bg-emerald-500/12 dark:text-emerald-300",
  },
  REVISI: {
    label: "Revisi",
    dot: "bg-amber-500",
    light: "border-amber-400/30 bg-amber-500/15 text-amber-800",
    dark: "dark:border-amber-500/25 dark:bg-amber-500/12 dark:text-amber-300",
  },
  CUTI: {
    label: "Cuti",
    dot: "bg-amber-500",
    light: "border-amber-400/30 bg-amber-500/15 text-amber-800",
    dark: "dark:border-amber-500/25 dark:bg-amber-500/12 dark:text-amber-300",
  },
  DROPOUT: {
    label: "Ditolak",
    dot: "bg-red-500",
    light: "border-red-400/30 bg-red-500/15 text-red-800",
    dark: "dark:border-red-500/25 dark:bg-red-500/12 dark:text-red-300",
  },
};

function StatusPill({ status, email }: { status: string; email: string | null }) {
  if (email && email.endsWith("@temp-wisuda.id")) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
          "border-orange-400/30 bg-orange-500/15 text-orange-800",
          "dark:border-orange-500/25 dark:bg-orange-500/12 dark:text-orange-300",
        )}
      >
        <span className={cn("size-1.5 rounded-full bg-orange-500")} />
        Belum Lengkap
      </span>
    );
  }
  const c = statusConfig[status] ?? statusConfig.AKTIF;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        c.light,
        c.dark,
      )}
    >
      <span className={cn("size-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}

function TableSkeleton() {
  return (
    <LiquidGlassCard hover={false} className="p-5">
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-3">
            <div className="size-8 rounded-xl bg-white/50 dark:bg-white/[0.06]" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-2.5 w-32 rounded-lg bg-white/50 dark:bg-white/[0.06]" />
              <div className="h-2 w-24 rounded-lg bg-white/40 dark:bg-white/[0.04]" />
            </div>
          </div>
        ))}
      </div>
    </LiquidGlassCard>
  );
}

const WISUDAWAN_STEPS = [
  { icon: FileSpreadsheet, label: "Unduh Template", desc: "Download template Excel resmi" },
  { icon: Upload, label: "Import Data", desc: "Unggah file Excel yang sudah diisi" },
  { icon: UserCheck, label: "Verifikasi", desc: "Verifikasi data profil wisudawan" },
];

function EmptyState() {
  return (
    <LiquidGlassCard hover={false} className="relative overflow-hidden p-0">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 size-64 rounded-full bg-blue-500/[0.06] blur-3xl dark:bg-blue-500/[0.08]" />
        <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-indigo-500/[0.05] blur-3xl dark:bg-indigo-500/[0.07]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 rounded-full bg-purple-500/[0.03] blur-3xl dark:bg-purple-500/[0.04]" />

        {/* Floating graduation cap grid */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.04]">
          <div className="grid grid-cols-8 gap-6 -rotate-12 scale-125">
            {Array.from({ length: 24 }).map((_, i) => (
              <GraduationCap key={i} className="size-8 text-blue-500" />
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-6 py-14 sm:py-20">
        {/* Animated icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-xl animate-pulse" />
          <div className="relative flex size-20 items-center justify-center rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 shadow-[0_8px_32px_rgba(59,130,246,0.15)] backdrop-blur-sm dark:border-blue-400/15 dark:shadow-[0_8px_32px_rgba(59,130,246,0.12)]">
            <GraduationCap className="size-9 text-blue-500 dark:text-blue-400" />
          </div>
          {/* Sparkle accents */}
          <Sparkles className="absolute -top-2 -right-2 size-5 text-amber-400/70 animate-bounce" style={{ animationDuration: "2.5s" }} />
          <Sparkles className="absolute -bottom-1 -left-3 size-4 text-blue-400/50 animate-bounce" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-white/90">
          Belum ada data wisudawan
        </h3>
        <p className="mt-2 max-w-sm text-center text-[13px] leading-relaxed text-slate-500 dark:text-white/40">
          Mulai dengan mengunduh template Excel, isi data mahasiswa, lalu import file untuk membuat akun wisudawan secara otomatis.
        </p>

        {/* Step guide */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          {WISUDAWAN_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3 sm:gap-4">
              <div
                onClick={() => {
                  if (i === 0) {
                    document.getElementById("template-download-btn")?.click();
                  } else if (i === 1) {
                    document.getElementById("import-excel-file-input")?.click();
                  }
                }}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border border-white/60 bg-white/70 px-3.5 py-2.5 shadow-sm backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04]",
                  i < 2 && "cursor-pointer hover:bg-white/95 dark:hover:bg-white/[0.08] transition-all hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-500/15">
                  <step.icon className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 dark:text-white/80 leading-tight">{step.label}</p>
                  <p className="text-[9px] text-slate-400 dark:text-white/30 font-medium">{step.desc}</p>
                </div>
              </div>
              {i < WISUDAWAN_STEPS.length - 1 && (
                <ArrowRight className="hidden size-4 text-slate-300 dark:text-white/15 sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => document.getElementById("import-excel-file-input")?.click()}
            className={cn(glassBtnPrimary, "h-10 gap-2 px-5 text-[12px] font-bold shadow-[0_4px_20px_rgba(59,130,246,0.25)] hover:shadow-[0_6px_28px_rgba(59,130,246,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]")}
          >
            <Upload className="size-4" /> Import Excel
          </button>
          <button
            type="button"
            onClick={() => document.getElementById("template-download-btn")?.click()}
            className={cn(glassBtnGhost, "h-10 gap-2 px-5 text-[12px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all")}
          >
            <FileSpreadsheet className="size-4" /> Unduh Template
          </button>
        </div>
      </div>
    </LiquidGlassCard>
  );
}

function StudentRow({
  student: s,
  onEdit,
  onDelete,
}: {
  student: WisudawanRow;
  onEdit?: (student: WisudawanRow) => void;
  onDelete?: (student: WisudawanRow) => void;
}) {
  return (
    <div
      className={cn(
        ROW_GRID,
        "text-[13px] transition-colors cursor-pointer",
        "border-b border-white/40 last:border-0",
        "hover:bg-white/40 dark:border-white/[0.05] dark:hover:bg-white/[0.04]",
      )}
      style={GRID_STYLE}
      onClick={() => onEdit?.(s)}
    >
      <div className="flex items-center px-3 py-3 font-mono text-[11px] text-slate-500 dark:text-white/45 font-medium">
        {s.nomorUrut ?? "-"}
      </div>
      <div className="flex items-center gap-2.5 px-3 py-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-blue-400/30 bg-gradient-to-br from-blue-400/25 to-blue-600/10 text-[10px] font-bold text-blue-800 dark:border-blue-500/25 dark:text-blue-300">
          {s.nama
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="truncate font-medium text-slate-800 dark:text-white/85">
              {s.nama}
            </p>
            {s.isCumlaude && (
              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-amber-400/35 bg-amber-500/12 px-1.5 py-0.2 text-[9px] font-bold text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300">
                ✨ Cumlaude
              </span>
            )}
          </div>
          <p className="truncate text-[10px] text-slate-500 dark:text-white/35">
            {s.email && !s.email.endsWith("@temp-wisuda.id") ? s.email : "-"}
          </p>
        </div>
      </div>
      <div className="flex items-center px-3 py-3">
        <span className="block truncate font-mono text-[11px] text-slate-600 dark:text-white/45">
          {s.nim}
        </span>
      </div>
      <div className="flex items-center px-3 py-3">
        <span
          className="block truncate text-[11px] font-medium text-slate-600 dark:text-white/40"
          title={s.fakultas}
        >
          {s.fakultas}
        </span>
      </div>
      <div className="flex items-center px-3 py-3">
        <span
          className="block truncate text-[11px] font-medium text-slate-600 dark:text-white/40"
          title={s.prodi}
        >
          {s.prodi}
        </span>
      </div>
      <div className="flex items-center px-3 py-3">
        <StatusPill status={s.status} email={s.email} />
      </div>
      <div className="flex items-center px-3 py-3">
        {s.hasUndangan ? (
          <span className="block truncate font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
            {s.undanganKode}
          </span>
        ) : (
          <span className="text-slate-300 dark:text-white/15">-</span>
        )}
      </div>
      <div className="flex items-center px-3 py-3">
        {s.kehadiranStatus ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Hadir
          </span>
        ) : (
          <span className="text-slate-300 dark:text-white/15">-</span>
        )}
      </div>
      <div className="flex items-center gap-1 px-3 py-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(s);
          }}
          className="flex size-8 cursor-pointer items-center justify-center rounded-xl border border-blue-400/35 bg-blue-500/15 text-blue-700 transition-all hover:bg-blue-500/25 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/18"
          title="Edit"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(s);
          }}
          className="flex size-8 cursor-pointer items-center justify-center rounded-xl border border-red-400/35 bg-red-500/15 text-red-700 transition-all hover:bg-red-500/25 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/18"
          title="Hapus"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

interface StudentTableProps {
  data: WisudawanRow[];
  isLoading: boolean;
  total: number;
  listKey?: string;
  onSelect?: (student: WisudawanRow) => void;
  onEdit?: (student: WisudawanRow) => void;
  onDelete?: (student: WisudawanRow) => void;
}

export function StudentTable({
  data,
  isLoading,
  total,
  listKey = "wisudawan",
  onEdit,
  onDelete,
}: StudentTableProps) {
  const [visibleCount, setVisibleCount] = useState(15);

  // Reset visible items when filter or search changes the data
  useEffect(() => {
    setVisibleCount(15);
  }, [data.length]);

  const loadMore = useCallback(() => {
    if (visibleCount < data.length) {
      setVisibleCount((prev) => Math.min(prev + 15, data.length));
    }
  }, [visibleCount, data.length]);

  if (isLoading) return <TableSkeleton />;
  if (data.length === 0 && !isLoading) return <EmptyState />;

  const visibleData = data.slice(0, visibleCount);

  const tableHeader = (
    <div
      className={cn(
        ROW_GRID,
        "border-b border-white/60 bg-white/90 backdrop-blur-sm dark:border-white/[0.08] dark:bg-[#0f1a2e]/98",
      )}
      style={GRID_STYLE}
    >
      {TABLE_HEADERS.map((h) => (
        <div
          key={h}
          className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/30"
        >
          {h}
        </div>
      ))}
    </div>
  );

  const listItems = visibleData.map((s) => (
    <StudentRow key={s.id} student={s} onEdit={onEdit} onDelete={onDelete} />
  ));

  return (
    <LiquidGlassCard noEntrance hover={false} className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <AnimatedList
          key={listKey}
          items={listItems}
          itemKeys={visibleData.map((s) => s.id)}
          header={tableHeader}
          showGradients
          enableArrowNavigation={false}
          displayScrollbar
          itemEnterDelay={0.035} // Staggered delays
          inViewAmount={0.05}
          maxHeight="min(72vh, 680px)"
          itemClassName="!m-0 !rounded-none"
          className="min-w-0"
          onScrollBottom={loadMore}
        />
      </div>

      <div className="border-t border-white/50 bg-white/40 px-5 py-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
        <p className="text-[11px] font-medium text-slate-500 dark:text-white/35">
          Menampilkan <span className="font-semibold text-slate-700 dark:text-white/55">{Math.min(visibleCount, data.length)}</span> dari <span className="font-semibold text-slate-700 dark:text-white/55">{data.length}</span> wisudawan
          {visibleCount < data.length && (
            <span className="text-slate-400 dark:text-white/20"> · scroll ke bawah untuk melihat lebih banyak</span>
          )}
        </p>
      </div>
    </LiquidGlassCard>
  );
}
