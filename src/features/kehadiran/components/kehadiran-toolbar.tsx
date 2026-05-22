"use client";

import { useState } from "react";
import { Search, Download, RefreshCw, Filter } from "lucide-react";
import { toast } from "sonner";
import { useKehadiranStore } from "@/store/kehadiran.store";
import { FAKULTAS_LIST, API_ROUTES } from "@/utils/constants";

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

  const [isExporting, setIsExporting] = useState(false);

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
    <div className="relative z-10 flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.01] p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
      {/* Filters Area */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Search Field */}
        <div className="relative w-full sm:w-60 md:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Cari Nama atau NIM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-9.5 pr-3.5 text-xs text-white/80 placeholder-white/20 outline-none transition-all duration-200 hover:border-white/[0.15] focus:border-emerald-500/50 focus:bg-white/[0.05] focus:ring-4 focus:ring-emerald-500/5"
          />
        </div>

        {/* Filter Indicator Icon */}
        <div className="hidden size-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] text-white/40 lg:flex">
          <Filter className="size-3.5" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 appearance-none rounded-xl border border-white/[0.08] bg-[#07111F]/60 px-3.5 pr-8 text-xs font-semibold text-white/70 outline-none transition-all cursor-pointer hover:bg-white/[0.04] focus:border-emerald-500/50"
          >
            <option value="all" className="bg-[#0F172A] text-white/80">Semua Status</option>
            <option value="HADIR" className="bg-[#0F172A] text-white/80">Hadir Tepat Waktu</option>
            <option value="TERLAMBAT" className="bg-[#0F172A] text-white/80">Terlambat</option>
            <option value="TIDAK_HADIR" className="bg-[#0F172A] text-white/80">Belum Hadir</option>
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 size-1.5 -translate-y-1/2 border-r-2 border-b-2 border-white/30 transform rotate-45" />
        </div>

        {/* Fakultas Filter */}
        <div className="relative max-w-xs">
          <select
            value={fakultasFilter}
            onChange={(e) => setFakultasFilter(e.target.value)}
            className="h-9 appearance-none rounded-xl border border-white/[0.08] bg-[#07111F]/60 px-3.5 pr-8 text-xs font-semibold text-white/70 outline-none transition-all cursor-pointer hover:bg-white/[0.04] focus:border-emerald-500/50"
          >
            <option value="all" className="bg-[#0F172A] text-white/80">Semua Fakultas</option>
            {FAKULTAS_LIST.map((f) => (
              <option key={f} value={f} className="bg-[#0F172A] text-white/80">
                {f.includes("FKIP") ? "FKIP" : f.includes("FSTIK") ? "FSTIK" : f}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 size-1.5 -translate-y-1/2 border-r-2 border-b-2 border-white/30 transform rotate-45" />
        </div>

        {/* Sesi Filter */}
        <div className="relative">
          <select
            value={sesiFilter}
            onChange={(e) => setSesiFilter(e.target.value)}
            className="h-9 appearance-none rounded-xl border border-white/[0.08] bg-[#07111F]/60 px-3.5 pr-8 text-xs font-semibold text-white/70 outline-none transition-all cursor-pointer hover:bg-white/[0.04] focus:border-emerald-500/50"
          >
            <option value="all" className="bg-[#0F172A] text-white/80">Semua Sesi</option>
            <option value="Sesi 1" className="bg-[#0F172A] text-white/80">Sesi 1</option>
            <option value="Sesi 2" className="bg-[#0F172A] text-white/80">Sesi 2</option>
            <option value="Sesi 3" className="bg-[#0F172A] text-white/80">Sesi 3</option>
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 size-1.5 -translate-y-1/2 border-r-2 border-b-2 border-white/30 transform rotate-45" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 md:ml-auto">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-xs font-semibold text-white/60 transition-all duration-150 hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white/80 active:scale-[0.97] disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
          Refresh
        </button>

        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] px-3.5 text-xs font-semibold text-emerald-400 transition-all duration-150 hover:border-emerald-500/40 hover:bg-emerald-500/[0.12] hover:text-emerald-300 active:scale-[0.97] disabled:opacity-50 cursor-pointer"
        >
          <Download className="size-3.5" />
          {isExporting ? "Mengunduh..." : "Export CSV"}
        </button>
      </div>
    </div>
  );
}
