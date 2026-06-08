"use client";

import { useState, useMemo, useEffect, useCallback, useDeferredValue, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, CheckCircle2,
  Armchair, Search, DoorOpen, Loader2
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
  { id: 'block-cumlaude', capacity: 20, colorClass: 'bg-yellow-400 text-yellow-900', category: 'Cumlaude', size: 'w-6 h-6 text-[10px]' },
  { id: 'block-vip', capacity: 30, colorClass: 'bg-red-500 text-white', category: 'VIP & Dosen', size: 'w-6 h-6 text-[10px]' },
  { id: 'block-wisudawan-kiri', capacity: 350, colorClass: 'bg-blue-600 text-white', category: 'Wisudawan Kiri', size: 'w-5 h-5 text-[8px]' },
  { id: 'block-wisudawan-kanan', capacity: 350, colorClass: 'bg-blue-600 text-white', category: 'Wisudawan Kanan', size: 'w-5 h-5 text-[8px]' },
  { id: 'block-tamu-kiri', capacity: 250, colorClass: 'bg-teal-500 text-white', category: 'Tribun Samping Kiri', size: 'w-5 h-5 text-[8px]' },
  { id: 'block-tamu-kanan', capacity: 250, colorClass: 'bg-teal-500 text-white', category: 'Tribun Samping Kanan', size: 'w-5 h-5 text-[8px]' },
  { id: 'block-blk-kiri', capacity: 230, colorClass: 'bg-teal-500 text-white', category: 'Tribun Belakang Kiri', size: 'w-5 h-5 text-[8px]' },
  { id: 'block-blk-tengah', capacity: 190, colorClass: 'bg-teal-500 text-white', category: 'Tribun Belakang Tengah', size: 'w-5 h-5 text-[8px]' },
  { id: 'block-blk-kanan', capacity: 250, colorClass: 'bg-teal-500 text-white', category: 'Tribun Belakang Kanan', size: 'w-5 h-5 text-[8px]' }
];

const SEAT_BLOCKS_MAP = SEAT_BLOCKS.reduce<Record<string, SeatBlock>>((acc, block) => {
  acc[block.id] = block;
  return acc;
}, {});

// --- SeatItem Props and Component (Memoized) ---------------------------------
interface SeatItemProps {
  seat: SeatData;
  isSelected: boolean;
  isSearchMatched: boolean;
  onClick: (seat: SeatData) => void;
  block: SeatBlock;
}

