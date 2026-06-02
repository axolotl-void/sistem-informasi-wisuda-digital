"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScannerStore } from "@/store/scanner.store";
import { usePengaturanStore } from "@/store/pengaturan.store";
import { useSocket } from "@/hooks/use-socket";
import { QrScannerView } from "@/features/scanner/components/qr-scanner-view";
import { ScanResultPanel } from "@/features/scanner/components/scan-result-panel";
import { PetugasHeader } from "@/components/layout/petugas-header";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ScanResult } from "@/types/kehadiran.type";
import {
  Clock,
  QrCode,
  User,
  LogOut,
  Search,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
  Sparkles,
  TrendingUp,
  DoorOpen,
  Armchair,
  Building2,
} from "lucide-react";

export default function ScanPage() {
  const [activeTab, setActiveTab] = useState<"kehadiran" | "scanner" | "profil">("scanner");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null);
  const [seatMap, setSeatMap] = useState<Record<string, { seatCode: string; blockName: string; blockId: string }>>({});
  
  const { scanHistory, totalScanned, isConnected, activeGate, setActiveGate } = useScannerStore();
  const { gateList, fetchSettings } = usePengaturanStore();

  useEffect(() => {
    fetchSettings();
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("active_gate");
      if (saved) setActiveGate(saved);
    }

    async function loadSeats() {
      try {
        const res = await fetch("/api/dashboard/seats");
        const data = await res.json();
        if (data.success && data.data) {
          const invitations = data.data as any[];
          const sortedInvs = [...invitations].sort((a, b) =>
            (a.mahasiswa?.nim || "").localeCompare(b.mahasiswa?.nim || "")
          );
          const BLOCKS_CONFIG = [
            { id: "yellow", name: "Blok Kuning", rowsLayout: [5, 6, 6, 7, 7, 8] },
            { id: "cyan",   name: "Blok Biru",   rowsLayout: [7, 7, 7, 7, 8, 8, 8] },
            { id: "purple", name: "Blok Ungu",   rowsLayout: [7, 7, 7, 7, 8, 8, 8] },
            { id: "green",  name: "Blok Hijau",  rowsLayout: [5, 6, 6, 7, 7, 8] },
          ];
          const numStudents = sortedInvs.length;
          const blockCapacities = BLOCKS_CONFIG.map((b) =>
            b.rowsLayout.reduce((sum, cols) => sum + cols, 0)
          );
          const totalCapacity = blockCapacities.reduce((a, b) => a + b, 0);
          let allocated = 0;
          const lookup: Record<string, { seatCode: string; blockName: string; blockId: string }> = {};
          BLOCKS_CONFIG.forEach((block, idx) => {
            const cap = blockCapacities[idx];
            const count =
              idx === BLOCKS_CONFIG.length - 1
                ? numStudents - allocated
                : Math.round((cap / totalCapacity) * numStudents);
            const groupInvs = sortedInvs.slice(allocated, allocated + count);
            allocated += count;
            let studentIndex = 0;
            block.rowsLayout.forEach((colsInRow, row) => {
              for (let col = 0; col < colsInRow; col++) {
                const inv = groupInvs[studentIndex];
                if (inv && inv.mahasiswa) {
                  const seatCode = `${String.fromCharCode(65 + row)}${col + 1}`;
                  lookup[inv.mahasiswa.nim] = { seatCode, blockName: block.name, blockId: block.id };
                  studentIndex++;
                }
              }
            });
          });
          setSeatMap(lookup);
        }
      } catch (err) {
        console.warn("Gagal memuat peta kursi di ScanPage", err);
      }
    }
    loadSeats();
  }, [fetchSettings, setActiveGate]);
  const { user, logout } = useAuth();
  
  useSocket("scanner");

  // Format time display
  const formatWaktu = (time: any) => {
    if (!time) return "—";
    const date = new Date(time);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Filter scan history based on search query
  const filteredHistory = scanHistory.filter((item) => {
    const name = item.mahasiswa?.nama || item.kehadiran?.mahasiswa?.nama || "";
    const nim = item.mahasiswa?.nim || item.kehadiran?.mahasiswa?.nim || "";
    const msg = item.message || "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="relative min-h-screen w-full flex flex-col z-10 bg-slate-50 dark:bg-[#0A0A0C] transition-colors duration-300">
      {/* 1. LIQUID CANVAS BACKGROUND (Lightweight CSS Blobs) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] dark:bg-blue-500/5" />
        <div className="absolute top-[35%] right-[10%] w-[60%] h-[60%] bg-teal-500/10 rounded-full blur-[140px] dark:bg-teal-500/5" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] dark:bg-indigo-500/5" />
      </div>

      {/* -- Header -- */}
      <PetugasHeader />

      {/* -- Main Content -- */}
      <main className="flex-1 w-full max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4 py-5 z-10 flex flex-col justify-start pb-28">
        
        {/* Render Tab Views */}
        <AnimatePresence mode="wait">
          {activeTab === "scanner" && (
            <motion.div
              key="scanner-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col gap-5"
            >
              {/* Info Title */}
              <div className="text-center md:text-left mb-2">
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white leading-tight transition-colors">
                  Pemindai Gate Masuk
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 transition-colors">
                  Arahkan kamera ke QR code undangan wisudawan untuk mencatat kehadiran.
                </p>
              </div>

              {/* Responsive 2-Column Layout on Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start w-full">
                {/* Left: Camera view */}
                <div className="md:col-span-6 lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
                  {/* Gate Selector */}
                  <div className="rounded-3xl border border-slate-200/80 bg-white/80 dark:border-white/[0.08] dark:bg-white/[0.02] p-4.5 backdrop-blur-xl flex flex-col gap-2.5 mx-auto w-full max-w-[320px] sm:max-w-[350px] md:max-w-[380px] shadow-sm dark:shadow-none transition-all duration-300">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                      <DoorOpen className="size-3.5 text-blue-500 dark:text-blue-400 animate-pulse" />
                      Pintu Jaga (Gate) Aktif
                    </label>
                    <select
                      value={activeGate || ""}
                      onChange={(e) => setActiveGate(e.target.value || null)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#0C1120] text-xs text-slate-800 dark:text-white outline-none focus:border-blue-500/50 focus:bg-white dark:focus:bg-[#0C1120] transition-colors"
                    >
                      <option value="">-- Pilih Gate Pemindai --</option>
                      {gateList.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <QrScannerView />
                </div>

                {/* Right: Validation panel */}
                <div className="md:col-span-6 lg:col-span-5 xl:col-span-4">
                  <ScanResultPanel seatMap={seatMap} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "kehadiran" && (
            <motion.div
              key="kehadiran-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col gap-4"
            >
              <div className="text-center md:text-left mb-1">
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white leading-tight transition-colors">
                  Riwayat Absensi
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 transition-colors">
                  Daftar wisudawan yang baru saja dipindai pada perangkat ini.
                </p>
              </div>

              {/* Stats Summary Widget */}
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200/85 bg-white/70 dark:border-white/[0.08] dark:bg-white/[0.02] p-3.5 backdrop-blur-xl shadow-sm dark:shadow-none transition-all duration-300">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Berhasil</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 transition-colors">{totalScanned}</span>
                </div>
                <div className="flex flex-col border-l border-slate-200 dark:border-white/[0.08] pl-3.5 transition-colors">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Pindai</span>
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 transition-colors">{scanHistory.length}</span>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, NIM, atau status..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white/80 dark:border-white/[0.08] dark:bg-white/[0.03] backdrop-blur-md text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/[0.06] transition-all duration-200 shadow-sm dark:shadow-none"
                />
              </div>

              {/* History List */}
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item, idx) => {
                    const nama = item.mahasiswa?.nama || item.kehadiran?.mahasiswa?.nama || "Tidak Dikenal";
                    const nim = item.mahasiswa?.nim || item.kehadiran?.mahasiswa?.nim || "—";
                    const prodi = item.mahasiswa?.prodi || "—";
                    const scanTime = item.kehadiran?.waktuScan || new Date();

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedResult(item)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border p-3.5 backdrop-blur-md transition-all duration-300 shadow-sm dark:shadow-none cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
                          item.success
                            ? "border-emerald-500/15 bg-emerald-50/50 dark:bg-emerald-500/[0.02] hover:bg-emerald-50/80 dark:hover:bg-emerald-500/[0.04] hover:border-emerald-500/30"
                            : "border-rose-500/15 bg-rose-50/50 dark:bg-rose-500/[0.02] hover:bg-rose-50/80 dark:hover:bg-rose-500/[0.04] hover:border-rose-500/30"
                        )}
                      >
                        <div className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-xl border transition-all",
                          item.success
                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        )}>
                          {item.success ? (
                            <CheckCircle2 className="size-4" />
                          ) : (
                            <XCircle className="size-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate transition-colors">{nama}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 font-mono transition-colors">{nim}</span>
                            <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-700 transition-colors" />
                            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[200px] transition-colors">{prodi}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 font-mono transition-colors">{formatWaktu(scanTime)}</p>
                          <span className={cn(
                            "inline-block text-[8px] font-black uppercase tracking-widest mt-1 transition-colors",
                            item.success ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          )}>
                            {item.success ? "Hadir" : "Gagal"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.01] transition-all duration-300">
                    <Clock className="size-8 text-slate-400 dark:text-slate-600 animate-pulse mb-3" />
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors">Belum ada riwayat scan</p>
                    <p className="text-xs text-slate-450 dark:text-slate-500 mt-1 transition-colors">Gunakan tab scanner untuk memulai absensi.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "profil" && (
            <motion.div
              key="profil-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col gap-5"
            >
              <div className="text-center md:text-left mb-1">
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-white leading-tight transition-colors">
                  Profil Pengawas
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 transition-colors">
                  Detail akun pengawas dan ringkasan aktivitas gate.
                </p>
              </div>

              {/* Responsive Grid for Profile & Stats Card on Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
                {/* Profile Card */}
                <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 dark:border-white/[0.08] dark:bg-white/[0.03] p-5 backdrop-blur-xl h-full shadow-sm dark:shadow-none transition-all duration-300">
                  <div className="absolute -top-10 -right-10 size-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-base font-black shadow-lg shadow-blue-500/10">
                      {user?.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "P"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight truncate transition-colors">{user?.name ?? "Pengawas"}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">{user?.email ?? "email@wisuda.ac.id"}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-blue-500/25 bg-blue-500/10 text-[9px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 transition-colors">
                        <Sparkles className="size-2.5" />
                        {user?.role ?? "PETUGAS_SCAN"}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-slate-250 dark:bg-white/[0.08] my-4 transition-colors" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Koneksi Gateway</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold transition-colors">
                        {isConnected ? (
                          <>
                            <Wifi className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400">Terhubung (Live)</span>
                          </>
                        ) : (
                          <>
                            <WifiOff className="size-3.5 text-rose-600 dark:text-rose-400" />
                            <span className="text-rose-600 dark:text-rose-400">Terputus</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Card */}
                <div className="rounded-3xl border border-slate-200/80 bg-white/80 dark:border-white/[0.08] dark:bg-white/[0.03] p-5 backdrop-blur-xl flex flex-col gap-4 h-full shadow-sm dark:shadow-none transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400 transition-colors" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Statistik Gate</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 dark:border-white/[0.05] dark:bg-white/[0.01] p-3.5 transition-all duration-300">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Hasil Valid</span>
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 transition-colors">{totalScanned}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 dark:border-white/[0.05] dark:bg-white/[0.01] p-3.5 transition-all duration-300">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Total Percobaan</span>
                      <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1 transition-colors">{scanHistory.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2.5 h-12 rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/[0.06] text-sm font-black text-red-650 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/10 hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer mt-2 shadow-sm dark:shadow-none"
              >
                <LogOut className="size-4" />
                Keluar dari Sistem
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* -- Sticky Bottom Navigation Dock (Apple-style) -- */}
      <nav
        className="fixed bottom-6 inset-x-4 max-w-sm mx-auto z-50 h-16 rounded-2xl border border-slate-200/80 bg-white/80 dark:border-white/[0.08] dark:bg-[#0A0A0C]/70 backdrop-blur-2xl shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-stretch justify-around px-2 py-1.5 transition-colors duration-300"
        aria-label="Menu Absensi"
      >
        {/* Left: Kehadiran */}
        <button
          type="button"
          onClick={() => setActiveTab("kehadiran")}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer",
            activeTab === "kehadiran"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 active:bg-slate-100 dark:active:bg-white/[0.03]"
          )}
        >
          <div className={cn(
            "flex size-9 items-center justify-center rounded-xl transition-all",
            activeTab === "kehadiran" && "bg-blue-500/10 border border-blue-500/20 dark:bg-blue-500/15 dark:border-blue-500/20 shadow-sm dark:shadow-md"
          )}>
            <Clock className="size-4.5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider">Kehadiran</span>
        </button>

        {/* Middle: Scanner */}
        <button
          type="button"
          onClick={() => setActiveTab("scanner")}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer",
            activeTab === "scanner"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 active:bg-slate-100 dark:active:bg-white/[0.03]"
          )}
        >
          <div className={cn(
            "flex size-9 items-center justify-center rounded-xl transition-all",
            activeTab === "scanner" && "bg-blue-500/10 border border-blue-500/20 dark:bg-blue-500/15 dark:border-blue-500/20 shadow-sm dark:shadow-md"
          )}>
            <QrCode className="size-4.5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider">Scanner</span>
        </button>

        {/* Right: Profil */}
        <button
          type="button"
          onClick={() => setActiveTab("profil")}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer",
            activeTab === "profil"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 active:bg-slate-100 dark:active:bg-white/[0.03]"
          )}
        >
          <div className={cn(
            "flex size-9 items-center justify-center rounded-xl transition-all",
            activeTab === "profil" && "bg-blue-500/10 border border-blue-500/20 dark:bg-blue-500/15 dark:border-blue-500/20 shadow-sm dark:shadow-md"
          )}>
            <User className="size-4.5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider">Profil</span>
        </button>
      </nav>

      {/* Detail Modal Dialog */}
      <Dialog open={selectedResult !== null} onOpenChange={(open) => { if (!open) setSelectedResult(null); }}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#0E1222] border border-slate-200 dark:border-white/[0.08] rounded-[28px] p-5 shadow-2xl backdrop-blur-2xl">
          <DialogHeader className="border-b border-slate-100 dark:border-white/[0.06] pb-3">
            <DialogTitle className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white flex items-center gap-2">
              <QrCode className="size-4 text-blue-500" />
              Detail Kursi & Kehadiran
            </DialogTitle>
          </DialogHeader>

          {selectedResult && (
            <div className="space-y-4 pt-1">
              {/* Status Header */}
              <div className={cn(
                "flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border text-xs font-bold",
                selectedResult.success
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/[0.06] dark:border-emerald-500/20"
                  : "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/[0.06] dark:border-red-500/20"
              )}>
                {selectedResult.success ? (
                  <CheckCircle2 className="size-4.5 text-emerald-500" />
                ) : (
                  <XCircle className="size-4.5 text-red-500" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-black uppercase tracking-wider">
                    {selectedResult.success ? "Absensi Valid / Hadir" : "Absensi Gagal"}
                  </p>
                  <p className="text-[10px] opacity-80 truncate">{selectedResult.message}</p>
                </div>
              </div>

              {/* Graduate Profile Details */}
              {selectedResult.mahasiswa && (
                <div className="rounded-2xl border border-slate-150 bg-slate-50/50 dark:border-white/[0.06] dark:bg-white/[0.02] p-4 flex gap-4 items-center">
                  <div className="relative size-16 shrink-0 flex items-center justify-center rounded-xl bg-slate-200 dark:bg-[#0F172A] border border-slate-300 dark:border-white/10 overflow-hidden shadow-sm">
                    {selectedResult.mahasiswa.foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedResult.mahasiswa.foto}
                        alt={selectedResult.mahasiswa.nama}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="size-8 text-slate-400 dark:text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h4 className="text-sm font-black text-slate-800 dark:text-white truncate">
                      {selectedResult.mahasiswa.nama}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                      <span className="font-mono">{selectedResult.mahasiswa.nim}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold truncate">
                      {selectedResult.mahasiswa.prodi}
                    </p>
                  </div>
                </div>
              )}

              {/* Seat Allocation Details */}
              {selectedResult.success && selectedResult.mahasiswa && seatMap[selectedResult.mahasiswa.nim] ? (
                (() => {
                  const seat = seatMap[selectedResult.mahasiswa.nim];
                  return (
                    <div className={cn(
                      "rounded-2xl border p-4 flex flex-col gap-3",
                      seat.blockId === "yellow" && "border-amber-200 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-500/[0.03]",
                      seat.blockId === "cyan"   && "border-cyan-200 bg-cyan-50/60 dark:border-cyan-500/20 dark:bg-cyan-500/[0.03]",
                      seat.blockId === "purple" && "border-fuchsia-200 bg-fuchsia-50/60 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/[0.03]",
                      seat.blockId === "green"  && "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/[0.03]"
                    )}>
                      <div className="flex items-center gap-3.5">
                        <div className={cn(
                          "flex size-12 shrink-0 items-center justify-center rounded-xl border",
                          seat.blockId === "yellow" && "bg-amber-100 border-amber-300 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400",
                          seat.blockId === "cyan"   && "bg-cyan-100 border-cyan-300 text-cyan-600 dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-cyan-400",
                          seat.blockId === "purple" && "bg-fuchsia-100 border-fuchsia-300 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:border-fuchsia-500/30 dark:text-fuchsia-400",
                          seat.blockId === "green"  && "bg-emerald-100 border-emerald-300 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400"
                        )}>
                          <Armchair className="size-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Nomor Kursi Wisudawan
                          </p>
                          <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
                            Kursi {seat.seatCode}
                          </h3>
                        </div>
                      </div>

                      <div className="h-px bg-slate-200/50 dark:bg-white/[0.06] my-1" />

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Blok / Ruangan
                          </p>
                          <p className={cn(
                            "font-extrabold uppercase mt-0.5 tracking-wide",
                            seat.blockId === "yellow" && "text-amber-600 dark:text-amber-400",
                            seat.blockId === "cyan"   && "text-cyan-600 dark:text-cyan-400",
                            seat.blockId === "purple" && "text-fuchsia-600 dark:text-fuchsia-400",
                            seat.blockId === "green"  && "text-emerald-600 dark:text-emerald-400"
                          )}>
                            {seat.blockName}
                          </p>
                        </div>
                        {selectedResult.mahasiswa.sesiWisuda && (
                          <div className="border-l border-slate-200 dark:border-white/[0.06] pl-3">
                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Sesi Acara
                            </p>
                            <p className="font-bold text-slate-700 dark:text-white/70 mt-0.5 truncate">
                              {selectedResult.mahasiswa.sesiWisuda}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : selectedResult.success ? (
                <div className="rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.01] p-3 text-center text-xs text-slate-500 dark:text-slate-400">
                  ⚠️ Peta kursi belum dikonfigurasi atau tidak tersedia untuk mahasiswa ini.
                </div>
              ) : (
                <div className="rounded-2xl border border-red-100 bg-red-50/50 dark:border-red-500/10 dark:bg-red-950/[0.04] p-3 text-center text-xs text-red-650 dark:text-red-400">
                  ⚠️ Absensi tidak valid. Silakan hubungi meja administrasi atau panitia pusat.
                </div>
              )}

              {/* Timestamp & Gate */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/30 dark:border-white/[0.04] dark:bg-white/[0.01] p-3.5 text-xs text-slate-500 dark:text-slate-400 space-y-1.5 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Waktu Pindai</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {formatWaktu(selectedResult.kehadiran?.waktuScan || new Date())}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Pintu Masuk (Gate)</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {selectedResult.kehadiran?.gate || activeGate || "—"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
