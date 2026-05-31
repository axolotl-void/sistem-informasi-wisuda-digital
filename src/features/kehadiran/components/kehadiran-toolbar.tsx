"use client";

import { useState, useEffect } from "react";
import { Search, Download, RefreshCw, Filter } from "lucide-react";
import { toast } from "sonner";
import { useKehadiranStore } from "@/store/kehadiran.store";
import { FAKULTAS_LIST, API_ROUTES } from "@/utils/constants";
import { cn } from "@/lib/utils";
import { usePengaturanStore } from "@/store/pengaturan.store";

const inputClass = cn(
  "h-9 rounded-xl border text-xs font-medium outline-none transition-all duration-200",
  "border-slate-200/90 bg-white text-slate-800 placeholder:text-slate-400",
  "hover:border-slate-300 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10",
  "dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/80 dark:placeholder-white/20",
  "dark:hover:border-white/[0.15] dark:focus:border-emerald-500/50 dark:focus:bg-white/[0.05] dark:focus:ring-emerald-500/5",
);

const selectClass = cn(
  inputClass,
  "appearance-none cursor-pointer pr-8 font-semibold",
);

const toolbarShell = cn(
  "relative z-10 flex flex-col gap-3 rounded-2xl border p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between",
  "border-slate-200/90 bg-white/90 shadow-[0_4px_20px_rgba(59,130,246,0.05)]",
  "dark:border-white/[0.06] dark:bg-white/[0.01] dark:shadow-none",
);

export function KehadiranToolbar() {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    fakultasFilter,
    setFakultasFilter,
    sesiFilter,
    setSesiFilter,
    fetchData,
    fetchStats,
    isLoading,
  } = useKehadiranStore();

  const { sesiList, fetchSettings } = usePengaturanStore();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleRefresh = async () => {
    try {
      await Promise.all([fetchData(), fetchStats()]);
      toast.success("Data berhasil disegarkan");
    } catch {
      toast.error("Gagal menyegarkan data");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(API_ROUTES.KEHADIRAN.EXPORT);
      if (!res.ok) throw new Error("Export gagal");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-kehadiran-wisuda-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Laporan kehadiran berhasil diekspor ke CSV");
    } catch {
      toast.error("Gagal mengunduh laporan kehadiran");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={toolbarShell}>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative w-full sm:w-60 md:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Cari Nama atau NIM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(inputClass, "w-full pl-9.5 pr-3.5")}
          />
        </div>

        <div className="hidden size-9 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-500 lg:flex dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-white/40">
          <Filter className="size-3.5" />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">Semua Status</option>
            <option value="HADIR">Hadir Tepat Waktu</option>
            <option value="TERLAMBAT">Terlambat</option>
            <option value="TIDAK_HADIR">Belum Hadir</option>
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 size-1.5 -translate-y-1/2 rotate-45 border-r-2 border-b-2 border-slate-400 dark:border-white/30" />
        </div>

        <div className="relative max-w-xs">
          <select
            value={fakultasFilter}
            onChange={(e) => setFakultasFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">Semua Fakultas</option>
            {FAKULTAS_LIST.map((f) => (
              <option key={f} value={f}>
                {f.includes("FKIP") ? "FKIP" : f.includes("FSTIK") ? "FSTIK" : f}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 size-1.5 -translate-y-1/2 rotate-45 border-r-2 border-b-2 border-slate-400 dark:border-white/30" />
        </div>

        <div className="relative">
          <select
            value={sesiFilter}
            onChange={(e) => setSesiFilter(e.target.value)}
            className={selectClass}
          >
            <option value="all">Semua Sesi</option>
            {sesiList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 size-1.5 -translate-y-1/2 rotate-45 border-r-2 border-b-2 border-slate-400 dark:border-white/30" />
        </div>
      </div>

      <div className="flex items-center gap-2.5 md:ml-auto">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className={cn(
            inputClass,
            "inline-flex items-center gap-2 px-3.5 font-semibold active:scale-[0.97] disabled:opacity-50",
            "text-slate-600 hover:bg-slate-50 dark:text-white/60 dark:hover:text-white/80",
          )}
        >
          <RefreshCw
            className={cn("size-3.5", isLoading && "animate-spin text-emerald-500")}
          />
          Refresh
        </button>

        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className={cn(
            "inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition-all active:scale-[0.97] disabled:opacity-50",
            "border-emerald-300/80 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100",
            "dark:border-emerald-500/25 dark:bg-emerald-500/[0.06] dark:text-emerald-400 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/[0.12] dark:hover:text-emerald-300",
          )}
        >
          <Download className="size-3.5" />
          {isExporting ? "Mengunduh..." : "Export CSV"}
        </button>
      </div>
    </div>
  );
}
