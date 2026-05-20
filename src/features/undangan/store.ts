import { create } from "zustand";
import type { Invitation, InvitationStats } from "./types";
import { generateMockInvitations, computeStats } from "./mock-data";

interface UndanganState {
  invitations: Invitation[];
  stats: InvitationStats;
  isLoading: boolean;
  selectedInvitation: Invitation | null;
  drawerInvitation: Invitation | null;
  isPreviewOpen: boolean;
  isDrawerOpen: boolean;
  isGenerateModalOpen: boolean;
  isMassGenerateOpen: boolean;
  searchQuery: string;
  filterStatus: string;
  filterSesi: string;
  filterAttendance: string;
}

interface UndanganActions {
  init: () => void;
  setSelectedInvitation: (inv: Invitation | null) => void;
  setDrawerInvitation: (inv: Invitation | null) => void;
  openPreview: (inv: Invitation) => void;
  closePreview: () => void;
  openDrawer: (inv: Invitation) => void;
  closeDrawer: () => void;
  openGenerateModal: () => void;
  closeGenerateModal: () => void;
  openMassGenerate: () => void;
  closeMassGenerate: () => void;
  setSearch: (q: string) => void;
  setFilterStatus: (s: string) => void;
  setFilterSesi: (s: string) => void;
  setFilterAttendance: (s: string) => void;
  generateInvitation: (id: string) => void;
  markDownloaded: (id: string) => void;
  deleteInvitation: (id: string) => void;
  deleteAll: () => void;
}

