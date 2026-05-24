"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useUndanganStore } from "../store";

interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
  fakultas: string;
  prodi: string;
  status: string;
  sesiWisuda: string | null;
}

export function GenerateInvitationModal() {
  const { isGenerateModalOpen, closeGenerateModal, init } = useUndanganStore();
  const [isLoading, setIsLoading] = useState(false);
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [loadingMahasiswa, setLoadingMahasiswa] = useState(false);
  const [form, setForm] = useState({
    mahasiswaId: "",
    sesi: "",
    tanggalWisuda: "2026-05-19",
    waktuMulai: "08:00",
    waktuSelesai: "12:00",
    gedung: "Auditorium Utama",
    ruangan: "Ruang A",
    kuotaTamu: 2,
  });

  const selectedMahasiswa = mahasiswaList.find(m => m.id === form.mahasiswaId);

  const fetchMahasiswa = useCallback(async () => {
    setLoadingMahasiswa(true);
    try {
      const response = await fetch("/api/mahasiswa?page=1&limit=1000", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      setMahasiswaList(result.data.data);
    } catch (error) {
      console.error("Failed to fetch mahasiswa:", error);
      toast.error("Gagal memuat data mahasiswa");
    } finally {
      setLoadingMahasiswa(false);
    }
  }, []);

  useEffect(() => {
    if (isGenerateModalOpen) {
      void fetchMahasiswa();
    }
  }, [isGenerateModalOpen, fetchMahasiswa]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.mahasiswaId) {
      toast.error("Pilih mahasiswa terlebih dahulu");
      return;
    }

    if (!selectedMahasiswa?.sesiWisuda) {
      toast.error("Mahasiswa belum memiliki sesi wisuda. Silakan set sesi di fitur Akun Wisudawan terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/undangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          mahasiswaId: form.mahasiswaId,
          tanggalWisuda: new Date(form.tanggalWisuda).toISOString(),
          tempatWisuda: form.gedung,
          kuotaTamu: form.kuotaTamu,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Generate error:", result);
        throw new Error(result.message || "Gagal generate undangan");
      }

      toast.success("Undangan berhasil digenerate");
      closeGenerateModal();
      await init();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal generate undangan";
      console.error("Generate undangan error:", error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isGenerateModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeGenerateModal}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white dark:border-white/[0.1] dark:bg-[#080f1e] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                    <Sparkles className="size-4 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">Generate Undangan</h2>
                    <p className="text-xs text-gray-400 dark:text-white/30">Buat undangan digital baru</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeGenerateModal}
                  className="flex size-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer transition-colors dark:text-white/30 dark:hover:bg-white/[0.08] dark:hover:text-white/60"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Mahasiswa select */}
                <div className="space-y-1.5">
                  <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-gray-500 dark:text-white/30">
                    Mahasiswa
                  </label>
                  <select
                    value={form.mahasiswaId}
                    onChange={(e) => setForm((f) => ({ ...f, mahasiswaId: e.target.value }))}
                    disabled={loadingMahasiswa}
                    className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-[0.82rem] text-gray-700 outline-none transition-all hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 cursor-pointer disabled:opacity-50 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/70 dark:hover:border-white/[0.12] dark:focus:border-blue-500/40 dark:shadow-none"
                  >
                    <option value="" className="bg-white text-gray-800 dark:bg-[#0F172A] dark:text-white">
                      {loadingMahasiswa ? "Memuat..." : "Pilih mahasiswa..."}
                    </option>
                    {mahasiswaList.map((mhs) => (
                      <option key={mhs.id} value={mhs.id} className="bg-white text-gray-800 dark:bg-[#0F172A] dark:text-white">
                        {mhs.nama} — {mhs.nim} — {mhs.status} {mhs.sesiWisuda ? `— ${mhs.sesiWisuda}` : '— Belum ada sesi'}
                      </option>
                    ))}
                  </select>
                  {!loadingMahasiswa && mahasiswaList.length === 0 && (
                    <p className="text-[0.7rem] text-gray-400 dark:text-white/30 mt-1">
                      Tidak ada data mahasiswa
                    </p>
                  )}
                </div>

                {/* Sesi */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-gray-500 dark:text-white/30">Sesi</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedMahasiswa?.sesiWisuda || "Belum ditentukan"}
                        disabled
                        className="w-full h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-[0.82rem] text-gray-500 outline-none cursor-not-allowed dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-white/50"
                      />
                      {!selectedMahasiswa?.sesiWisuda && (
                        <p className="text-[0.65rem] text-amber-500 dark:text-amber-400/70 mt-1">
                          ⚠️ Set sesi di Akun Wisudawan
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-gray-500 dark:text-white/30">Kuota Tamu</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={form.kuotaTamu}
                      onChange={(e) => setForm((f) => ({ ...f, kuotaTamu: Number(e.target.value) }))}
                      className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-[0.82rem] text-gray-700 outline-none focus:border-blue-400 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/70 dark:focus:border-blue-500/40 dark:shadow-none"
                    />
                  </div>
                </div>

                {/* Gedung */}
                <div className="space-y-1.5">
                  <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-gray-500 dark:text-white/30">Gedung</label>
                  <input
                    type="text"
                    value={form.gedung}
                    onChange={(e) => setForm((f) => ({ ...f, gedung: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-[0.82rem] text-gray-700 outline-none focus:border-blue-400 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/70 dark:focus:border-blue-500/40 dark:shadow-none"
                  />
                </div>

                {/* Tanggal */}
                <div className="space-y-1.5">
                  <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-gray-500 dark:text-white/30">Tanggal Wisuda</label>
                  <input
                    type="date"
                    value={form.tanggalWisuda}
                    onChange={(e) => setForm((f) => ({ ...f, tanggalWisuda: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-[0.82rem] text-gray-700 outline-none focus:border-blue-400 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/70 dark:focus:border-blue-500/40 dark:shadow-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl border border-blue-300 bg-blue-50 text-sm font-semibold text-blue-600 transition-all hover:border-blue-400 hover:bg-blue-100 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/15"
                >
                  {isLoading ? (
                    <><Loader2 className="size-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="size-4" /> Generate Undangan</>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
