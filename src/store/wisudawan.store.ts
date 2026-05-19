import { create } from "zustand";
import type { WisudawanRow } from "@/services/wisudawan.service";

interface WisudawanState {
  data: WisudawanRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  search: string;
  statusFilter: string;
  fakultasFilter: string;
  selected: WisudawanRow | null;
  showCreateModal: boolean;
  showDeleteModal: boolean;
  showResetModal: boolean;
  deleteTarget: WisudawanRow | null;
  resetTarget: WisudawanRow | null;
}

interface WisudawanActions {
  setData: (data: WisudawanRow[], total: number, page: number, limit: number, totalPages: number) => void;
  setLoading: (loading: boolean) => void;
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setFakultasFilter: (fakultas: string) => void;
  setPage: (page: number) => void;
  setSelected: (student: WisudawanRow | null) => void;
  setShowCreateModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean, target?: WisudawanRow | null) => void;
  setShowResetModal: (show: boolean, target?: WisudawanRow | null) => void;
  updateRow: (id: string, updates: Partial<WisudawanRow>) => void;
  removeRow: (id: string) => void;
  addRow: (row: WisudawanRow) => void;
}

type WisudawanStore = WisudawanState & WisudawanActions;

export const useWisudawanStore = create<WisudawanStore>((set) => ({
  // State
  data: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  search: "",
  statusFilter: "",
  fakultasFilter: "",
  selected: null,
  showCreateModal: false,
  showDeleteModal: false,
  showResetModal: false,
  deleteTarget: null,
  resetTarget: null,

  // Actions
  setData: (data, total, page, limit, totalPages) =>
    set({ data, total, page, limit, totalPages }),
  setLoading: (isLoading) => set({ isLoading }),
  setSearch: (search) => set({ search, page: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
  setFakultasFilter: (fakultasFilter) => set({ fakultasFilter, page: 1 }),
  setPage: (page) => set({ page }),
  setSelected: (selected) => set({ selected }),
  setShowCreateModal: (showCreateModal) => set({ showCreateModal }),
  setShowDeleteModal: (showDeleteModal, deleteTarget = null) =>
    set({ showDeleteModal, deleteTarget }),
  setShowResetModal: (showResetModal, resetTarget = null) =>
    set({ showResetModal, resetTarget }),
  updateRow: (id, updates) =>
    set((state) => ({
      data: state.data.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      selected: state.selected?.id === id ? { ...state.selected, ...updates } : state.selected,
    })),
  removeRow: (id) =>
    set((state) => ({
      data: state.data.filter((r) => r.id !== id),
      total: state.total - 1,
      selected: state.selected?.id === id ? null : state.selected,
    })),
  addRow: (row) =>
    set((state) => ({
      data: [row, ...state.data],
      total: state.total + 1,
    })),
}));