export const useUndanganStore = create<UndanganState & UndanganActions>((set, get) => ({
  invitations: [],
  stats: { total: 0, qrAktif: 0, belumGenerate: 0, sudahDownload: 0, sudahHadir: 0, totalKuotaTamu: 0 },
  isLoading: false,
  selectedInvitation: null,
  drawerInvitation: null,
  isPreviewOpen: false,
  isDrawerOpen: false,
  isGenerateModalOpen: false,
  isMassGenerateOpen: false,
  searchQuery: "",
  filterStatus: "all",
  filterSesi: "all",
  filterAttendance: "all",

  init: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/undangan?page=1&limit=1000", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      
      // Transform API data to match Invitation type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invitations: Invitation[] = result.data.data.map((item: any) => {
        const scanHistory = item.kehadiran ? [
          {
            id: item.kehadiran.id,
            timestamp: item.kehadiran.waktuScan || item.kehadiran.createdAt || new Date().toISOString(),
            gate: item.kehadiran.catatan || "Gate Utama",
            type: "masuk" as const,
            petugasName: "Petugas Scan",
          }
        ] : [];

        return {
          id: item.id,
          kode: item.kode,
          qrToken: item.qrToken || item.kode,
          qrImageUrl: item.qrImageUrl || "",
          status: item.kehadiran?.statusKehadiran === "HADIR" ? "sudah_hadir" :
                  item.statusUndangan === "AKTIF" ? "qr_aktif" : 
                  item.statusUndangan === "DIGUNAKAN" ? "sudah_download" :
                  item.statusUndangan === "KADALUARSA" ? "expired" : "belum_generate",
          attendance: item.kehadiran?.statusKehadiran === "HADIR" ? "hadir" :
                     item.kehadiran?.statusKehadiran === "TIDAK_HADIR" ? "tidak_hadir" : "belum_hadir",
          mahasiswaId: item.mahasiswaId || "",
          mahasiswaNama: item.mahasiswa?.nama || "Unknown",
          nim: item.mahasiswa?.nim || "-",
          fakultas: item.mahasiswa?.fakultas || "-",
          prodi: item.mahasiswa?.prodi || "-",
          sesi: item.mahasiswa?.sesiWisuda || "-",
          tanggalWisuda: item.tanggalWisuda || "-",
          waktuMulai: "-",
          waktuSelesai: "-",
          gedung: item.tempatWisuda || "-",
          ruangan: "-",
          nomorKursi: "-", // Not in schema yet
          kuotaTamu: item.kuotaTamu || 0,
          tamuHadir: item.kehadiran ? 1 : 0,
          generatedAt: item.createdAt,
          downloadedAt: item.updatedAt,
          firstScanAt: item.kehadiran?.waktuScan || undefined,
          lastScanAt: item.kehadiran?.waktuScan || undefined,
          scanCount: scanHistory.length,
          scanHistory,
          gate: item.kehadiran?.catatan || (item.kehadiran ? "Gate Utama" : undefined),
        };
      });
      
      set({ invitations, stats: computeStats(invitations), isLoading: false });
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
      // Fallback to mock data if API fails
      const invitations = generateMockInvitations(48);
      set({ invitations, stats: computeStats(invitations), isLoading: false });
    }
  },

  setSelectedInvitation: (inv) => set({ selectedInvitation: inv }),
  setDrawerInvitation: (inv) => set({ drawerInvitation: inv }),

  openPreview: (inv) => set({ selectedInvitation: inv, isPreviewOpen: true }),
  closePreview: () => set({ isPreviewOpen: false, selectedInvitation: null }),

  openDrawer: (inv) => set({ drawerInvitation: inv, isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false, drawerInvitation: null }),

  openGenerateModal: () => set({ isGenerateModalOpen: true }),
  closeGenerateModal: () => set({ isGenerateModalOpen: false }),

  openMassGenerate: () => set({ isMassGenerateOpen: true }),
  closeMassGenerate: () => set({ isMassGenerateOpen: false }),

  setSearch: (searchQuery) => set({ searchQuery }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setFilterSesi: (filterSesi) => set({ filterSesi }),
  setFilterAttendance: (filterAttendance) => set({ filterAttendance }),

  generateInvitation: (id) => {
    const invitations = get().invitations.map((inv) =>
      inv.id === id
        ? { ...inv, status: "qr_aktif" as const, generatedAt: new Date().toISOString() }
        : inv
    );
    set({ invitations, stats: computeStats(invitations) });
  },

  markDownloaded: (id) => {
    const invitations = get().invitations.map((inv) =>
      inv.id === id
        ? { ...inv, status: "sudah_download" as const, downloadedAt: new Date().toISOString() }
        : inv
    );
    set({ invitations, stats: computeStats(invitations) });
  },

  deleteInvitation: async (id) => {
    try {
      const response = await fetch(`/api/undangan/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete");
      
      // Update local state after successful delete
      const invitations = get().invitations.filter((inv) => inv.id !== id);
      set({ invitations, stats: computeStats(invitations) });
    } catch (error) {
      console.error("Failed to delete invitation:", error);
      // Still remove from local state even if API fails
      const invitations = get().invitations.filter((inv) => inv.id !== id);
      set({ invitations, stats: computeStats(invitations) });
    }
  },

  deleteAll: async () => {
    try {
      const response = await fetch("/api/undangan/delete-all", {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete all");
      
      // Update local state after successful delete
      set({ invitations: [], stats: computeStats([]) });
    } catch (error) {
      console.error("Failed to delete all invitations:", error);
      // Still clear local state even if API fails
      set({ invitations: [], stats: computeStats([]) });
    }
  },
}));

// Selector for filtered invitations
export function useFilteredInvitations() {
  return useUndanganStore((s) => {
    let list = s.invitations || [];
    const q = s.searchQuery ? s.searchQuery.toLowerCase().trim() : "";
    if (q) {
      list = list.filter(
        (i) =>
          (i.mahasiswaNama && i.mahasiswaNama.toLowerCase().includes(q)) ||
          (i.nim && i.nim.includes(q)) ||
          (i.kode && i.kode.toLowerCase().includes(q))
      );
    }
    if (s.filterStatus && s.filterStatus !== "all") {
      list = list.filter((i) => i.status === s.filterStatus);
    }
    if (s.filterSesi && s.filterSesi !== "all") {
      const sessionKeyword = s.filterSesi.replace("Sesi ", "");
      list = list.filter(
        (i) => i.sesi && i.sesi.toLowerCase().includes(sessionKeyword.toLowerCase())
      );
    }
    if (s.filterAttendance && s.filterAttendance !== "all") {
      list = list.filter((i) => i.attendance === s.filterAttendance);
    }
    return list;
  });
}
