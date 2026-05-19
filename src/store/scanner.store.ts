import { create } from "zustand";
import type { ScanResult } from "@/types/kehadiran.type";

type ScannerStatus = "idle" | "scanning" | "success" | "error";

interface ScannerState {
  status: ScannerStatus;
  lastResult: ScanResult | null;
  scanHistory: ScanResult[];
  isConnected: boolean;
  totalScanned: number;
}

interface ScannerActions {
  setStatus: (status: ScannerStatus) => void;
  setScanResult: (result: ScanResult) => void;
  setConnected: (connected: boolean) => void;
  resetStatus: () => void;
  clearHistory: () => void;
}

type ScannerStore = ScannerState & ScannerActions;

export const useScannerStore = create<ScannerStore>((set) => ({
  // State
  status: "idle",
  lastResult: null,
  scanHistory: [],
  isConnected: false,
  totalScanned: 0,

  // Actions
  setStatus: (status) => set({ status }),

  setScanResult: (result) =>
    set((state) => ({
      lastResult: result,
      status: result.success ? "success" : "error",
      scanHistory: [result, ...state.scanHistory].slice(0, 50), // keep last 50
      totalScanned: result.success ? state.totalScanned + 1 : state.totalScanned,
    })),

  setConnected: (isConnected) => set({ isConnected }),

  resetStatus: () => set({ status: "idle", lastResult: null }),

  clearHistory: () => set({ scanHistory: [], totalScanned: 0 }),
}));
