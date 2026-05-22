import { create } from "zustand";
import { toast } from "sonner";

interface PengaturanState {
  namaAcara: string;
  tanggalPelaksanaan: string;
  lokasi: string;
  sesiList: string[];
  gateList: string[];
  kapasitasKursi: number;
  kuotaPendamping: number;
  isLoading: boolean;
}

interface PengaturanActions {
  fetchSettings: () => void;
  saveIdentitasAcara: (nama: string, tanggal: string, lokasi: string) => Promise<void>;
  addSesi: (sesi: string) => Promise<void>;
  deleteSesi: (sesi: string) => Promise<void>;
  addGate: (gate: string) => Promise<void>;
  deleteGate: (gate: string) => Promise<void>;
  saveKuotaKursi: (kapasitas: number, kuota: number) => Promise<void>;
}

type PengaturanStore = PengaturanState & PengaturanActions;

const DEFAULT_SETTINGS = {
  namaAcara: "Wisuda UBBG Periode 2024/2025",
  tanggalPelaksanaan: "2026-06-25",
  lokasi: "Auditorium Utama UBBG",
  sesiList: ["Sesi Pagi", "Sesi Siang", "Sesi Sore"],
  gateList: ["Gate Utama", "Gate VIP", "Gate Selatan"],
  kapasitasKursi: 200,
  kuotaPendamping: 2,
};

export const usePengaturanStore = create<PengaturanStore>((set, get) => ({
  // State
  ...DEFAULT_SETTINGS,
  isLoading: false,

  // Actions
  fetchSettings: () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("wisuda_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          namaAcara: parsed.namaAcara ?? DEFAULT_SETTINGS.namaAcara,
          tanggalPelaksanaan: parsed.tanggalPelaksanaan ?? DEFAULT_SETTINGS.tanggalPelaksanaan,
          lokasi: parsed.lokasi ?? DEFAULT_SETTINGS.lokasi,
          sesiList: parsed.sesiList ?? DEFAULT_SETTINGS.sesiList,
          gateList: parsed.gateList ?? DEFAULT_SETTINGS.gateList,
          kapasitasKursi: parsed.kapasitasKursi ?? DEFAULT_SETTINGS.kapasitasKursi,
          kuotaPendamping: parsed.kuotaPendamping ?? DEFAULT_SETTINGS.kuotaPendamping,
        });
      }
    } catch (e) {
      console.error("Gagal memuat pengaturan dari localStorage:", e);
    }
  },

  saveIdentitasAcara: async (nama, tanggal, lokasi) => {
    set({ isLoading: true });
    // Simulate database API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    try {
      const current = {
        ...DEFAULT_SETTINGS,
        namaAcara: nama,
        tanggalPelaksanaan: tanggal,
        lokasi: lokasi,
        sesiList: get().sesiList,
        gateList: get().gateList,
        kapasitasKursi: get().kapasitasKursi,
        kuotaPendamping: get().kuotaPendamping,
      };
      
      localStorage.setItem("wisuda_settings", JSON.stringify(current));
      set({ namaAcara: nama, tanggalPelaksanaan: tanggal, lokasi: lokasi });
      toast.success("Identitas acara berhasil diperbarui");
    } catch (e) {
      toast.error("Gagal menyimpan identitas acara");
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  addSesi: async (sesi) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    const normalized = sesi.trim();
    if (!normalized) {
      set({ isLoading: false });
      throw new Error("Nama sesi tidak boleh kosong");
    }
    if (get().sesiList.includes(normalized)) {
      set({ isLoading: false });
      throw new Error("Sesi tersebut sudah ada");
    }
    
    try {
      const updatedSesi = [...get().sesiList, normalized];
      const current = {
        namaAcara: get().namaAcara,
        tanggalPelaksanaan: get().tanggalPelaksanaan,
        lokasi: get().lokasi,
        sesiList: updatedSesi,
        gateList: get().gateList,
        kapasitasKursi: get().kapasitasKursi,
        kuotaPendamping: get().kuotaPendamping,
      };
      localStorage.setItem("wisuda_settings", JSON.stringify(current));
      set({ sesiList: updatedSesi });
      toast.success(`Sesi "${normalized}" berhasil ditambahkan`);
    } catch (e) {
      toast.error("Gagal menambahkan sesi");
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSesi: async (sesi) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 400));
    try {
      const updatedSesi = get().sesiList.filter((s) => s !== sesi);
      const current = {
        namaAcara: get().namaAcara,
        tanggalPelaksanaan: get().tanggalPelaksanaan,
        lokasi: get().lokasi,
        sesiList: updatedSesi,
        gateList: get().gateList,
        kapasitasKursi: get().kapasitasKursi,
        kuotaPendamping: get().kuotaPendamping,
      };
      localStorage.setItem("wisuda_settings", JSON.stringify(current));
      set({ sesiList: updatedSesi });
      toast.success(`Sesi "${sesi}" berhasil dihapus`);
    } catch (e) {
      toast.error("Gagal menghapus sesi");
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  addGate: async (gate) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    const normalized = gate.trim();
    if (!normalized) {
      set({ isLoading: false });
      throw new Error("Nama gate tidak boleh kosong");
    }
    if (get().gateList.includes(normalized)) {
      set({ isLoading: false });
      throw new Error("Gate tersebut sudah ada");
    }

    try {
      const updatedGate = [...get().gateList, normalized];
      const current = {
        namaAcara: get().namaAcara,
        tanggalPelaksanaan: get().tanggalPelaksanaan,
        lokasi: get().lokasi,
        sesiList: get().sesiList,
        gateList: updatedGate,
        kapasitasKursi: get().kapasitasKursi,
        kuotaPendamping: get().kuotaPendamping,
      };
      localStorage.setItem("wisuda_settings", JSON.stringify(current));
      set({ gateList: updatedGate });
      toast.success(`Gate "${normalized}" berhasil ditambahkan`);
    } catch (e) {
      toast.error("Gagal menambahkan gate");
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteGate: async (gate) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 400));
    try {
      const updatedGate = get().gateList.filter((g) => g !== gate);
      const current = {
        namaAcara: get().namaAcara,
        tanggalPelaksanaan: get().tanggalPelaksanaan,
        lokasi: get().lokasi,
        sesiList: get().sesiList,
        gateList: updatedGate,
        kapasitasKursi: get().kapasitasKursi,
        kuotaPendamping: get().kuotaPendamping,
      };
      localStorage.setItem("wisuda_settings", JSON.stringify(current));
      set({ gateList: updatedGate });
      toast.success(`Gate "${gate}" berhasil dihapus`);
    } catch (e) {
      toast.error("Gagal menghapus gate");
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  saveKuotaKursi: async (kapasitas, kuota) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 800));
    try {
      const current = {
        namaAcara: get().namaAcara,
        tanggalPelaksanaan: get().tanggalPelaksanaan,
        lokasi: get().lokasi,
        sesiList: get().sesiList,
        gateList: get().gateList,
        kapasitasKursi: kapasitas,
        kuotaPendamping: kuota,
      };
      localStorage.setItem("wisuda_settings", JSON.stringify(current));
      set({ kapasitasKursi: kapasitas, kuotaPendamping: kuota });
      toast.success("Kapasitas kursi & kuota pendamping berhasil diperbarui");
    } catch (e) {
      toast.error("Gagal memperbarui kuota & kursi");
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },
}));
