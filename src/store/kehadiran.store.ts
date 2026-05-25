import { create } from "zustand";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import type { Kehadiran, KehadiranStats } from "@/types/kehadiran.type";

interface KehadiranState {
  data: Kehadiran[];
  stats: KehadiranStats | null;
  isLoading: boolean;
  isLoadingStats: boolean;
  
  // Filters & Pagination
  search: string;
  statusFilter: string;
  fakultasFilter: string;
  sesiFilter: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Batas fetch untuk list scroll (tanpa pagination UI) */
export const KEHADIRAN_SCROLL_LIMIT = 500;

interface KehadiranActions {
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setFakultasFilter: (fakultas: string) => void;
  setSesiFilter: (sesi: string) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  fetchData: () => Promise<void>;
  fetchStats: () => Promise<void>;
  manualCheckIn: (mahasiswaId: string, status?: "HADIR" | "TERLAMBAT") => Promise<void>;
  resetCheckIn: (mahasiswaId: string) => Promise<void>;
  updateLocalRow: (mahasiswaId: string, updates: Partial<Kehadiran>) => void;
}

type KehadiranStore = KehadiranState & KehadiranActions;

export const useKehadiranStore = create<KehadiranStore>((set, get) => ({
  // State
  data: [],
  stats: null,
  isLoading: false,
  isLoadingStats: false,
  
  search: "",
  statusFilter: "all",
  fakultasFilter: "all",
  sesiFilter: "all",
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,

  // Setters
  setSearch: (search) => set({ search }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setFakultasFilter: (fakultasFilter) => set({ fakultasFilter }),
  setSesiFilter: (sesiFilter) => set({ sesiFilter }),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit }),

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const { search, statusFilter, fakultasFilter, sesiFilter } = get();

      const params: Record<string, string | number> = {
        page: 1,
        limit: KEHADIRAN_SCROLL_LIMIT,
      };
      
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      if (fakultasFilter !== "all") params.fakultas = fakultasFilter;
      if (sesiFilter !== "all") params.sesi = sesiFilter;

      const res = await api.get("/api/kehadiran", { params });
      const responseData = res.data.data;
      
      set({
        data: responseData.data,
        total: responseData.total,
        totalPages: responseData.totalPages,
        page: responseData.page,
        limit: responseData.limit,
      });
    } catch (error) {
      console.error("Gagal mengambil data kehadiran", error);
      toast.error("Gagal mengambil data kehadiran");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    set({ isLoadingStats: true });
    try {
      const res = await api.get("/api/kehadiran/stats");
      set({ stats: res.data.data });
    } catch (error) {
      console.error("Gagal mengambil statistik kehadiran", error);
    } finally {
      set({ isLoadingStats: false });
    }
  },

  // Manual Overrides
  manualCheckIn: async (mahasiswaId, status = "HADIR") => {
    try {
      const res = await api.post("/api/kehadiran", {
        mahasiswaId,
        statusKehadiran: status,
        catatan: "Ditandai hadir manual oleh admin",
      });
      
      toast.success(res.data.message || "Berhasil menandai kehadiran mahasiswa");
      
      // Refresh data & stats
      get().fetchData();
      get().fetchStats();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal melakukan check-in manual";
      toast.error(msg);
      throw error;
    }
  },

  resetCheckIn: async (mahasiswaId) => {
    try {
      const res = await api.post("/api/kehadiran", {
        mahasiswaId,
        statusKehadiran: "TIDAK_HADIR",
        catatan: "Kehadiran direset oleh admin",
      });
      
      toast.success("Berhasil mereset status kehadiran mahasiswa");
      
      // Refresh data & stats
      get().fetchData();
      get().fetchStats();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal mereset status kehadiran";
      toast.error(msg);
      throw error;
    }
  },

  updateLocalRow: (mahasiswaId, updates) => {
    set((state) => ({
      data: state.data.map((row) =>
        row.mahasiswaId === mahasiswaId ? { ...row, ...updates } : row
      ),
    }));
  },
}));
