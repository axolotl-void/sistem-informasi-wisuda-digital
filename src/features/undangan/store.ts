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

  init: () => {
    const invitations = generateMockInvitations(48);
    set({ invitations, stats: computeStats(invitations) });
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
}));

// Selector for filtered invitations
export function useFilteredInvitations() {
  return useUndanganStore((s) => {
    let list = s.invitations;
    const q = s.searchQuery.toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.mahasiswaNama.toLowerCase().includes(q) ||
          i.nim.includes(q) ||
          i.kode.toLowerCase().includes(q)
      );
    }
    if (s.filterStatus !== "all") list = list.filter((i) => i.status === s.filterStatus);
    if (s.filterSesi !== "all") list = list.filter((i) => i.sesi === s.filterSesi);
    if (s.filterAttendance !== "all") list = list.filter((i) => i.attendance === s.filterAttendance);
    return list;
  });
}