const SeatItem = memo(
  ({ seat, isSelected, isSearchMatched, onClick, block }: SeatItemProps) => {
    const isHadir = seat.status === "checked-in" || seat.status === "vip";
    const hasStudent = !!seat.student;

    return (
      <div className="relative hover:z-50">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick(seat);
          }}
          className={cn(
            "rounded-sm flex items-center justify-center font-bold tracking-tighter cursor-pointer text-center select-none",
            block.size,
            // Transition via CSS for 60fps performance
            "transition-all duration-200",
            // Hover scale
            "hover:scale-150 hover:shadow-md hover:z-10",
            seat.status === "empty"
              ? "bg-slate-200 text-slate-400 dark:bg-white/5 dark:text-white/10 opacity-30 hover:opacity-100"
              : cn(
                  block.colorClass,
                  "opacity-90",
                  isHadir && "ring-1 ring-emerald-500/80 shadow-sm"
                ),
            isSelected && "!bg-emerald-500 !text-white scale-125 shadow-[0_0_0_2px_#047857] z-20",
            isSearchMatched && "!bg-yellow-400 !text-yellow-900 animate-bounce scale-150 ring-2 ring-yellow-600 z-30"
          )}
          aria-label={`Kursi ${seat.blockName} ${seat.seatCode}`}
        >
          {seat.seatCode}

          {/* Glowing dot for hadir */}
          {isHadir && !isSelected && !isSearchMatched && (
            <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-emerald-400 border border-emerald-950 animate-pulse" />
          )}
        </button>

        {/* Selected Seat Tooltip (Click-to-reveal) */}
        {isSelected && hasStudent && seat.student && (
          <div
            className={cn(
              "absolute -top-[90px] left-1/2 -translate-x-1/2 z-[999] whitespace-nowrap rounded-xl bg-slate-900/95 border border-white/10 p-3 shadow-2xl pointer-events-none text-left backdrop-blur-md",
              "animate-in fade-in zoom-in-95 duration-100 ease-out"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "size-2 rounded-full shrink-0",
                  isHadir ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
                )}
              />
              <p className="text-[11px] font-bold text-white leading-none">
                {seat.student.name}
              </p>
            </div>
            <p className="text-[9px] text-white/40 mt-1">
              NIM: {seat.student.nim}
            </p>
            <p className="text-[9px] text-white/30">
              Prodi: {seat.student.prodi}
            </p>

            <div className="mt-1.5 border-t border-white/[0.06] pt-1 flex items-center justify-between gap-4">
              <span className="text-[9px] font-bold text-white/45 tracking-wider uppercase">
                {seat.blockName} {seat.seatCode}
              </span>
              <span
                className={cn(
                  "text-[9px] font-bold tracking-wide",
                  isHadir ? "text-emerald-400" : "text-blue-400"
                )}
              >
                {isHadir ? `HADIR · ${seat.student.scanTime}` : "BELUM HADIR"}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isSearchMatched === nextProps.isSearchMatched &&
      prevProps.block.id === nextProps.block.id &&
      prevProps.seat.status === nextProps.seat.status &&
      prevProps.seat.student?.mahasiswaId === nextProps.seat.student?.mahasiswaId &&
      prevProps.seat.student?.name === nextProps.seat.student?.name &&
      prevProps.seat.student?.nim === nextProps.seat.student?.nim &&
      prevProps.seat.student?.prodi === nextProps.seat.student?.prodi &&
      prevProps.seat.student?.scanTime === nextProps.seat.student?.scanTime
    );
  }
);

SeatItem.displayName = "SeatItem";

