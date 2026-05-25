"use client";

import { cn } from "@/lib/utils";
import type { WisudawanRow } from "@/services/wisudawan.service";
import { ChevronLeft, ChevronRight, Upload, Pencil, Trash2 } from "lucide-react";
import {
  GlassChip,
  LiquidGlassCard,
  glassBtnPrimary,
} from "@/components/ui/liquid-glass";

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
      <button type="button" className={cn(glassBtnPrimary, "mt-5 h-9 gap-2 px-4")}>
        <Upload className="size-3.5" /> Import Excel
      </button>
    </LiquidGlassCard>
  );
}

interface StudentTableProps {
  data: WisudawanRow[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onSelect?: (student: WisudawanRow) => void;
  onEdit?: (student: WisudawanRow) => void;
  onDelete?: (student: WisudawanRow) => void;
}

export function StudentTable({
  data,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
  onEdit,
  onDelete,
}: StudentTableProps) {
  if (isLoading) return <TableSkeleton />;
  if (data.length === 0 && !isLoading) return <EmptyState />;

  const headers = [
    "Nama",
    "NIM",
    "Fakultas",
    "Prodi",
    "Status",
    "Undangan",
    "Kehadiran",
    "Aksi",
  ];

  return (
    <LiquidGlassCard noEntrance hover={false} className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-white/60 bg-white/30 dark:border-white/[0.08] dark:bg-white/[0.03]">
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/30"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr
                key={s.id}
                className={cn(
                  "border-b border-white/40 transition-colors last:border-0",
                  "hover:bg-white/40 dark:border-white/[0.05] dark:hover:bg-white/[0.04]",
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
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
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-[11px] text-slate-600 dark:text-white/45">
                    {s.nim}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-medium text-slate-600 dark:text-white/40">
                    {s.fakultas}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-medium text-slate-600 dark:text-white/40">
                    {s.prodi}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={s.status} />
                </td>
                <td className="px-4 py-3">
                  {s.hasUndangan ? (
                    <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                      {s.undanganKode}
                    </span>
                  ) : (
                    <span className="text-slate-300 dark:text-white/15">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {s.kehadiranStatus ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                      <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                      Hadir
                    </span>
                  ) : (
                    <span className="text-slate-300 dark:text-white/15">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-white/50 bg-white/40 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
        <p className="text-[11px] font-medium text-slate-500 dark:text-white/35">
          {data.length} dari {total}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex size-8 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-white/60 disabled:opacity-30 dark:text-white/40 dark:hover:bg-white/[0.08]"
          >
            <ChevronLeft className="size-4" />
          </button>
          <GlassChip className="px-3 py-1 text-[11px] font-semibold tabular-nums text-slate-700 dark:text-white/60">
            {page}/{totalPages || 1}
          </GlassChip>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex size-8 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-white/60 disabled:opacity-30 dark:text-white/40 dark:hover:bg-white/[0.08]"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </LiquidGlassCard>
  );
}
