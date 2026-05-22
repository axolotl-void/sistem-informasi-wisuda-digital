"use client";

import React, { useState, useEffect } from "react";
import { usePengaturanStore } from "@/store/pengaturan.store";
import { Calendar, MapPin, Sparkles, Loader2, Save } from "lucide-react";

export function IdentitasAcaraTab() {
  const {
    namaAcara,
    tanggalPelaksanaan,
    lokasi,
    saveIdentitasAcara,
    isLoading,
  } = usePengaturanStore();

  const [form, setForm] = useState({
    nama: "",
    tanggal: "",
    lokasi: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync state with store on mount
  useEffect(() => {
    setForm({
      nama: namaAcara,
      tanggal: tanggalPelaksanaan,
      lokasi: lokasi,
    });
  }, [namaAcara, tanggalPelaksanaan, lokasi]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.nama.trim()) newErrors.nama = "Nama acara wajib diisi";
    if (!form.tanggal.trim()) newErrors.tanggal = "Tanggal pelaksanaan wajib diisi";
    if (!form.lokasi.trim()) newErrors.lokasi = "Lokasi acara wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await saveIdentitasAcara(form.nama, form.tanggal, form.lokasi);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white/90 flex items-center gap-2">
          <Sparkles className="size-4.5 text-blue-400" />
          Identitas Acara
        </h2>
        <p className="text-xs text-white/30 mt-0.5">
          Kelola informasi utama pelaksanaan upacara wisuda digital
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nama Acara */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 block">
            Nama Acara
          </label>
          <div className="relative">
            <input
              type="text"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Masukkan nama upacara wisuda..."
              disabled={isLoading}
              className={`h-10 w-full rounded-xl border px-3.5 text-xs text-white/80 placeholder-white/15 outline-none transition-all duration-200 bg-[#07111F]/40 ${
                errors.nama
                  ? "border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5"
                  : "border-white/[0.08] hover:border-white/[0.15] focus:border-blue-500/50 focus:bg-white/[0.04] focus:ring-4 focus:ring-blue-500/5"
              }`}
            />
          </div>
          {errors.nama && (
            <p className="text-[10px] font-semibold text-rose-400 mt-1">{errors.nama}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tanggal Pelaksanaan */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 block flex items-center gap-1.5">
              <Calendar className="size-3.5 text-white/30" />
              Tanggal Pelaksanaan
            </label>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              disabled={isLoading}
              className={`h-10 w-full rounded-xl border px-3.5 text-xs text-white/80 placeholder-white/15 outline-none transition-all duration-200 bg-[#07111F]/40 ${
                errors.tanggal
                  ? "border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5"
                  : "border-white/[0.08] hover:border-white/[0.15] focus:border-blue-500/50 focus:bg-white/[0.04] focus:ring-4 focus:ring-blue-500/5"
              }`}
            />
            {errors.tanggal && (
              <p className="text-[10px] font-semibold text-rose-400 mt-1">{errors.tanggal}</p>
            )}
          </div>

          {/* Lokasi */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 block flex items-center gap-1.5">
              <MapPin className="size-3.5 text-white/30" />
              Lokasi Utama
            </label>
            <input
              type="text"
              value={form.lokasi}
              onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
              placeholder="e.g. Auditorium UBBG, Gedung A"
              disabled={isLoading}
              className={`h-10 w-full rounded-xl border px-3.5 text-xs text-white/80 placeholder-white/15 outline-none transition-all duration-200 bg-[#07111F]/40 ${
                errors.lokasi
                  ? "border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5"
                  : "border-white/[0.08] hover:border-white/[0.15] focus:border-blue-500/50 focus:bg-white/[0.04] focus:ring-4 focus:ring-blue-500/5"
              }`}
            />
            {errors.lokasi && (
              <p className="text-[10px] font-semibold text-rose-400 mt-1">{errors.lokasi}</p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-500/25 bg-blue-500/[0.08] px-5 text-xs font-bold text-blue-400 transition-all duration-150 hover:border-blue-500/40 hover:bg-blue-500/[0.15] hover:text-blue-300 active:scale-[0.97] disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(59,130,246,0.15)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
