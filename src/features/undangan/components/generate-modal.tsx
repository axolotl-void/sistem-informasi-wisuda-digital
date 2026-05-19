"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useUndanganStore } from "../store";

export function GenerateInvitationModal() {
  const { isGenerateModalOpen, closeGenerateModal, generateInvitation, invitations } = useUndanganStore();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    mahasiswaId: "",
    sesi: "Sesi Pagi",
    tanggalWisuda: "2026-05-19",
    waktuMulai: "08:00",
    waktuSelesai: "12:00",
    gedung: "Auditorium Utama",
    ruangan: "Ruang A",
    kuotaTamu: 2,
  });

  const ungenerated = invitations.filter((i) => i.status === "belum_generate");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.mahasiswaId) {
      toast.error("Pilih mahasiswa terlebih dahulu");
      return;
    }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    generateInvitation(form.mahasiswaId);
    toast.success("Undangan berhasil digenerate");
    setIsLoading(false);
    closeGenerateModal();
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
              className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#080f1e] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/10">
                    <Sparkles className="size-4 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white/90">Generate Undangan</h2>
                    <p className="text-xs text-white/30">Buat undangan digital baru</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeGenerateModal}
                  className="flex size-8 items-center justify-center rounded-xl text-white/30 hover:bg-white/[0.08] hover:text-white/60 cursor-pointer transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Mahasiswa select */}
                <div className="space-y-1.5">
                  <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-white/30">
                    Mahasiswa
                  </label>
                  <select
                    value={form.mahasiswaId}
                    onChange={(e) => setForm((f) => ({ ...f, mahasiswaId: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-[0.82rem] text-white/70 outline-none transition-all hover:border-white/[0.12] focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                  >
                    <option value="" className="bg-[#0F172A]">Pilih mahasiswa...</option>
                    {ungenerated.map((inv) => (
                      <option key={inv.id} value={inv.id} className="bg-[#0F172A]">
                        {inv.mahasiswaNama} — {inv.nim}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sesi */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-white/30">Sesi</label>
                    <select
                      value={form.sesi}
                      onChange={(e) => setForm((f) => ({ ...f, sesi: e.target.value }))}
                      className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-[0.82rem] text-white/70 outline-none focus:border-blue-500/40 cursor-pointer"
                    >
                      {["Sesi Pagi", "Sesi Siang", "Sesi Sore"].map((s) => (
                        <option key={s} value={s} className="bg-[#0F172A]">{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-white/30">Kuota Tamu</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={form.kuotaTamu}
                      onChange={(e) => setForm((f) => ({ ...f, kuotaTamu: Number(e.target.value) }))}
                      className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-[0.82rem] text-white/70 outline-none focus:border-blue-500/40"
                    />
                  </div>
                </div>

                {/* Gedung */}
                <div className="space-y-1.5">
                  <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-white/30">Gedung</label>
                  <input
                    type="text"
                    value={form.gedung}
                    onChange={(e) => setForm((f) => ({ ...f, gedung: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-[0.82rem] text-white/70 outline-none focus:border-blue-500/40"
                  />
                </div>

                {/* Tanggal */}
                <div className="space-y-1.5">
                  <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-white/30">Tanggal Wisuda</label>
                  <input
                    type="date"
                    value={form.tanggalWisuda}
                    onChange={(e) => setForm((f) => ({ ...f, tanggalWisuda: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-[0.82rem] text-white/70 outline-none focus:border-blue-500/40"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl border border-blue-500/30 bg-blue-500/10 text-sm font-semibold text-blue-400 transition-all hover:border-blue-500/50 hover:bg-blue-500/15 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
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
