"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, Sparkles, CheckCircle2, Info,
  Armchair, Award, Search, HelpCircle, LogIn, LogOut,
  DoorOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SeatModal } from "./seat-modal";
import { useSocket } from "@/hooks/use-socket";
import { useScannerStore } from "@/store/scanner.store";

// --- Types --------------------------------------------------------------------

export type SeatStatus = "checked-in" | "not-arrived" | "vip" | "empty";

export interface SeatData {
  id: string;
  blockId: string;
  blockName: string;
  row: number;
  col: number;
  seatCode: string;
  status: SeatStatus;
  student?: {
    mahasiswaId: string;
    name: string;
    nim: string;
    faculty: string;
    prodi: string;
    sesi: string;
    invitationNo: string;
    scanTime?: string;
    gate?: string;
  };
}

interface SeatBlock {
  id: string;
  capacity: number;
  colorClass: string;
  category: string;
  size: string;
}

// --- Block Configuration (Official AAC Dayan Dawood USK Layout) ---------------
const SEAT_BLOCKS: SeatBlock[] = [
  { id: 'block-cumlaude', capacity: 20, colorClass: 'bg-yellow-400 text-yellow-950 hover:bg-yellow-300 dark:bg-yellow-500 dark:text-yellow-950', category: 'Cumlaude', size: 'w-6 h-6 text-[10px]' },
  { id: 'block-vip', capacity: 30, colorClass: 'bg-red-500 text-white hover:bg-red-400 dark:bg-red-600', category: 'VIP & Dosen', size: 'w-6 h-6 text-[10px]' },
  { id: 'block-wisudawan-kiri', capacity: 350, colorClass: 'bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-700', category: 'Wisudawan Kiri', size: 'w-5 h-5 text-[8px]' },
  { id: 'block-wisudawan-kanan', capacity: 350, colorClass: 'bg-blue-600 text-white hover:bg-blue-500 dark:bg-blue-700', category: 'Wisudawan Kanan', size: 'w-5 h-5 text-[8px]' },
  { id: 'block-tamu-kiri', capacity: 250, colorClass: 'bg-teal-500 text-white hover:bg-teal-400 dark:bg-teal-600', category: 'Tribun Samping Kiri', size: 'w-5 h-5 text-[8px]' },
  { id: 'block-tamu-kanan', capacity: 250, colorClass: 'bg-teal-500 text-white hover:bg-teal-400 dark:bg-teal-600', category: 'Tribun Samping Kanan', size: 'w-5 h-5 text-[8px]' },
  { id: 'block-blk-kiri', capacity: 230, colorClass: 'bg-teal-500 text-white hover:bg-teal-400 dark:bg-teal-600', category: 'Tribun Belakang Kiri', size: 'w-5 h-5 text-[8px]' },
  { id: 'block-blk-tengah', capacity: 190, colorClass: 'bg-teal-500 text-white hover:bg-teal-400 dark:bg-teal-600', category: 'Tribun Belakang Tengah', size: 'w-5 h-5 text-[8px]' },
  { id: 'block-blk-kanan', capacity: 250, colorClass: 'bg-teal-500 text-white hover:bg-teal-400 dark:bg-teal-600', category: 'Tribun Belakang Kanan', size: 'w-5 h-5 text-[8px]' }
];

