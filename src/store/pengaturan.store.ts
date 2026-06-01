import { create } from "zustand";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/client-auth";

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
  fetchSettings: () => Promise<void>;
  saveIdentitasAcara: (nama: string, tanggal: string, lokasi: string) => Promise<void>;
  addSesi: (sesi: string) => Promise<void>;
  deleteSesi: (sesi: string) => Promise<void>;
  addGate: (gate: string) => Promise<void>;
  deleteGate: (gate: string) => Promise<void>;
  saveKuotaKursi: (kapasitas: number, kuota: number) => Promise<void>;
}

type PengaturanStore = PengaturanState & PengaturanActions;

const DEFAULT_SETTINGS = {
  namaAcara: "Wisuda Periode 2026/2027",
  tanggalPelaksanaan: "2026-06-25",
  lokasi: "Auditorium Utama UBBG",
  sesiList: ["Sesi Pagi", "Sesi Siang", "Sesi Sore"],
  gateList: ["Gate Utama", "Gate VIP", "Gate Selatan"],
  kapasitasKursi: 200,
  kuotaPendamping: 2,
};

async function saveSettingsToServer(updated: unknown) {
  const res = await fetchWithAuth("/api/pengaturan", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Gagal menyimpan ke server");
  }
}

export const usePengaturanStore = create<PengaturanStore>((set, get) => ({
  // State
  ...DEFAULT_SETTINGS,
  isLoading: false,

  // Actions
  fetchSettings: async () => {
    if (typeof window === "undefined") return;
    try {
      const res = await fetchWithAuth("/api/pengaturan");
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          const parsed = body.data;
          set({
            namaAcara: parsed.namaAcara ?? DEFAULT_SETTINGS.namaAcara,
            tanggalPelaksanaan: parsed.tanggalPelaksanaan ?? DEFAULT_SETTINGS.tanggalPelaksanaan,
            lokasi: parsed.lokasi ?? DEFAULT_SETTINGS.lokasi,
            sesiList: parsed.sesiList ?? DEFAULT_SETTINGS.sesiList,
            gateList: parsed.gateList ?? DEFAULT_SETTINGS.gateList,
            kapasitasKursi: parsed.kapasitasKursi ?? DEFAULT_SETTINGS.kapasitasKursi,
            kuotaPendamping: parsed.kuotaPendamping ?? DEFAULT_SETTINGS.kuotaPendamping,
          });
          localStorage.setItem("wisuda_settings", JSON.stringify(parsed));
          return;
        }
      }
    } catch (e) {
      console.warn("Gagal memuat pengaturan dari API, menggunakan localStorage fallback:", e);
    }

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
    try {
      const updated = {
        namaAcara: nama,
        tanggalPelaksanaan: tanggal,
        lokasi: lokasi,
        sesiList: get().sesiList,
        gateList: get().gateList,
        kapasitasKursi: get().kapasitasKursi,
        kuotaPendamping: get().kuotaPendamping,
      };

      await saveSettingsToServer(updated);

      localStorage.setItem("wisuda_settings", JSON.stringify(updated));
      set({ namaAcara: nama, tanggalPelaksanaan: tanggal, lokasi: lokasi });
      toast.success("Identitas acara berhasil diperbarui");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal menyimpan identitas acara";
      toast.error(msg);
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  addSesi: async (sesi) => {
    set({ isLoading: true });
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
      const updated = {
        namaAcara: get().namaAcara,
        tanggalPelaksanaan: get().tanggalPelaksanaan,
        lokasi: get().lokasi,
        sesiList: updatedSesi,
        gateList: get().gateList,
        kapasitasKursi: get().kapasitasKursi,
        kuotaPendamping: get().kuotaPendamping,
      };

      await saveSettingsToServer(updated);

      localStorage.setItem("wisuda_settings", JSON.stringify(updated));
      set({ sesiList: updatedSesi });
      toast.success(`Sesi "${normalized}" berhasil ditambahkan`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal menambahkan sesi";
      toast.error(msg);
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSesi: async (sesi) => {
    set({ isLoading: true });
    try {
      const updatedSesi = get().sesiList.filter((s) => s !== sesi);
      const updated = {
        namaAcara: get().namaAcara,
        tanggalPelaksanaan: get().tanggalPelaksanaan,
        lokasi: get().lokasi,
        sesiList: updatedSesi,
        gateList: get().gateList,
        kapasitasKursi: get().kapasitasKursi,
        kuotaPendamping: get().kuotaPendamping,
      };

      await saveSettingsToServer(updated);

      localStorage.setItem("wisuda_settings", JSON.stringify(updated));
      set({ sesiList: updatedSesi });
      toast.success(`Sesi "${sesi}" berhasil dihapus`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal menghapus sesi";
      toast.error(msg);
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  addGate: async (gate) => {
    set({ isLoading: true });
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
      const updated = {
        namaAcara: get().namaAcara,
        tanggalPelaksanaan: get().tanggalPelaksanaan,
        lokasi: get().lokasi,
        sesiList: get().sesiList,
        gateList: updatedGate,
        kapasitasKursi: get().kapasitasKursi,
        kuotaPendamping: get().kuotaPendamping,
      };

      await saveSettingsToServer(updated);

      localStorage.setItem("wisuda_settings", JSON.stringify(updated));
      set({ gateList: updatedGate });
      toast.success(`Gate "${normalized}" berhasil ditambahkan`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal menambahkan gate";
      toast.error(msg);
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteGate: async (gate) => {
    set({ isLoading: true });
    try {
      const updatedGate = get().gateList.filter((g) => g !== gate);
      const updated = {
        namaAcara: get().namaAcara,
        tanggalPelaksanaan: get().tanggalPelaksanaan,
        lokasi: get().lokasi,
        sesiList: get().sesiList,
        gateList: updatedGate,
        kapasitasKursi: get().kapasitasKursi,
        kuotaPendamping: get().kuotaPendamping,
      };

      await saveSettingsToServer(updated);

      localStorage.setItem("wisuda_settings", JSON.stringify(updated));
      set({ gateList: updatedGate });
      toast.success(`Gate "${gate}" berhasil dihapus`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal menghapus gate";
      toast.error(msg);
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  saveKuotaKursi: async (kapasitas, kuota) => {
    set({ isLoading: true });
    try {
      const updated = {
        namaAcara: get().namaAcara,
        tanggalPelaksanaan: get().tanggalPelaksanaan,
        lokasi: get().lokasi,
        sesiList: get().sesiList,
        gateList: get().gateList,
        kapasitasKursi: kapasitas,
        kuotaPendamping: kuota,
      };

      await saveSettingsToServer(updated);

      localStorage.setItem("wisuda_settings", JSON.stringify(updated));
      set({ kapasitasKursi: kapasitas, kuotaPendamping: kuota });
      toast.success("Kapasitas kursi & kuota pendamping berhasil diperbarui");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal memperbarui kuota & kursi";
      toast.error(msg);
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },
}));