export function SeatMonitor() {
  const [isMounted, setIsMounted] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [dosenInvitations, setDosenInvitations] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  
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

  // -- Search Highlight --
  const matchedSeatIds = useMemo(() => {
    if (!deferredSearchQuery.trim()) return new Set<string>();
    const query = deferredSearchQuery.toLowerCase().trim();
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
  }, [deferredSearchQuery, seatsData]);

  // ======================= RENDER ==========================

  if (!isMounted) {
    return (
      <div className="max-w-[1400px] w-full bg-white dark:bg-[#090d16] rounded-2xl shadow-2xl p-12 flex flex-col items-center justify-center min-h-[500px] border border-gray-200 dark:border-white/[0.06]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-blue-500 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Memuat Denah Kursi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] w-full bg-white dark:bg-[#090d16] rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-gray-200 dark:border-white/[0.06]">
      
      {/* ============ Sidebar Panel (Kiri) ============ */}
      <div className="w-full lg:w-1/4 bg-slate-900 text-white p-6 lg:p-8 flex flex-col border-r border-slate-800">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Armchair className="size-5 text-blue-400" />
            Denah Kursi Wisuda
          </h1>
          <p className="text-slate-400 text-sm">Gedung AAC Dayan Dawood USK</p>
          <p className="text-slate-500 text-xs mt-1">Total Kapasitas: 1.920 Kursi</p>
        </div>

        {/* Live Search Box */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari Nama / NIM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-lg bg-slate-800 border border-slate-700 pl-9 pr-4 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <Search className="absolute left-3 top-2.5 size-3.5 text-slate-500" />
          </div>
          {searchQuery && (
            <p className="text-[10px] text-slate-400 mt-1.5 font-bold">
              Ditemukan: <span className="text-yellow-400">{matchedSeatIds.size}</span> kursi
            </p>
          )}
        </div>

        {/* Legend / Keterangan Warna */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Kategori Kursi</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-yellow-400 shadow-sm" />
                <span className="text-sm">Cumlaude</span>
              </div>
              <span className="text-xs font-mono text-slate-400">{counts.cumlaude} / 20</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-red-500 shadow-sm" />
                <span className="text-sm">VIP & Dosen</span>
              </div>
              <span className="text-xs font-mono text-slate-400">{counts.vip} / 30</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-blue-600 shadow-sm" />
                <span className="text-sm">Wisudawan</span>
              </div>
              <span className="text-xs font-mono text-slate-400">{counts.wisudawan} / 700</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-teal-500 shadow-sm" />
                <span className="text-sm">Tamu/Orang Tua</span>
              </div>
              <span className="text-xs font-mono text-slate-400">{counts.tamu} / 1170</span>
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-700">
              <div className="w-4 h-4 rounded bg-emerald-500 shadow-sm ring-2 ring-emerald-700" />
              <span className="text-sm font-medium text-emerald-400">Kursi Dipilih</span>
            </div>
          </div>
        </div>

        {/* Info Panel Interaktif */}
        <div className="mt-auto bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-sm text-slate-400 mb-1">Status Pilihan:</h3>
          <div className="text-lg font-semibold">
            {selectedSeat ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                {selectedSeat.blockName} ({selectedSeat.seatCode})
              </span>
            ) : (
              <span className="text-white">Belum ada kursi dipilih</span>
            )}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {selectedSeat ? (
              selectedSeat.student ? (
                <>
                  <p>Nama: <b className="text-white">{selectedSeat.student.name}</b></p>
                  <p>NIM/NIDN: <span className="font-mono text-slate-300">{selectedSeat.student.nim}</span></p>
                  <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="w-full mt-3 h-8 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Detail Lengkap Profile
                  </button>
                </>
              ) : (
                <p className="text-slate-500 italic">Kursi kosong (belum dikaitkan).</p>
              )
            ) : (
              <p>Silakan klik pada salah satu titik kursi di peta denah.</p>
            )}
          </div>
        </div>
      </div>

      {/* ============ Area Peta Denah (Kanan) ============ */}
      <div 
        onClick={() => setSelectedSeat(null)}
        className="w-full lg:w-3/4 bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 overflow-auto relative max-h-[85vh]"
      >
        
        {/* Scan Alert Banner */}
        <AnimatePresence>
          {recentArrival && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-emerald-400/30 bg-emerald-50/70 p-4 text-emerald-800 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/[0.06] dark:text-emerald-300"
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

        {/* ===== Canvas Denah (AAC Dayan Dawood Map) ===== */}
        <div className="min-w-[1200px] mx-auto bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-white/[0.05]">
          
          {/* Panggung Senat */}
          <div className="w-full bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white text-center py-6 rounded-t-3xl rounded-b-md shadow-lg mb-12 relative flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold tracking-widest uppercase mb-1">PANGGUNG SENAT</h2>
            <div className="w-32 h-1 bg-white/30 rounded-full mt-2" />
          </div>

          {/* ===== Lantai Utama (Main Floor) ===== */}
          <div className="flex flex-row justify-between gap-6 mb-12">
              
            {/* Tribun Sayap Kiri */}
            <div className="w-1/6 flex flex-col items-center">
              <div className="text-xs font-semibold text-gray-500 dark:text-white/40 mb-2 uppercase tracking-wide">Tribun Kiri</div>
              <div className="w-full bg-teal-50/50 dark:bg-teal-500/[0.03] p-2 rounded-lg border border-teal-100 dark:border-teal-500/10 flex flex-wrap justify-center content-start gap-[2px] min-h-[300px]">
                {seatsData['block-tamu-kiri']?.map((seat) => (
                  <SeatItem
                    key={seat.id}
                    seat={seat}
                    isSelected={selectedSeat?.id === seat.id}
                    isSearchMatched={matchedSeatIds.has(seat.id)}
                    onClick={setSelectedSeat}
                    block={SEAT_BLOCKS_MAP[seat.blockId] || SEAT_BLOCKS[0]}
                  />
                ))}
              </div>
            </div>

            {/* Area Tengah (Cumlaude, VIP, Wisudawan) */}
            <div className="w-4/6 flex flex-col gap-6">
                
              {/* Baris Depan (Cumlaude & VIP) */}
              <div className="flex flex-row gap-6">
                <div className="w-1/2 flex flex-col items-center">
                  <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-2 uppercase tracking-wide">Cumlaude</div>
                  <div className="w-full bg-yellow-50/50 dark:bg-yellow-500/[0.03] p-3 rounded-lg border border-yellow-200 dark:border-yellow-500/10 flex flex-wrap justify-center gap-1">
                    {seatsData['block-cumlaude']?.map((seat) => (
                      <SeatItem
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedSeat?.id === seat.id}
                        isSearchMatched={matchedSeatIds.has(seat.id)}
                        onClick={setSelectedSeat}
                        block={SEAT_BLOCKS_MAP[seat.blockId] || SEAT_BLOCKS[0]}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-1/2 flex flex-col items-center">
                  <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wide">Dosen VIP</div>
                  <div className="w-full bg-red-50/50 dark:bg-red-500/[0.03] p-3 rounded-lg border border-red-200 dark:border-red-500/10 flex flex-wrap justify-center gap-1">
                    {seatsData['block-vip']?.map((seat) => (
                      <SeatItem
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedSeat?.id === seat.id}
                        isSearchMatched={matchedSeatIds.has(seat.id)}
                        onClick={setSelectedSeat}
                        block={SEAT_BLOCKS_MAP[seat.blockId] || SEAT_BLOCKS[0]}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Baris Wisudawan */}
              <div className="flex flex-row gap-6">
                <div className="w-1/2 flex flex-col items-center">
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">Wisudawan (Kiri)</div>
                  <div className="w-full bg-blue-50/50 dark:bg-blue-500/[0.03] p-3 rounded-lg border border-blue-200 dark:border-blue-500/10 flex flex-wrap justify-center gap-[3px]">
                    {seatsData['block-wisudawan-kiri']?.map((seat) => (
                      <SeatItem
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedSeat?.id === seat.id}
                        isSearchMatched={matchedSeatIds.has(seat.id)}
                        onClick={setSelectedSeat}
                        block={SEAT_BLOCKS_MAP[seat.blockId] || SEAT_BLOCKS[0]}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-1/2 flex flex-col items-center">
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">Wisudawan (Kanan)</div>
                  <div className="w-full bg-blue-50/50 dark:bg-blue-500/[0.03] p-3 rounded-lg border border-blue-200 dark:border-blue-500/10 flex flex-wrap justify-center gap-[3px]">
                    {seatsData['block-wisudawan-kanan']?.map((seat) => (
                      <SeatItem
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedSeat?.id === seat.id}
                        isSearchMatched={matchedSeatIds.has(seat.id)}
                        onClick={setSelectedSeat}
                        block={SEAT_BLOCKS_MAP[seat.blockId] || SEAT_BLOCKS[0]}
                      />
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Tribun Sayap Kanan */}
            <div className="w-1/6 flex flex-col items-center">
              <div className="text-xs font-semibold text-gray-500 dark:text-white/40 mb-2 uppercase tracking-wide">Tribun Kanan</div>
              <div className="w-full bg-teal-50/50 dark:bg-teal-500/[0.03] p-2 rounded-lg border border-teal-100 dark:border-teal-500/10 flex flex-wrap justify-center content-start gap-[2px] min-h-[300px]">
                {seatsData['block-tamu-kanan']?.map((seat) => (
                  <SeatItem
                    key={seat.id}
                    seat={seat}
                    isSelected={selectedSeat?.id === seat.id}
                    isSearchMatched={matchedSeatIds.has(seat.id)}
                    onClick={setSelectedSeat}
                    block={SEAT_BLOCKS_MAP[seat.blockId] || SEAT_BLOCKS[0]}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Pemisah Lantai Utama & Tribun Belakang */}
          <div className="relative w-full h-8 flex items-center justify-center mb-8">
            <div className="absolute w-full border-dashed border-t-2 border-gray-300 dark:border-white/15" />
            <span className="bg-white dark:bg-slate-900 px-4 text-xs font-semibold text-gray-400 dark:text-white/30 uppercase tracking-widest relative z-10">Area Tribun Belakang (Bertingkat)</span>
          </div>

          {/* ===== Tribun Belakang ===== */}
          <div className="flex flex-row justify-between gap-2">
              
            {/* Area Kiri + Pintu */}
            <div className="w-[30%] flex flex-col items-center">
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wide flex items-center gap-1">
                <DoorOpen className="size-3.5" /> Pintu Keluar
              </div>
              <div className="text-xs font-semibold text-gray-500 dark:text-white/40 mb-2 uppercase tracking-wide">Tribun Blk. Kiri</div>
              <div className="w-full bg-teal-50/50 dark:bg-teal-500/[0.03] p-3 rounded-lg border border-teal-100 dark:border-teal-500/10 flex flex-wrap justify-center gap-[3px]">
                {seatsData['block-blk-kiri']?.map((seat) => (
                  <SeatItem
                    key={seat.id}
                    seat={seat}
                    isSelected={selectedSeat?.id === seat.id}
                    isSearchMatched={matchedSeatIds.has(seat.id)}
                    onClick={setSelectedSeat}
                    block={SEAT_BLOCKS_MAP[seat.blockId] || SEAT_BLOCKS[0]}
                  />
                ))}
              </div>
            </div>

            {/* Visual Tangga 1 */}
            <div 
              className="w-8 rounded-sm shadow-inner opacity-70 hidden sm:block"
              style={{
                background: 'repeating-linear-gradient(to bottom, #f3f4f6, #f3f4f6 8px, #d1d5db 8px, #d1d5db 12px)',
                borderLeft: '1px solid #e5e7eb',
                borderRight: '1px solid #e5e7eb',
                marginTop: 28,
              }}
            />

            {/* Area Tengah + Layar */}
            <div className="w-[30%] flex flex-col items-center relative">
              {/* Indikator Layar Proyektor */}
              <div className="absolute -top-6 w-32 h-2 bg-gray-800 dark:bg-slate-600 rounded flex justify-center">
                <span className="text-[8px] text-white -mt-4 whitespace-nowrap">Layar Utama</span>
              </div>
              <div className="text-xs font-semibold text-gray-500 dark:text-white/40 mb-2 uppercase tracking-wide mt-5">Tribun Blk. Tengah</div>
              <div className="w-full bg-teal-50/50 dark:bg-teal-500/[0.03] p-3 rounded-lg border border-teal-100 dark:border-teal-500/10 flex flex-wrap justify-center gap-[3px]">
                {seatsData['block-blk-tengah']?.map((seat) => (
                  <SeatItem
                    key={seat.id}
                    seat={seat}
                    isSelected={selectedSeat?.id === seat.id}
                    isSearchMatched={matchedSeatIds.has(seat.id)}
                    onClick={setSelectedSeat}
                    block={SEAT_BLOCKS_MAP[seat.blockId] || SEAT_BLOCKS[0]}
                  />
                ))}
              </div>
            </div>

            {/* Visual Tangga 2 */}
            <div 
              className="w-8 rounded-sm shadow-inner opacity-70 hidden sm:block"
              style={{
                background: 'repeating-linear-gradient(to bottom, #f3f4f6, #f3f4f6 8px, #d1d5db 8px, #d1d5db 12px)',
                borderLeft: '1px solid #e5e7eb',
                borderRight: '1px solid #e5e7eb',
                marginTop: 28,
              }}
            />

            {/* Area Kanan + Pintu */}
            <div className="w-[30%] flex flex-col items-center">
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wide flex items-center gap-1">
                <DoorOpen className="size-3.5" /> Pintu Keluar
              </div>
              <div className="text-xs font-semibold text-gray-500 dark:text-white/40 mb-2 uppercase tracking-wide">Tribun Blk. Kanan</div>
              <div className="w-full bg-teal-50/50 dark:bg-teal-500/[0.03] p-3 rounded-lg border border-teal-100 dark:border-teal-500/10 flex flex-wrap justify-center gap-[3px]">
                {seatsData['block-blk-kanan']?.map((seat) => (
                  <SeatItem
                    key={seat.id}
                    seat={seat}
                    isSelected={selectedSeat?.id === seat.id}
                    isSearchMatched={matchedSeatIds.has(seat.id)}
                    onClick={setSelectedSeat}
                    block={SEAT_BLOCKS_MAP[seat.blockId] || SEAT_BLOCKS[0]}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Seat Detail Modal Popup */}
      <SeatModal seat={isProfileModalOpen ? selectedSeat : null} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );

}