export function SeatMonitor() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [dosenInvitations, setDosenInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<SeatData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [recentArrival, setRecentArrival] = useState<{
    name: string;
    nim: string;
    blockName: string;
    seatCode: string;
    role: "student" | "dosen";
  } | null>(null);

  const { socket } = useSocket("admin");
  const { isConnected, lastResult } = useScannerStore();

  // -- Fetch Data function --
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resSeats, resDosen] = await Promise.all([
        fetch("/api/dashboard/seats"),
        fetch("/api/undangan-dosen?limit=500"),
      ]);
      const dataSeats = await resSeats.json();
      const dataDosen = await resDosen.json();
      if (dataSeats.success && dataSeats.data) {
        setInvitations(dataSeats.data);
      }
      if (dataDosen.success && dataDosen.data && dataDosen.data.data) {
        setDosenInvitations(dataDosen.data.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data kursi:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -- Real-time updates from scanner --
  useEffect(() => {
    if (lastResult && lastResult.success && lastResult.mahasiswa) {
      const student = lastResult.mahasiswa;
      const isDosen = student.prodi === "Dosen / Civitas";

      if (isDosen) {
        setRecentArrival({
          name: student.nama,
          nim: student.nim,
          blockName: "VIP & Dosen",
          seatCode: "VIP",
          role: "dosen"
        });
        setTimeout(() => setRecentArrival(null), 6000);

        setDosenInvitations((prevDosens) => {
          return prevDosens.map((d) => {
            if (d.kode === student.nim) {
              return {
                ...d,
                statusHadir: true,
                waktuScan: new Date().toISOString(),
                petugasId: lastResult.kehadiran?.petugasId || "Realtime Scan",
              };
            }
            return d;
          });
        });
      } else {
        // Cari block info untuk display alert banner
        const isCumlaude = student.isCumlaude === true;
        const blockName = isCumlaude ? "Cumlaude" : "Wisudawan";

        setRecentArrival({
          name: student.nama,
          nim: student.nim,
          blockName,
          seatCode: "Regular",
          role: "student"
        });
        setTimeout(() => setRecentArrival(null), 6000);

        setInvitations((prevInvs) => {
          return prevInvs.map((inv) => {
            if (inv.mahasiswa && inv.mahasiswa.id === student.id) {
              return {
                ...inv,
                kehadiran: lastResult.kehadiran || {
                  id: "realtime-update-id",
                  statusKehadiran: "HADIR",
                  waktuScan: new Date().toISOString(),
                  catatan: "Gate Masuk",
                  undanganId: inv.id,
                  mahasiswaId: student.id,
                  petugasId: "",
                  createdAt: new Date().toISOString(),
                },
              };
            }
            return inv;
          });
        });
      }
    }
  }, [lastResult]);

  // -- Map invitations and Dosen to seatsData (Grid blocks) --
  const seatsData = useMemo(() => {
    const cumlaudeInvs = invitations.filter(inv => inv.mahasiswa?.isCumlaude);
    const regularInvs = invitations.filter(inv => !inv.mahasiswa?.isCumlaude);

    // Tamu pendamping list
    const guestList: { inv: any; guestIndex: number }[] = [];
    invitations.forEach(inv => {
      if (inv.mahasiswa) {
        const guestCount = inv.kuotaTamu || 0;
        for (let i = 0; i < guestCount; i++) {
          guestList.push({ inv, guestIndex: i + 1 });
        }
      }
    });

    const blockSeatsMap: Record<string, SeatData[]> = {};

    SEAT_BLOCKS.forEach(block => {
      const blockSeats: SeatData[] = [];
      
      let items: any[] = [];
      if (block.id === 'block-cumlaude') {
        items = cumlaudeInvs;
      } else if (block.id === 'block-vip') {
        items = dosenInvitations;
      } else if (block.id === 'block-wisudawan-kiri') {
        items = regularInvs.slice(0, 350);
      } else if (block.id === 'block-wisudawan-kanan') {
        items = regularInvs.slice(350, 700);
      } else if (block.id === 'block-tamu-kiri') {
        items = guestList.slice(0, 250);
      } else if (block.id === 'block-tamu-kanan') {
        items = guestList.slice(250, 500);
      } else if (block.id === 'block-blk-kiri') {
        items = guestList.slice(500, 730);
      } else if (block.id === 'block-blk-tengah') {
        items = guestList.slice(730, 920);
      } else if (block.id === 'block-blk-kanan') {
        items = guestList.slice(920, 1170);
      }

      for (let i = 1; i <= block.capacity; i++) {
        const item = items[i - 1];
        const seatCode = `${i}`;
        const seatId = `${block.id}-${i}`;

        if (item) {
          let isHadir = false;
          let seatStatus: SeatStatus = "not-arrived";
          let studentDetails: any = null;

          if (block.id === 'block-vip') {
            isHadir = item.statusHadir === true;
            seatStatus = isHadir ? "vip" : "not-arrived";
            studentDetails = {
              mahasiswaId: item.id,
              name: item.nama,
              nim: item.nidn || "—",
              faculty: "Dosen",
              prodi: item.jabatan,
              sesi: "Undangan Dosen",
              invitationNo: item.kode,
              scanTime: item.waktuScan
                ? new Date(item.waktuScan).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : undefined,
              gate: item.petugasId ? "Scanner" : undefined,
            };
          } else if (block.id.startsWith('block-tamu') || block.id.startsWith('block-blk')) {
            const parentHadir =
              item.inv.kehadiran?.statusKehadiran === "HADIR" ||
              item.inv.kehadiran?.statusKehadiran === "TERLAMBAT";
            isHadir = parentHadir;
            seatStatus = isHadir ? "checked-in" : "not-arrived";
            studentDetails = {
              mahasiswaId: `guest-${item.inv.id}-${item.guestIndex}`,
              name: `Tamu ${item.guestIndex} - ${item.inv.mahasiswa.nama}`,
              nim: item.inv.mahasiswa.nim,
              faculty: item.inv.mahasiswa.fakultas,
              prodi: item.inv.mahasiswa.prodi,
              sesi: item.inv.mahasiswa.sesiWisuda || "Sesi Utama",
              invitationNo: item.inv.kode,
              scanTime: item.inv.kehadiran
                ? new Date(item.inv.kehadiran.waktuScan).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : undefined,
              gate: item.inv.kehadiran?.catatan || undefined,
            };
          } else {
            const parentHadir =
              item.kehadiran?.statusKehadiran === "HADIR" ||
              item.kehadiran?.statusKehadiran === "TERLAMBAT";
            isHadir = parentHadir;
            seatStatus = isHadir
              ? block.id === 'block-cumlaude' ? "vip" : "checked-in"
              : "not-arrived";
            studentDetails = {
              mahasiswaId: item.mahasiswa.id,
              name: item.mahasiswa.nama,
              nim: item.mahasiswa.nim,
              faculty: item.mahasiswa.fakultas,
              prodi: item.mahasiswa.prodi,
              sesi: item.mahasiswa.sesiWisuda || "Sesi Utama",
              invitationNo: item.kode,
              scanTime: item.kehadiran
                ? new Date(item.kehadiran.waktuScan).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : undefined,
              gate: item.kehadiran?.catatan || undefined,
            };
          }

          blockSeats.push({
            id: seatId,
            blockId: block.id,
            blockName: block.category,
            row: 0,
            col: i,
            seatCode,
            status: seatStatus,
            student: studentDetails,
          });
        } else {
          blockSeats.push({
            id: seatId,
            blockId: block.id,
            blockName: block.category,
            row: 0,
            col: i,
            seatCode,
            status: "empty",
          });
        }
      }
      blockSeatsMap[block.id] = blockSeats;
    });

    return blockSeatsMap;
  }, [invitations, dosenInvitations]);

  // -- Stats calculations --
  const counts = useMemo(() => {
    const cumlaude = invitations.filter(inv => inv.mahasiswa?.isCumlaude).length;
    const vip = dosenInvitations.length;
    const wisudawan = invitations.filter(inv => !inv.mahasiswa?.isCumlaude).length;
    let tamu = 0;
    invitations.forEach(inv => {
      tamu += inv.kuotaTamu || 0;
    });
    return { cumlaude, vip, wisudawan, tamu };
  }, [invitations, dosenInvitations]);

  const statsSummary = useMemo(() => {
    let totalAssigned = 0;
    let totalCheckedIn = 0;

    Object.values(seatsData).flat().forEach((s) => {
      if (s.student) {
        totalAssigned++;
        if (s.status === "checked-in" || s.status === "vip") {
          totalCheckedIn++;
        }
      }
    });

    return { totalAssigned, totalCheckedIn };
  }, [seatsData]);

  // -- Search Highlight --
  const matchedSeatIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const query = searchQuery.toLowerCase().trim();
    const ids = new Set<string>();
    Object.values(seatsData).flat().forEach(seat => {
      if (
        seat.student &&
        (seat.student.name.toLowerCase().includes(query) ||
         seat.student.nim.toLowerCase().includes(query))
      ) {
        ids.add(seat.id);
      }
    });
    return ids;
  }, [searchQuery, seatsData]);

  return (
    <div className="max-w-[1400px] w-full bg-white dark:bg-[#090d16] rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-slate-200 dark:border-white/[0.06] transition-all duration-300">
      
      {/* Sidebar Panel (Kiri) */}
      <div className="w-full lg:w-1/4 bg-slate-900 text-white p-6 lg:p-7 flex flex-col border-r border-slate-800 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 to-slate-950/10 pointer-events-none -z-10" />
        
        <div className="mb-6">
          <h1 className="text-xl font-black mb-1.5 tracking-tight flex items-center gap-2">
            <Armchair className="size-5 text-blue-400" />
            Denah Kursi Wisuda
          </h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Gedung AAC Dayan Dawood USK</p>
          <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-500 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
            <span>Total Kapasitas:</span>
            <span className="text-white font-mono font-black">1.920 Kursi</span>
          </div>
        </div>

        {/* Live Search Box */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari Nama / NIM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-xl bg-slate-950/70 border border-slate-800 pl-8.5 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <Search className="absolute left-3 top-2.5 size-3.5 text-slate-500" />
          </div>
          {searchQuery && (
            <p className="text-[10px] text-slate-400 mt-1.5 font-bold">
              Ditemukan: <span className="text-yellow-400">{matchedSeatIds.size}</span> kursi
            </p>
          )}
        </div>

        {/* Legend / Keterangan Kategori */}
        <div className="mb-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Kategori Kursi</h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs bg-slate-950/20 p-1.5 rounded-lg border border-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded bg-yellow-400 dark:bg-yellow-500 shadow-sm" />
                <span className="font-semibold text-slate-300">Cumlaude</span>
              </div>
              <span className="font-mono text-slate-400 font-bold">{counts.cumlaude} / 20</span>
            </div>
            <div className="flex items-center justify-between text-xs bg-slate-950/20 p-1.5 rounded-lg border border-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded bg-red-500 shadow-sm" />
                <span className="font-semibold text-slate-300">VIP & Dosen</span>
              </div>
              <span className="font-mono text-slate-400 font-bold">{counts.vip} / 30</span>
            </div>
            <div className="flex items-center justify-between text-xs bg-slate-950/20 p-1.5 rounded-lg border border-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded bg-blue-600 shadow-sm" />
                <span className="font-semibold text-slate-300">Wisudawan</span>
              </div>
              <span className="font-mono text-slate-400 font-bold">{counts.wisudawan} / 700</span>
            </div>
            <div className="flex items-center justify-between text-xs bg-slate-950/20 p-1.5 rounded-lg border border-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded bg-teal-500 shadow-sm" />
                <span className="font-semibold text-slate-300">Tamu & Orang Tua</span>
              </div>
              <span className="font-mono text-slate-400 font-bold">{counts.tamu} / 1170</span>
            </div>
            
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2.5 text-xs text-emerald-400">
              <div className="w-3.5 h-3.5 rounded bg-emerald-500 ring-2 ring-emerald-700 shadow-sm animate-pulse" />
              <span className="font-bold">Kursi Dipilih</span>
            </div>
          </div>
        </div>

        {/* Info Panel Interaktif */}
        <div className="mt-auto bg-slate-950/60 rounded-2xl p-4.5 border border-slate-800 flex flex-col gap-2">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Pilihan:</h3>
          <div className="text-base font-extrabold text-white leading-tight">
            {selectedSeat ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="size-4 shrink-0" />
                {selectedSeat.blockName} ({selectedSeat.seatCode})
              </span>
            ) : (
              "Belum ada kursi dipilih"
            )}
          </div>
          <div className="text-[11px] leading-relaxed text-slate-400 mt-1 space-y-1.5 border-t border-slate-800/60 pt-2">
            {selectedSeat ? (
              selectedSeat.student ? (
                <>
                  <p>Nama: <b className="text-white font-extrabold">{selectedSeat.student.name}</b></p>
                  <p>NIM/NIDN: <span className="font-mono text-slate-300">{selectedSeat.student.nim}</span></p>
                  <button 
                    onClick={() => setSelectedSeat(selectedSeat)}
                    className="w-full mt-2 h-7 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Detail Lengkap Profile
                  </button>
                </>
              ) : (
                <p className="text-slate-500 italic">Kursi fisik kosong (belum dikaitkan/scan).</p>
              )
            ) : (
              <p className="text-slate-500">Silakan klik pada salah satu titik kursi di peta denah sebelah kanan.</p>
            )}
          </div>
        </div>
      </div>

      {/* Area Peta Denah (Kanan) */}
      <div className="w-full lg:w-3/4 bg-slate-50 dark:bg-slate-950 p-4 lg:p-6 overflow-auto relative max-h-[85vh] transition-colors duration-300">
        
        {/* -- Scan Alert Banner --------------------------------------- */}
        <AnimatePresence>
          {recentArrival && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-emerald-400/30 bg-emerald-50/70 p-4 text-emerald-800 shadow-[0_4px_12px_rgba(16,185,129,0.08)] dark:border-emerald-500/20 dark:bg-emerald-500/[0.06] dark:text-emerald-300"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="size-5 animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Scan Masuk Berhasil
                  </p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-white mt-0.5">
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                      {recentArrival.name}
                    </span>{" "}
                    ({recentArrival.nim}) menempati blok{" "}
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {recentArrival.blockName}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-emerald-100/80 px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" /> Real-time
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas Denah (AAC Dayan Dawood Map) */}
        <div className="min-w-[1200px] mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-white/[0.05] relative transition-colors duration-300">
          
          {/* Panggung Senat */}
          <div className="w-full bg-gradient-to-r from-red-950 via-red-800 to-red-950 text-white text-center py-6 rounded-2xl shadow-lg mb-10 relative flex flex-col items-center justify-center">
            <h2 className="text-xl font-black tracking-widest uppercase mb-1">PANGGUNG SENAT</h2>
            <div className="w-32 h-1 bg-white/20 rounded-full mt-2" />
          </div>

          {/* Lantai Utama (Main Floor) */}
          <div className="flex flex-row justify-between gap-6 mb-10">
              
              {/* Tribun Sayap Kiri */}
              <div className="w-[15%] flex flex-col items-center">
                  <div className="text-[10px] font-black text-slate-500 dark:text-white/40 mb-2 uppercase tracking-widest">Tribun Kiri</div>
                  <div className="w-full bg-teal-50/30 dark:bg-teal-500/[0.03] p-2 rounded-xl border border-teal-100 dark:border-teal-500/10 flex flex-wrap justify-center content-start gap-[2px] min-h-[300px]">
                      {seatsData['block-tamu-kiri']?.map((seat) => renderSeatItem(seat))}
                  </div>
              </div>

              {/* Area Tengah (Cumlaude, VIP, Wisudawan) */}
              <div className="w-[70%] flex flex-col gap-6">
                  
                  {/* Baris Depan (Cumlaude & VIP) */}
                  <div className="flex flex-row gap-6">
                      <div className="w-1/2 flex flex-col items-center">
                          <div className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 mb-2 uppercase tracking-widest">Cumlaude</div>
                          <div className="w-full bg-yellow-50/30 dark:bg-yellow-500/[0.03] p-3 rounded-xl border border-yellow-250 dark:border-yellow-500/10 flex flex-wrap justify-center gap-1">
                              {seatsData['block-cumlaude']?.map((seat) => renderSeatItem(seat))}
                          </div>
                      </div>
                      <div className="w-1/2 flex flex-col items-center">
                          <div className="text-[10px] font-black text-red-600 dark:text-red-400 mb-2 uppercase tracking-widest">Dosen VIP</div>
                          <div className="w-full bg-red-50/30 dark:bg-red-500/[0.03] p-3 rounded-xl border border-red-250 dark:border-red-500/10 flex flex-wrap justify-center gap-1">
                              {seatsData['block-vip']?.map((seat) => renderSeatItem(seat))}
                          </div>
                      </div>
                  </div>

                  {/* Baris Wisudawan */}
                  <div className="flex flex-row gap-6">
                      <div className="w-1/2 flex flex-col items-center">
                          <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-widest font-bold">Wisudawan (Kiri)</div>
                          <div className="w-full bg-blue-50/30 dark:bg-blue-500/[0.03] p-3 rounded-xl border border-blue-200 dark:border-blue-500/10 flex flex-wrap justify-center gap-[3px]">
                              {seatsData['block-wisudawan-kiri']?.map((seat) => renderSeatItem(seat))}
                          </div>
                      </div>
                      <div className="w-1/2 flex flex-col items-center">
                          <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-widest font-bold">Wisudawan (Kanan)</div>
                          <div className="w-full bg-blue-50/30 dark:bg-blue-500/[0.03] p-3 rounded-xl border border-blue-200 dark:border-blue-500/10 flex flex-wrap justify-center gap-[3px]">
                              {seatsData['block-wisudawan-kanan']?.map((seat) => renderSeatItem(seat))}
                          </div>
                      </div>
                  </div>

              </div>

              {/* Sayap Kanan */}
              <div className="w-[15%] flex flex-col items-center">
                  <div className="text-[10px] font-black text-slate-500 dark:text-white/40 mb-2 uppercase tracking-widest">Tribun Kanan</div>
                  <div className="w-full bg-teal-50/30 dark:bg-teal-500/[0.03] p-2 rounded-xl border border-teal-100 dark:border-teal-500/10 flex flex-wrap justify-center content-start gap-[2px] min-h-[300px]">
                      {seatsData['block-tamu-kanan']?.map((seat) => renderSeatItem(seat))}
                  </div>
              </div>
          </div>

          {/* Pemisah Lantai Utama & Tribun Belakang */}
          <div className="relative w-full h-8 flex items-center justify-center mb-8">
              <div className="absolute w-full h-[1px] bg-slate-200 dark:bg-white/10 border-dashed border-t-2 border-slate-300 dark:border-white/15" />
              <span className="bg-white dark:bg-slate-900 px-4 text-[9px] font-black text-slate-400 dark:text-white/30 uppercase tracking-widest relative z-10">Area Tribun Belakang (Bertingkat)</span>
          </div>

          {/* Tribun Belakang */}
          <div className="flex flex-row justify-between gap-4">
              
              {/* Area Kiri + Pintu */}
              <div className="w-[30%] flex flex-col items-center">
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wide flex items-center gap-1">
                      <DoorOpen className="size-3.5" /> Pintu Keluar
                  </div>
                  <div className="text-[10px] font-black text-slate-500 dark:text-white/45 mb-2 uppercase tracking-widest">Tribun Blk. Kiri</div>
                  <div className="w-full bg-teal-50/30 dark:bg-teal-500/[0.03] p-3 rounded-xl border border-teal-100 dark:border-teal-500/10 flex flex-wrap justify-center gap-[3px]">
                      {seatsData['block-blk-kiri']?.map((seat) => renderSeatItem(seat))}
                  </div>
              </div>

              {/* Visual Tangga 1 */}
              <div 
                className="w-8 border-l border-r border-slate-200 dark:border-white/10 mt-7 rounded shadow-inner opacity-75 hidden sm:block"
                style={{
                  background: 'repeating-linear-gradient(to bottom, transparent, transparent 8px, rgba(148,163,184,0.3) 8px, rgba(148,163,184,0.3) 12px)'
                }}
              />

              {/* Area Tengah + Layar */}
              <div className="w-[30%] flex flex-col items-center relative pt-6">
                  {/* Indikator Layar Proyektor */}
                  <div className="absolute top-0 w-28 h-5 bg-slate-800 dark:bg-slate-700 rounded-b-md border-b-2 border-slate-600 dark:border-slate-500 flex items-center justify-center shadow-sm">
                      <span className="text-[9px] text-slate-300 dark:text-slate-200 font-bold tracking-wider">Layar Utama</span>
                  </div>
                  <div className="text-[10px] font-black text-slate-500 dark:text-white/45 mb-2 uppercase tracking-widest mt-2">Tribun Blk. Tengah</div>
                  <div className="w-full bg-teal-50/30 dark:bg-teal-500/[0.03] p-3 rounded-xl border border-teal-100 dark:border-teal-500/10 flex flex-wrap justify-center gap-[3px]">
                      {seatsData['block-blk-tengah']?.map((seat) => renderSeatItem(seat))}
                  </div>
              </div>

              {/* Visual Tangga 2 */}
              <div 
                className="w-8 border-l border-r border-slate-200 dark:border-white/10 mt-7 rounded shadow-inner opacity-75 hidden sm:block"
                style={{
                  background: 'repeating-linear-gradient(to bottom, transparent, transparent 8px, rgba(148,163,184,0.3) 8px, rgba(148,163,184,0.3) 12px)'
                }}
              />

              {/* Area Kanan + Pintu */}
              <div className="w-[30%] flex flex-col items-center">
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wide flex items-center gap-1">
                      <DoorOpen className="size-3.5" /> Pintu Keluar
                  </div>
                  <div className="text-[10px] font-black text-slate-500 dark:text-white/45 mb-2 uppercase tracking-widest">Tribun Blk. Kanan</div>
                  <div className="w-full bg-teal-50/30 dark:bg-teal-500/[0.03] p-3 rounded-xl border border-teal-100 dark:border-teal-500/10 flex flex-wrap justify-center gap-[3px]">
                      {seatsData['block-blk-kanan']?.map((seat) => renderSeatItem(seat))}
                  </div>
              </div>
          </div>

        </div>
      </div>

      {/* Seat Detail Modal Popup */}
      <SeatModal seat={selectedSeat} onClose={() => setSelectedSeat(null)} />
    </div>
  );

  // Helper renderer untuk single seat button
  function renderSeatItem(seat: SeatData) {
    const isSelected = selectedSeat?.id === seat.id;
    const isHovered = hoveredSeat?.id === seat.id;
    const isHadir = seat.status === "checked-in" || seat.status === "vip";
    const hasStudent = !!seat.student;
    
    // Cari warna dasarnya berdasarkan blockId
    const block = SEAT_BLOCKS.find(b => b.id === seat.blockId) || SEAT_BLOCKS[0];

    // Cek highlight pencarian
    const isSearchMatched = matchedSeatIds.has(seat.id);

    return (
      <div key={seat.id} className="relative overflow-visible">
        <button
          type="button"
          onMouseEnter={() => hasStudent && setHoveredSeat(seat)}
          onMouseLeave={() => setHoveredSeat(null)}
          onClick={() => setSelectedSeat(seat)}
          className={cn(
            "rounded-sm flex items-center justify-center font-bold tracking-tighter transition-all duration-200 cursor-pointer text-center select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
            block.size,
            seat.status === "empty" 
              ? "bg-slate-200 text-slate-400 dark:bg-white/5 dark:text-white/10 opacity-25 hover:opacity-100 hover:scale-125"
              : cn(
                  block.colorClass,
                  isHadir 
                    ? "opacity-100 ring-1 ring-emerald-500/80 shadow-md scale-100 hover:scale-135 hover:z-25"
                    : "opacity-55 hover:opacity-100 hover:scale-135 hover:z-25"
                ),
            isSelected && "!bg-emerald-500 !text-white transform scale-135 ring-2 ring-emerald-700 z-30 shadow-lg",
            isSearchMatched && "!bg-yellow-400 !text-yellow-950 animate-bounce scale-135 ring-2 ring-yellow-600 z-30"
          )}
          aria-label={`Kursi ${seat.blockName} ${seat.seatCode}`}
        >
          {seat.seatCode}

          {/* Glowing dot indicator untuk yang sudah hadir */}
          {isHadir && !isSelected && !isSearchMatched && (
            <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-emerald-400 border border-emerald-950 animate-pulse" />
          )}
        </button>

        {/* Custom React Hover Tooltip */}
        <AnimatePresence>
          {isHovered && hasStudent && seat.student && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="absolute -top-[98px] left-1/2 -translate-x-1/2 z-[999] whitespace-nowrap rounded-2xl bg-[#090D16]/98 border border-white/[0.1] p-3.5 shadow-[0_15px_35px_rgba(0,0,0,0.85)] pointer-events-none text-left backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "size-2 rounded-full shrink-0",
                    isHadir ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
                  )}
                />
                <p className="text-[11px] font-extrabold text-white tracking-tight leading-none">
                  {seat.student.name}
                </p>
              </div>
              <p className="text-[9px] font-bold text-white/40 mt-1">
                NIM: {seat.student.nim}
              </p>
              <p className="text-[9px] font-bold text-white/30">
                Prodi: {seat.student.prodi}
              </p>

              <div className="mt-1.5 border-t border-white/[0.06] pt-1 flex items-center justify-between gap-4">
                <span className="text-[9px] font-black text-white/45 tracking-widest uppercase">
                  {seat.blockName} {seat.seatCode}
                </span>
                <span
                  className={cn(
                    "text-[9px] font-black tracking-wide",
                    isHadir ? "text-emerald-400" : "text-blue-400"
                  )}
                >
                  {isHadir ? `HADIR · ${seat.student.scanTime}` : "BELUM HADIR"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
}
