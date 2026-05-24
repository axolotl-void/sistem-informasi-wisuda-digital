"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2, XCircle, Clock, User,
  Activity, Trash2, ArrowRight, ShieldCheck,
  Building2, Hash, Armchair, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useScannerStore } from "@/store/scanner.store";
import { cn } from "@/lib/utils";

interface SeatLookup {
  seatCode: string;
  blockName: string;
  blockId: string;
}

export function ScanResultPanel() {
  const { lastResult, status, totalScanned, scanHistory, resetStatus, clearHistory } = useScannerStore();
  const [timeLeft, setTimeLeft] = useState(5);
  const [seatMap, setSeatMap] = useState<Record<string, SeatLookup>>({});

  useEffect(() => {
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
          const lookup: Record<string, SeatLookup> = {};
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
        console.warn("Gagal memuat peta kursi untuk panel scan", err);
      }
    }
    loadSeats();
  }, [status]);

  useEffect(() => {
    if (status === "success" || status === "error") {
      setTimeLeft(5);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { clearInterval(timer); resetStatus(); return 5; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, resetStatus]);

  const studentNim = lastResult?.mahasiswa?.nim;
  const studentSeat = studentNim ? seatMap[studentNim] : null;

  const GraduateCapSvg = () => (
    <svg className="size-16 text-emerald-500 dark:text-emerald-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21.75l1.256-4.59a1.75 1.75 0 01.508-.857l1.025-.85c.197-.163.479-.163.676 0l1.025.85a1.75 1.75 0 01.508.857L15 21.75" />
    </svg>
  );

  return (
    <div className="space-y-4">
      {/* --- Main Result Panel --- */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white dark:border-white/[0.08] dark:bg-[#0C1120] shadow-sm min-h-[340px] flex flex-col justify-between">

        {status === "success" && <div className="absolute -right-16 -top-16 -z-10 size-40 rounded-full bg-emerald-400/10 blur-[60px]" />}
        {status === "error"   && <div className="absolute -right-16 -top-16 -z-10 size-40 rounded-full bg-red-400/10 blur-[60px]" />}

        <div className="flex-1 flex flex-col p-5">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 dark:border-white/[0.06] pb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 flex items-center gap-1.5">
              <Activity className="size-3 text-blue-500 dark:text-blue-400" />
              Panel Validasi Absensi
            </span>
            {(status === "success" || status === "error") && (
              <span className="text-[10px] font-semibold text-gray-400 dark:text-white/30 bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] px-2 py-0.5 rounded-full">
                Reset {timeLeft}s
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* IDLE */}
            {status === "idle" && (
              <motion.div key="idle" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                <div className="relative mb-4 flex size-14 items-center justify-center rounded-2xl bg-gray-100 border border-gray-200 text-gray-300 dark:bg-white/[0.03] dark:border-white/[0.06] dark:text-white/20">
                  <Clock className="size-6 animate-pulse" />
                  <div className="absolute inset-0 rounded-2xl border border-blue-400/20 animate-ping opacity-20" />
                </div>
                <h4 className="text-sm font-bold text-gray-700 dark:text-white/80">Menunggu Pemindaian</h4>
                <p className="text-xs text-gray-400 dark:text-white/40 mt-1 max-w-[240px] leading-relaxed">
                  Arahkan QR Code kartu undangan ke arah viewfinder kamera untuk melakukan absensi
                </p>
              </motion.div>
            )}

            {/* SCANNING */}
            {status === "scanning" && (
              <motion.div key="scanning" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                <div className="relative mb-4 flex size-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400">
                  <Activity className="size-7 animate-spin" />
                </div>
                <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400">Memproses QR Code</h4>
                <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Menghubungkan ke server gate...</p>
              </motion.div>
            )}

            {/* SUCCESS */}
            {status === "success" && lastResult && lastResult.mahasiswa && (
              <motion.div key="success" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/[0.06] dark:border-emerald-500/20 px-3.5 py-2 rounded-2xl mb-5">
                  <div className="relative flex size-2 items-center justify-center">
                    <span className="absolute size-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping opacity-75" />
                    <span className="size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-wider">Absensi Valid</p>
                    <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/70 truncate">{lastResult.message}</p>
                  </div>
                  <ShieldCheck className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400/80" />
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/[0.06] dark:bg-white/[0.02] p-4 flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative size-24 shrink-0 flex items-center justify-center rounded-xl bg-gray-200 dark:bg-[#0F172A] border-2 border-emerald-300 dark:border-emerald-500/30 overflow-hidden shadow-lg group">
                    {lastResult.mahasiswa.foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={lastResult.mahasiswa.foto} alt={lastResult.mahasiswa.nama} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <GraduateCapSvg />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                    <h3 className="text-base font-black text-gray-900 dark:text-white leading-snug tracking-tight truncate flex items-center gap-1.5 justify-center sm:justify-start">
                      {lastResult.mahasiswa.nama}
                      <Sparkles className="size-3.5 text-amber-500 shrink-0" />
                    </h3>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-gray-500 dark:text-white/50 text-[11px] font-medium">
                      <Hash className="size-3 text-gray-300 dark:text-white/20 shrink-0" />
                      <span>{lastResult.mahasiswa.nim}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-gray-500 dark:text-white/50 text-[11px] font-medium truncate">
                      <Building2 className="size-3 text-gray-300 dark:text-white/20 shrink-0" />
                      <span className="truncate">{lastResult.mahasiswa.fakultas}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-white/35 font-bold tracking-wider uppercase border-t border-gray-200 dark:border-white/[0.04] pt-1.5 mt-1.5">
                      Prodi: <span className="text-gray-600 dark:text-white/60 font-semibold lowercase capitalize">{lastResult.mahasiswa.prodi}</span>
                    </p>
                  </div>
                </div>

                {studentSeat && (
                  <div className={cn(
                    "mt-4 rounded-2xl border p-3.5 flex items-center gap-3.5",
                    studentSeat.blockId === "yellow" && "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/[0.03]",
                    studentSeat.blockId === "cyan"   && "border-cyan-200 bg-cyan-50 dark:border-cyan-500/20 dark:bg-cyan-500/[0.03]",
                    studentSeat.blockId === "purple" && "border-fuchsia-200 bg-fuchsia-50 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/[0.03]",
                    studentSeat.blockId === "green"  && "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/[0.03]"
                  )}>
                    <div className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl border",
                      studentSeat.blockId === "yellow" && "bg-amber-100 border-amber-300 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400",
                      studentSeat.blockId === "cyan"   && "bg-cyan-100 border-cyan-300 text-cyan-600 dark:bg-cyan-500/10 dark:border-cyan-500/30 dark:text-cyan-400",
                      studentSeat.blockId === "purple" && "bg-fuchsia-100 border-fuchsia-300 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:border-fuchsia-500/30 dark:text-fuchsia-400",
                      studentSeat.blockId === "green"  && "bg-emerald-100 border-emerald-300 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400"
                    )}>
                      <Armchair className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 dark:text-white/30">Alokasi Tempat Duduk</p>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white mt-0.5">Kursi {studentSeat.seatCode}</h4>
                      <p className={cn("text-[10px] font-extrabold uppercase mt-0.5 tracking-wider",
                        studentSeat.blockId === "yellow" && "text-amber-600 dark:text-amber-400",
                        studentSeat.blockId === "cyan"   && "text-cyan-600 dark:text-cyan-400",
                        studentSeat.blockId === "purple" && "text-fuchsia-600 dark:text-fuchsia-400",
                        studentSeat.blockId === "green"  && "text-emerald-600 dark:text-emerald-400"
                      )}>{studentSeat.blockName}</p>
                    </div>
                    {lastResult.mahasiswa.sesiWisuda && (
                      <div className="text-right border-l border-gray-200 dark:border-white/[0.06] pl-3">
                        <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 dark:text-white/30">Sesi</p>
                        <p className="text-xs font-bold text-gray-600 dark:text-white/70 mt-0.5 truncate max-w-[80px]">{lastResult.mahasiswa.sesiWisuda}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ERROR */}
            {status === "error" && lastResult && (
              <motion.div key="error" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 dark:text-red-400 dark:bg-red-500/[0.06] dark:border-red-500/20 px-3.5 py-2.5 rounded-2xl mb-4">
                  <XCircle className="size-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-wider">Absensi Gagal / Ditolak</p>
                    <p className="text-[10px] text-red-500/80 dark:text-red-400/80 mt-0.5 leading-relaxed font-semibold">{lastResult.message}</p>
                  </div>
                </div>

                {lastResult.mahasiswa ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 dark:border-red-500/10 dark:bg-red-950/[0.08] p-4 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-red-500 dark:text-red-400/70 border-b border-red-200 dark:border-red-500/10 pb-1.5">
                      Data Terkait Undangan
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-100 border border-red-200 text-red-500 dark:bg-red-950/20 dark:border-red-500/20 dark:text-red-400">
                        <User className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-extrabold text-gray-900 dark:text-white truncate">{lastResult.mahasiswa.nama}</h4>
                        <p className="text-[10px] text-gray-500 dark:text-white/40 font-semibold mt-0.5">{lastResult.mahasiswa.nim}</p>
                        <p className="text-[9px] text-gray-400 dark:text-white/30 font-bold uppercase tracking-wider mt-0.5">{lastResult.mahasiswa.fakultas}</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-red-100 dark:bg-black/30 p-2.5 border border-red-200 dark:border-red-500/5 text-center text-[10px] text-red-600 dark:text-red-400 font-semibold leading-relaxed">
                      💡 Tiket undangan ini telah diklaim dan tidak dapat digunakan kembali. Laporkan kepada penanggung jawab jika terindikasi duplikasi.
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                    <div className="size-16 rounded-full bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 flex items-center justify-center text-red-500 dark:text-red-400 mb-3 animate-bounce">
                      <XCircle className="size-8" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-white/80">Kode QR Tidak Valid</h4>
                    <p className="text-[11px] text-gray-400 dark:text-white/40 max-w-[200px] mt-1 leading-relaxed">
                      QR Code ini tidak dikenali oleh sistem, pastikan tiket berasal dari portal resmi wisuda digital.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Button & Timer */}
        {(status === "success" || status === "error") && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.05] relative">
            <button
              type="button"
              onClick={resetStatus}
              className="flex w-full h-10 items-center justify-center gap-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-xs font-bold text-white transition-all cursor-pointer dark:bg-white/[0.06] dark:border dark:border-white/[0.1] dark:hover:bg-white/[0.1] dark:text-white"
            >
              Scan Selanjutnya
              <ArrowRight className="size-3.5" />
            </button>
            <div className="absolute bottom-[-24px] left-[-24px] right-[-24px] h-[3px] bg-gray-100 dark:bg-white/[0.03] overflow-hidden">
              <motion.div
                key={lastResult?.message || status}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className={cn("h-full bg-gradient-to-r", status === "success" ? "from-emerald-500 to-teal-400" : "from-red-500 to-rose-400")}
              />
            </div>
          </div>
        )}
      </div>

      {/* --- Counter Widget --- */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-500/20 dark:from-emerald-500/[0.06] dark:to-transparent p-3.5 shadow-sm dark:shadow-none">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{totalScanned}</p>
            <p className="text-[10px] font-semibold text-emerald-500/60 dark:text-emerald-400/40 uppercase tracking-wider mt-0.5">Berhasil</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-white dark:border-red-500/20 dark:from-red-500/[0.06] dark:to-transparent p-3.5 shadow-sm dark:shadow-none">
          <div className="flex size-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/15">
            <XCircle className="size-4 text-red-500 dark:text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-black text-red-500 dark:text-red-400 leading-none">{scanHistory.filter(r => !r.success).length}</p>
            <p className="text-[10px] font-semibold text-red-400/60 dark:text-red-400/40 uppercase tracking-wider mt-0.5">Gagal</p>
          </div>
        </div>
      </div>

      {/* --- Scan History --- */}
      {scanHistory.length > 0 && (
        <div className="rounded-2xl border border-gray-200/80 bg-white dark:border-white/[0.08] dark:bg-[#0C1120] overflow-hidden shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-white/40 flex items-center gap-1.5">
              <Activity className="size-3.5 text-blue-500 dark:text-blue-400" />
              Riwayat ({scanHistory.length})
            </h4>
            <button onClick={clearHistory} className="text-[10px] font-bold text-red-400 hover:text-red-600 dark:text-red-400/60 dark:hover:text-red-400 flex items-center gap-1 transition-all cursor-pointer">
              <Trash2 className="size-3" />
              Hapus
            </button>
          </div>
          <div className="p-3 space-y-1.5 max-h-44 overflow-y-auto">
            <AnimatePresence initial={false}>
              {scanHistory.slice(0, 8).map((result, idx) => (
                <motion.div
                  key={`${result.message}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-colors",
                    result.success
                      ? "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/[0.04] dark:hover:bg-emerald-500/[0.07]"
                      : "bg-red-50 hover:bg-red-100 dark:bg-red-500/[0.04] dark:hover:bg-red-500/[0.07]"
                  )}
                >
                  <div className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-md",
                    result.success ? "bg-emerald-100 dark:bg-emerald-500/15" : "bg-red-100 dark:bg-red-500/15"
                  )}>
                    {result.success
                      ? <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                      : <XCircle className="size-3 text-red-500 dark:text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 dark:text-white truncate text-[11px]">
                      {result.mahasiswa?.nama ?? "QR Code Tidak Valid"}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-white/40 font-semibold truncate mt-0.5">
                      {result.mahasiswa?.nim ? `NIM: ${result.mahasiswa.nim}` : result.message}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold text-gray-300 dark:text-white/20">
                    {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
