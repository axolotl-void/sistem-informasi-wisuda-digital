import { create } from "zustand";
import type { KehadiranStats } from "@/types/kehadiran.type";

interface DashboardState {
  stats: KehadiranStats | null;
  isLoadingStats: boolean;
  lastUpdated: Date | null;
  recentActivity: RecentActivity[];
}

interface RecentActivity {
  id: string;
  type: "scan" | "undangan" | "mahasiswa";
  message: string;
  timestamp: Date;
}

interface DashboardActions {
  setStats: (stats: KehadiranStats) => void;
  setLoadingStats: (loading: boolean) => void;
  addActivity: (activity: Omit<RecentActivity, "id">) => void;
  clearActivity: () => void;
}

type DashboardStore = DashboardState & DashboardActions;

export const useDashboardStore = create<DashboardStore>((set) => ({
  // State
  stats: null,
  isLoadingStats: false,
  lastUpdated: null,
  recentActivity: [],

  // Actions
  setStats: (stats) =>
    set({ stats, isLoadingStats: false, lastUpdated: new Date() }),

  setLoadingStats: (isLoadingStats) => set({ isLoadingStats }),

  addActivity: (activity) =>
    set((state) => ({
      recentActivity: [
        { ...activity, id: crypto.randomUUID() },
        ...state.recentActivity,
      ].slice(0, 20), // keep last 20
    })),

  clearActivity: () => set({ recentActivity: [] }),
}));
