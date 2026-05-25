"use client";

import { memo, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { RotateCcw, ClipboardList, Loader2, UserCheck } from "lucide-react";
import { useKehadiranStore } from "@/store/kehadiran.store";
import { AnimatedList } from "@/components/ui/animated-list";
import type { Kehadiran } from "@/types/kehadiran.type";
import { cn } from "@/lib/utils";

const statusCfg: Record<string, { label: string; pill: string; dot: string }> = {
  HADIR: {
    label: "Hadir",
    pill: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ring-1 ring-emerald-500/10",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]",
  },
  TERLAMBAT: {
    label: "Terlambat",
    pill: "bg-amber-500/10 text-amber-400 border-amber-500/20 ring-1 ring-amber-500/10",
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]",
  },
  TIDAK_HADIR: {
    label: "Belum Hadir",
    pill: "bg-rose-500/10 text-rose-400 border-rose-500/20 ring-1 ring-rose-500/10",
    dot: "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]",
  },
};

const ROW_FLEX =
  "flex w-full min-w-[800px] items-center border-b border-white/[0.03] transition-colors hover:bg-white/[0.015]";

const TABLE_HEADERS: { label: string; cls: string }[] = [
  { label: "NIM", cls: "w-[100px] shrink-0 py-3.5 pl-5 pr-3" },
  { label: "Nama", cls: "min-w-[140px] flex-1 py-3.5 px-4" },
  { label: "Fakultas", cls: "w-20 shrink-0 py-3.5 px-4" },
  { label: "Sesi", cls: "w-28 shrink-0 py-3.5 px-4" },
  { label: "Waktu Scan", cls: "w-28 shrink-0 py-3.5 px-4" },
  { label: "Petugas/Gate", cls: "w-24 shrink-0 py-3.5 px-4" },
  { label: "Status", cls: "w-28 shrink-0 py-3.5 px-4" },
  { label: "Aksi", cls: "w-32 shrink-0 py-3.5 pr-5 pl-4 text-center" },
];

function formatTime(dateInput: Date | string | null) {
  if (!dateInput) return "—";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return "—";
  }
}

function shortFakultas(fakultas?: string) {
  if (!fakultas) return "—";
  if (fakultas.includes("FKIP")) return "FKIP";
  if (fakultas.includes("FSTIK")) return "FSTIK";
  return fakultas;
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-white/[0.03]">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={cn(ROW_FLEX, "animate-pulse bg-white/[0.005]")}
        >
          <div className="w-[100px] shrink-0 py-4 pl-5 pr-3">
            <div className="h-3 w-16 rounded bg-white/10" />
          </div>
          <div className="min-w-[140px] flex-1 py-4 px-4">
            <div className="h-3.5 w-32 rounded bg-white/10" />
          </div>
          <div className="w-20 shrink-0 py-4 px-4">
            <div className="h-3 w-12 rounded bg-white/10" />
          </div>
          <div className="w-28 shrink-0 py-4 px-4">
            <div className="h-3 w-16 rounded bg-white/10" />
          </div>
          <div className="w-28 shrink-0 py-4 px-4">
            <div className="h-3 w-16 rounded bg-white/10" />
          </div>
          <div className="w-24 shrink-0 py-4 px-4">
            <div className="h-3 w-12 rounded bg-white/10" />
          </div>
          <div className="w-28 shrink-0 py-4 px-4">
            <div className="h-5 w-20 rounded-full bg-white/10" />
          </div>
          <div className="w-32 shrink-0 py-4 pr-5 pl-4">
            <div className="mx-auto h-7 w-24 rounded-lg bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center space-y-3"
      >
        <div className="flex size-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] text-white/15">
          <ClipboardList className="size-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white/60">Tidak Ada Data Kehadiran</p>
          <p className="mt-0.5 text-xs text-white/30">Silakan sesuaikan filter pencarian Anda</p>
        </div>
      </motion.div>
    </div>
  );
}

