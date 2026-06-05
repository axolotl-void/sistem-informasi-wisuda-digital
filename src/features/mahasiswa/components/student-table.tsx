"use client";

import { cn } from "@/lib/utils";
import type { WisudawanRow } from "@/services/wisudawan.service";
import { Upload, Pencil, Trash2 } from "lucide-react";
import {
  GlassChip,
  LiquidGlassCard,
  glassBtnPrimary,
} from "@/components/ui/liquid-glass";
import { AnimatedList } from "@/components/ui/animated-list";

const TABLE_HEADERS = [
  "Nama",
  "NIM",
  "Fakultas",
  "Prodi",
  "Status",
  "Undangan",
  "Kehadiran",
  "Aksi",
] as const;

/** Kolom selaras dengan table-fixed sebelumnya */
const ROW_GRID =
  "grid w-full grid-cols-[22%_9%_16%_16%_10%_11%_8%_8%]";

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

function StatusPill({ status }: { status: string }) {
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

function EmptyState() {
  return (
    <LiquidGlassCard hover={false} className="flex flex-col items-center py-16 text-center">
      <GlassChip className="mb-4 flex size-14 items-center justify-center p-0">
        <span className="text-2xl">🎓</span>
      </GlassChip>
      <p className="text-sm font-semibold text-slate-700 dark:text-white/70">
        Belum ada data wisudawan
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-white/35">
        Import data mahasiswa untuk memulai
      </p>
      <button
        type="button"
        onClick={() => document.getElementById("import-excel-file-input")?.click()}
        className={cn(glassBtnPrimary, "mt-5 h-9 gap-2 px-4")}
      >
        <Upload className="size-3.5" /> Import Excel
      </button>
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
      onClick={() => onEdit?.(s)}
    >
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
          <p className="truncate font-medium text-slate-800 dark:text-white/85">
            {s.nama}
          </p>
          <p className="truncate text-[10px] text-slate-500 dark:text-white/35">
            {s.email}
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
        <StatusPill status={s.status} />
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
  if (isLoading) return <TableSkeleton />;
  if (data.length === 0 && !isLoading) return <EmptyState />;

  const tableHeader = (
    <div
      className={cn(
        ROW_GRID,
        "border-b border-white/60 bg-white/90 backdrop-blur-sm dark:border-white/[0.08] dark:bg-[#0f1a2e]/98",
      )}
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

  const listItems = data.map((s) => (
    <StudentRow key={s.id} student={s} onEdit={onEdit} onDelete={onDelete} />
  ));

  return (
    <LiquidGlassCard noEntrance hover={false} className="overflow-hidden p-0">
      <AnimatedList
        key={listKey}
        items={listItems}
        itemKeys={data.map((s) => s.id)}
        header={tableHeader}
        showGradients
        enableArrowNavigation={false}
        displayScrollbar
        itemEnterDelay={0.1}
        inViewAmount={0.35}
        maxHeight="min(72vh, 680px)"
        itemClassName="!m-0 !rounded-none"
        className="min-w-0"
      />

      <div className="border-t border-white/50 bg-white/40 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
        <p className="text-[11px] font-medium text-slate-500 dark:text-white/35">
          Menampilkan{" "}
          <span className="font-semibold text-slate-700 dark:text-white/55">
            {data.length}
          </span>
          {total > data.length ? (
            <span> dari {total} wisudawan</span>
          ) : (
            <span> wisudawan</span>
          )}
          <span className="text-slate-400 dark:text-white/25">
            {" "}
            · scroll untuk melihat semua
          </span>
        </p>
      </div>
    </LiquidGlassCard>
  );
}
