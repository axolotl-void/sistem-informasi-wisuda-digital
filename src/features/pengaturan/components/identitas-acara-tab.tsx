"use client";

import React, { useState, useEffect } from "react";
import { usePengaturanStore } from "@/store/pengaturan.store";
import { Calendar, MapPin, Sparkles, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  pengaturanInput,
  pengaturanInputError,
  pengaturanHeading,
  pengaturanSubheading,
  pengaturanLabel,
  pengaturanBtnPrimary,
} from "../pengaturan-ui";

export function IdentitasAcaraTab() {
  const { namaAcara, tanggalPelaksanaan, lokasi, saveIdentitasAcara, isLoading } =
    usePengaturanStore();

  const [form, setForm] = useState({ nama: "", tanggal: "", lokasi: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const fieldClass = (key: string) =>
    cn(pengaturanInput, errors[key] && pengaturanInputError);

  return (
    <div className="space-y-6">
      <div>
        <h2 className={cn(pengaturanHeading)}>
          <Sparkles className="size-4.5 text-blue-600 dark:text-blue-400" />
          Identitas Acara
        </h2>
        <p className={pengaturanSubheading}>
          Kelola informasi utama pelaksanaan upacara wisuda digital
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className={pengaturanLabel}>Nama Acara</label>
          <input
            type="text"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            placeholder="Masukkan nama upacara wisuda..."
            disabled={isLoading}
            className={fieldClass("nama")}
          />
          {errors.nama && (
            <p className="mt-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
              {errors.nama}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={cn(pengaturanLabel, "flex items-center gap-1.5")}>
              <Calendar className="size-3.5 text-slate-400 dark:text-white/30" />
              Tanggal Pelaksanaan
            </label>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              disabled={isLoading}
              className={fieldClass("tanggal")}
            />
            {errors.tanggal && (
              <p className="mt-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                {errors.tanggal}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className={cn(pengaturanLabel, "flex items-center gap-1.5")}>
              <MapPin className="size-3.5 text-slate-400 dark:text-white/30" />
              Lokasi Utama
            </label>
            <input
              type="text"
              value={form.lokasi}
              onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
              placeholder="e.g. Auditorium UBBG, Gedung A"
              disabled={isLoading}
              className={fieldClass("lokasi")}
            />
            {errors.lokasi && (
              <p className="mt-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                {errors.lokasi}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={isLoading} className={pengaturanBtnPrimary}>
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