const KehadiranRow = memo(function KehadiranRow({
  row: k,
  isRowLoading,
  onCheckIn,
  onReset,
}: {
  row: Kehadiran;
  isRowLoading: boolean;
  onCheckIn: (mahasiswaId: string) => void;
  onReset: (mahasiswaId: string) => void;
}) {
  const cfg = statusCfg[k.statusKehadiran] ?? statusCfg.TIDAK_HADIR;

  return (
    <div
      role="row"
      className={cn(
        ROW_FLEX,
        k.statusKehadiran !== "TIDAK_HADIR" && "bg-white/[0.005]",
      )}
    >
      <div className="w-[100px] shrink-0 py-3.5 pl-5 pr-3">
        <span className="font-mono text-xs font-semibold tracking-wider text-white/40">
          {k.mahasiswa?.nim ?? "—"}
        </span>
      </div>

      <div className="min-w-[140px] flex-1 py-3.5 px-4">
        <span className="text-xs font-bold text-white/80">
          {k.mahasiswa?.nama ?? "—"}
        </span>
      </div>

      <div className="w-20 shrink-0 py-3.5 px-4 text-xs font-semibold text-white/50">
        {shortFakultas(k.mahasiswa?.fakultas)}
      </div>

      <div className="w-28 shrink-0 py-3.5 px-4">
        <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[0.68rem] font-semibold text-white/40">
          {k.mahasiswa?.sesiWisuda ?? "Sesi 1"}
        </span>
      </div>

      <div className="w-28 shrink-0 py-3.5 px-4 font-mono text-xs font-semibold tabular-nums text-white/40">
        {formatTime(k.waktuScan)}
      </div>

      <div className="w-24 shrink-0 py-3.5 px-4 text-xs font-semibold text-white/50">
        {k.petugasId ?? "—"}
      </div>

      <div className="w-28 shrink-0 py-3.5 px-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.68rem] font-semibold tracking-wide",
            cfg.pill,
          )}
        >
          <span className={cn("size-1.5 rounded-full", cfg.dot)} />
          {cfg.label}
        </span>
      </div>

      <div className="w-32 shrink-0 py-3.5 pr-5 pl-4 text-center">
        {k.statusKehadiran === "TIDAK_HADIR" ? (
          <button
            type="button"
            onClick={() => onCheckIn(k.mahasiswaId)}
            disabled={isRowLoading}
            className="inline-flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.08] px-2.5 text-[0.68rem] font-bold text-emerald-400 transition-all duration-150 hover:border-emerald-500/40 hover:bg-emerald-500/[0.15] hover:text-emerald-300 active:scale-[0.96] disabled:opacity-50"
          >
            {isRowLoading ? (
              <Loader2 className="size-3 animate-spin text-emerald-400" />
            ) : (
              <UserCheck className="size-3" />
            )}
            Hadir Manual
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onReset(k.mahasiswaId)}
            disabled={isRowLoading}
            className="inline-flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.04] px-2.5 text-[0.68rem] font-bold text-white/40 transition-all duration-150 hover:border-rose-500/20 hover:bg-rose-500/[0.1] hover:text-rose-400 active:scale-[0.96] disabled:opacity-50"
          >
            {isRowLoading ? (
              <Loader2 className="size-3 animate-spin text-rose-400" />
            ) : (
              <RotateCcw className="size-3" />
            )}
            Batal
          </button>
        )}
      </div>
    </div>
  );
});

export function KehadiranTable() {
  const {
    data,
    isLoading,
    total,
    manualCheckIn,
    resetCheckIn,
    fetchData,
    search,
    statusFilter,
    fakultasFilter,
    sesiFilter,
  } = useKehadiranStore();

  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, [fetchData, search, statusFilter, fakultasFilter, sesiFilter]);

  const listKey = [search, statusFilter, fakultasFilter, sesiFilter].join("|");

  const handleCheckIn = async (mahasiswaId: string) => {
    setActionLoading((prev) => ({ ...prev, [mahasiswaId]: true }));
    try {
      await manualCheckIn(mahasiswaId, "HADIR");
    } catch (err) {
      console.error("Check-in failed:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [mahasiswaId]: false }));
    }
  };

  const handleReset = async (mahasiswaId: string) => {
    setActionLoading((prev) => ({ ...prev, [mahasiswaId]: true }));
    try {
      await resetCheckIn(mahasiswaId);
    } catch (err) {
      console.error("Reset failed:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [mahasiswaId]: false }));
    }
  };

  const listItems = useMemo(
    () =>
      data.map((k) => (
        <KehadiranRow
          key={k.id}
          row={k}
          isRowLoading={!!actionLoading[k.mahasiswaId]}
          onCheckIn={handleCheckIn}
          onReset={handleReset}
        />
      )),
    [data, actionLoading],
  );

  const tableHeader = (
    <div
      className={cn(
        ROW_FLEX,
        "border-b border-white/[0.06] bg-[#0a1220]/95 backdrop-blur-sm",
      )}
    >
      {TABLE_HEADERS.map((h) => (
        <div
          key={h.label}
          className={cn(
            "text-left text-[0.68rem] font-bold uppercase tracking-wider text-white/30",
            h.cls,
            h.label === "Aksi" && "text-center",
          )}
        >
          {h.label}
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative z-10 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] shadow-2xl backdrop-blur-xl">
      <div className="overflow-x-auto">
        {isLoading && data.length === 0 ? (
          <TableSkeleton />
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatedList
            key={listKey}
            items={listItems}
            itemKeys={data.map((k) => k.id)}
            header={tableHeader}
            showGradients
            enableArrowNavigation={false}
            displayScrollbar
            itemEnterDelay={0.1}
            inViewAmount={0.35}
            maxHeight="min(72vh, 680px)"
            itemClassName="!m-0 !rounded-none"
            className="min-w-0 [&_.pointer-events-none]:from-[#07111f]"
          />
        )}
      </div>

      {data.length > 0 && (
        <div className="border-t border-white/[0.06] bg-white/[0.01] px-5 py-3.5">
          <p className="text-xs font-semibold text-white/30">
            Menampilkan{" "}
            <strong className="tabular-nums text-white/60">{data.length}</strong>
            {total > data.length ? (
              <span> dari {total} wisudawan</span>
            ) : (
              <span> wisudawan</span>
            )}
            <span className="text-white/20"> · scroll untuk melihat semua</span>
          </p>
        </div>
      )}
    </div>
  );
}
