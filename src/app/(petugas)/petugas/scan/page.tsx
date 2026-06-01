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
} from "lucide-react";

export default function ScanPage() {
  const [activeTab, setActiveTab] = useState<"kehadiran" | "scanner" | "profil">("scanner");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { scanHistory, totalScanned, isConnected, activeGate, setActiveGate } = useScannerStore();
  const { gateList, fetchSettings } = usePengaturanStore();

  useEffect(() => {
    fetchSettings();
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("active_gate");
      if (saved) setActiveGate(saved);
    }
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
    <div className="relative min-h-screen w-full flex flex-col z-10 bg-[#0A0A0C]">
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
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Pemindai Gate Masuk
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Arahkan kamera ke QR code undangan wisudawan untuk mencatat kehadiran.
                </p>
              </div>

              {/* Responsive 2-Column Layout on Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start w-full">
                {/* Left: Camera view */}
                <div className="md:col-span-6 lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
                  {/* Gate Selector */}
                  <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-4.5 backdrop-blur-xl flex flex-col gap-2.5 mx-auto w-full max-w-[320px] sm:max-w-[350px] md:max-w-[380px]">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <DoorOpen className="size-3.5 text-blue-400 animate-pulse" />
                      Pintu Jaga (Gate) Aktif
                    </label>
                    <select
                      value={activeGate || ""}
                      onChange={(e) => setActiveGate(e.target.value || null)}
                      className="w-full h-11 px-3.5 rounded-xl border border-white/[0.08] bg-[#0C1120] text-xs text-white outline-none focus:border-blue-500/50 focus:bg-[#0C1120] transition-colors"
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
                  <ScanResultPanel />
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
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Riwayat Absensi
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Daftar wisudawan yang baru saja dipindai pada perangkat ini.
                </p>
              </div>

              {/* Stats Summary Widget */}
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5 backdrop-blur-xl">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Berhasil</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1">{totalScanned}</span>
                </div>
                <div className="flex flex-col border-l border-white/[0.08] pl-3.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Pindai</span>
                  <span className="text-2xl font-black text-blue-400 mt-1">{scanHistory.length}</span>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-500 transition-colors group-focus-within:text-blue-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, NIM, atau status..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all duration-200"
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
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border p-3.5 backdrop-blur-md transition-all duration-300",
                          item.success
                            ? "border-emerald-500/15 bg-emerald-500/[0.02]"
                            : "border-rose-500/15 bg-rose-500/[0.02]"
                        )}
                      >
                        <div className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                          item.success
                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                            : "border-rose-500/25 bg-rose-500/10 text-rose-400"
                        )}>
                          {item.success ? (
                            <CheckCircle2 className="size-4" />
                          ) : (
                            <XCircle className="size-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white leading-tight truncate">{nama}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-semibold text-slate-500 font-mono">{nim}</span>
                            <span className="size-1 rounded-full bg-slate-700" />
                            <span className="text-[9px] font-semibold text-slate-400 truncate max-w-[200px]">{prodi}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-[9px] font-black text-slate-500 font-mono">{formatWaktu(scanTime)}</p>
                          <span className={cn(
                            "inline-block text-[8px] font-black uppercase tracking-widest mt-1",
                            item.success ? "text-emerald-400" : "text-rose-400"
                          )}>
                            {item.success ? "Hadir" : "Gagal"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-white/[0.06] bg-white/[0.01]">
                    <Clock className="size-8 text-slate-600 animate-pulse mb-3" />
                    <p className="text-sm font-bold text-slate-400">Belum ada riwayat scan</p>
                    <p className="text-xs text-slate-500 mt-1">Gunakan tab scanner untuk memulai absensi.</p>
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
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Profil Pengawas
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Detail akun pengawas dan ringkasan aktivitas gate.
                </p>
              </div>

              {/* Responsive Grid for Profile & Stats Card on Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
                {/* Profile Card */}
                <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl h-full">
                  <div className="absolute -top-10 -right-10 size-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-base font-black shadow-lg shadow-blue-500/10">
                      {user?.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "P"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-white leading-tight truncate">{user?.name ?? "Pengawas"}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{user?.email ?? "email@wisuda.ac.id"}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-blue-500/25 bg-blue-500/10 text-[9px] font-black uppercase tracking-wider text-blue-400">
                        <Sparkles className="size-2.5" />
                        {user?.role ?? "PETUGAS_SCAN"}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/[0.08] my-4" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Koneksi Gateway</span>
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        {isConnected ? (
                          <>
                            <Wifi className="size-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Terhubung (Live)</span>
                          </>
                        ) : (
                          <>
                            <WifiOff className="size-3.5 text-rose-400" />
                            <span className="text-rose-400">Terputus</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Card */}
                <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl flex flex-col gap-4 h-full">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-4 text-emerald-400" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Statistik Gate</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] p-3.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Hasil Valid</span>
                      <p className="text-3xl font-black text-emerald-400 mt-1">{totalScanned}</p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] p-3.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Total Percobaan</span>
                      <p className="text-3xl font-black text-blue-400 mt-1">{scanHistory.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2.5 h-12 rounded-2xl border border-red-500/20 bg-red-500/[0.06] text-sm font-black text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer mt-2"
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
        className="fixed bottom-6 inset-x-4 max-w-sm mx-auto z-50 h-16 rounded-2xl border border-white/[0.08] bg-[#0A0A0C]/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-stretch justify-around px-2 py-1.5"
        aria-label="Menu Absensi"
      >
        {/* Left: Kehadiran */}
        <button
          type="button"
          onClick={() => setActiveTab("kehadiran")}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer",
            activeTab === "kehadiran"
              ? "text-blue-400"
              : "text-slate-500 hover:text-slate-400 active:bg-white/[0.03]"
          )}
        >
          <div className={cn(
            "flex size-9 items-center justify-center rounded-xl transition-all",
            activeTab === "kehadiran" && "bg-blue-500/15 border border-blue-500/20 shadow-md"
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
            "flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer relative -translate-y-2.5",
            activeTab === "scanner"
              ? "text-white"
              : "text-slate-500 hover:text-slate-400"
          )}
        >
          <div className={cn(
            "flex size-14 items-center justify-center rounded-full border shadow-2xl transition-all",
            activeTab === "scanner"
              ? "bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400/40 text-white shadow-blue-500/20"
              : "bg-slate-900 border-white/[0.08] text-slate-500 hover:bg-slate-800"
          )}>
            <QrCode className="size-6" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider mt-1">Scanner</span>
        </button>

        {/* Right: Profil */}
        <button
          type="button"
          onClick={() => setActiveTab("profil")}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer",
            activeTab === "profil"
              ? "text-blue-400"
              : "text-slate-500 hover:text-slate-400 active:bg-white/[0.03]"
          )}
        >
          <div className={cn(
            "flex size-9 items-center justify-center rounded-xl transition-all",
            activeTab === "profil" && "bg-blue-500/15 border border-blue-500/20 shadow-md"
          )}>
            <User className="size-4.5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider">Profil</span>
        </button>
      </nav>
    </div>
  );
}
