import { create } from "zustand";
import { api } from "@/lib/axios";
import { toast } from "sonner";

interface UndanganDosenStats {
  total: number;
  hadir: number;
  belumHadir: number;
}

interface UndanganDosenState {
  data: any[];
  stats: UndanganDosenStats | null;
  isLoading: boolean;
  
  // Filters & Pagination
  search: string;
  statusFilter: string; // "all" | "hadir" | "belum_hadir"
  page: number;
  limit: number;
  total: number;
}

interface UndanganDosenActions {
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setPage: (page: number) => void;
  fetchData: () => Promise<void>;
  createInvitation: (input: {
    nama: string;
    jabatan: string;
    nidn?: string;
    email?: string;
    noWa?: string;
  }) => Promise<void>;
  updateInvitation: (
    id: string,
    input: {
      nama: string;
      jabatan: string;
      nidn?: string;
      email?: string;
      noWa?: string;
      statusHadir?: boolean;
    }
  ) => Promise<void>;
  deleteInvitation: (id: string) => Promise<void>;
  deleteAllInvitations: () => Promise<void>;
}

type UndanganDosenStore = UndanganDosenState & UndanganDosenActions;

export const useUndanganDosenStore = create<UndanganDosenStore>((set, get) => ({
  // State
  data: [],
  stats: null,
  isLoading: false,
  
  search: "",
  statusFilter: "all",
  page: 1,
  limit: 10,
  total: 0,

  // Setters
  setSearch: (search) => set({ search, page: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
  setPage: (page) => set({ page }),

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const { search, statusFilter, page, limit } = get();

      const params: Record<string, string | number> = {
        page,
        limit,
      };

      if (search) params.search = search;
      
      if (statusFilter === "hadir") {
        params.statusHadir = "true";
      } else if (statusFilter === "belum_hadir") {
        params.statusHadir = "false";
      }

      const res = await api.get("/api/undangan-dosen", { params });
      const responseData = res.data.data;

      set({
        data: responseData.data,
        total: responseData.total,
        stats: responseData.stats,
        page: responseData.page,
        limit: responseData.limit,
      });
    } catch (error) {
      console.error("Gagal mengambil data undangan dosen", error);
      toast.error("Gagal mengambil data undangan dosen");
    } finally {
      set({ isLoading: false });
    }
  },

  createInvitation: async (input) => {
    try {
      const res = await api.post("/api/undangan-dosen", input);
      toast.success(res.data.message || "Undangan dosen berhasil dibuat");
      await get().fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal membuat undangan dosen";
      toast.error(msg);
      throw error;
    }
  },

  updateInvitation: async (id, input) => {
    try {
      const res = await api.put(`/api/undangan-dosen/${id}`, input);
      toast.success(res.data.message || "Data undangan dosen berhasil diubah");
      await get().fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal mengubah data undangan dosen";
      toast.error(msg);
      throw error;
    }
  },

  deleteInvitation: async (id) => {
    try {
      const res = await api.delete(`/api/undangan-dosen/${id}`);
      toast.success(res.data.message || "Undangan dosen berhasil dihapus");
      await get().fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal menghapus undangan dosen";
      toast.error(msg);
      throw error;
    }
  },

  deleteAllInvitations: async () => {
    try {
      const res = await api.delete("/api/undangan-dosen");
      toast.success(res.data.message || "Semua undangan dosen berhasil dihapus");
      await get().fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal menghapus semua data";
      toast.error(msg);
      throw error;
    }
  },
}));
