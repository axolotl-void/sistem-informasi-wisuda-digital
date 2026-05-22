"use client";

import React, { useState, useEffect } from "react";
import { usePengaturanStore } from "@/store/pengaturan.store";
import { Armchair, Users, Loader2, Save } from "lucide-react";

export function KuotaKursiTab() {
  const {
    kapasitasKursi,
    kuotaPendamping,
    saveKuotaKursi,
    isLoading,
  } = usePengaturanStore();

  const [form, setForm] = useState({
    kapasitas: 200,
    kuota: 2,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync state on mount/update from store
  useEffect(() => {
    setForm({
      kapasitas: kapasitasKursi,
      kuota: kuotaPendamping,
    });
  }, [kapasitasKursi, kuotaPendamping]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (form.kapasitas <= 0) {
      newErrors.kapasitas = "Kapasitas kursi harus lebih besar dari 0";
    }
    if (form.kuota < 0) {
      newErrors.kuota = "Kuota pendamping tidak boleh bernilai negatif";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await saveKuotaKursi(form.kapasitas, form.kuota);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white/90 flex items-center gap-2">
          <Armchair className="size-4.5 text-blue-400" />
          Kapasitas Kursi & Kuota Tamu
        </h2>
        <p className="text-xs text-white/30 mt-0.5">
          Atur kapasitas auditorium wisuda dan batas maksimum tamu pendamping undangan
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total Kapasitas Kursi */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 block flex items-center gap-1.5">
              <Armchair className="size-3.5 text-white/30" />
              Total Kapasitas Kursi
            </label>
            <input
              type="number"
              min={1}
              value={form.kapasitas}
              onChange={(e) => setForm({ ...form, kapasitas: parseInt(e.target.value) || 0 })}
              disabled={isLoading}
              className={`h-10 w-full rounded-xl border px-3.5 text-xs text-white/80 placeholder-white/15 outline-none transition-all duration-200 bg-[#07111F]/40 ${
                errors.kapasitas
                  ? "border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5"
                  : "border-white/[0.08] hover:border-white/[0.15] focus:border-blue-500/50 focus:bg-white/[0.04] focus:ring-4 focus:ring-blue-500/5"
              }`}
            />
            {errors.kapasitas && (
              <p className="text-[10px] font-semibold text-rose-400 mt-1">{errors.kapasitas}</p>
            )}
          </div>

          {/* Kuota Tamu Pendamping */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 block flex items-center gap-1.5">
              <Users className="size-3.5 text-white/30" />
              Default Kuota Pendamping
            </label>
            <input
              type="number"
              min={0}
              value={form.kuota}
              onChange={(e) => setForm({ ...form, kuota: parseInt(e.target.value) || 0 })}
              disabled={isLoading}
              className={`h-10 w-full rounded-xl border px-3.5 text-xs text-white/80 placeholder-white/15 outline-none transition-all duration-200 bg-[#07111F]/40 ${
                errors.kuota
                  ? "border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5"
                  : "border-white/[0.08] hover:border-white/[0.15] focus:border-blue-500/50 focus:bg-white/[0.04] focus:ring-4 focus:ring-blue-500/5"
              }`}
            />
            {errors.kuota && (
              <p className="text-[10px] font-semibold text-rose-400 mt-1">{errors.kuota}</p>
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
                Simpan Konfigurasi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
