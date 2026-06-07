"use client";

import { useState } from "react";
import { X, Mail, Sparkles, User, Award, Hash, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  LiquidGlassCard,
  glassBtnPrimary,
  glassBtnGhost,
  glassInput,
} from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nama: string;
    jabatan: string;
    nidn?: string;
    email?: string;
    noWa?: string;
  }) => Promise<void>;
}

export function CreateUndanganDosenModal({
  open,
  onClose,
  onSubmit,
}: CreateModalProps) {
  const [nama, setNama] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [nidn, setNidn] = useState("");
  const [email, setEmail] = useState("");
  const [noWa, setNoWa] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nama || !jabatan) {
      toast.error("Nama dan Jabatan wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        nama,
        jabatan,
        nidn: nidn || undefined,
        email: email || undefined,
        noWa: noWa || undefined,
      });
      // Clear inputs
      setNama("");
      setJabatan("");
      setNidn("");
      setEmail("");
      setNoWa("");
      onClose();
    } catch (err) {
      // Handled by store
    } finally {
      setIsSubmitting(false);
    }
  }

  const labelCls = "block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-white/30 mb-1.5";
  const iconWrapperCls = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/20 size-4 pointer-events-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <LiquidGlassCard hover={false} className="relative z-10 w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/[0.06] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
              <Mail className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Tambah Undangan Dosen
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-white/35 font-medium mt-0.5">
                Buat undangan resmi baru untuk dosen / civitas akademika
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:text-white/40 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className={labelCls}>Nama Lengkap & Gelar *</label>
            <div className="relative">
              <User className={iconWrapperCls} />
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Prof. Dr. Ir. H. Abdurrahman, M.Pd."
                className={cn(glassInput, "pl-10 h-10 text-xs w-full font-medium")}
              />
            </div>
          </div>

          {/* Jabatan */}
          <div>
            <label className={labelCls}>Jabatan / Peran *</label>
            <div className="relative">
              <Award className={iconWrapperCls} />
              <input
                type="text"
                required
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                placeholder="Contoh: Rektor UBBG, Dekan FKIP, Dosen Pembimbing"
                className={cn(glassInput, "pl-10 h-10 text-xs w-full font-medium")}
              />
            </div>
          </div>

          {/* NIDN / NIP */}
          <div>
            <label className={labelCls}>NIDN / NIP (Opsional)</label>
            <div className="relative">
              <Hash className={iconWrapperCls} />
              <input
                type="text"
                value={nidn}
                onChange={(e) => setNidn(e.target.value)}
                placeholder="Masukkan NIDN atau NIP dosen jika ada"
                className={cn(glassInput, "pl-10 h-10 text-xs w-full font-medium")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className={labelCls}>Email (Opsional)</label>
              <div className="relative">
                <Mail className={iconWrapperCls} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  className={cn(glassInput, "pl-10 h-10 text-xs w-full font-medium")}
                />
              </div>
            </div>

            {/* No WhatsApp */}
            <div>
              <label className={labelCls}>Nomor WhatsApp (Opsional)</label>
              <div className="relative">
                <Phone className={iconWrapperCls} />
                <input
                  type="tel"
                  value={noWa}
                  onChange={(e) => setNoWa(e.target.value)}
                  placeholder="Contoh: 08xxxxxxxxx atau 628xxxxxxxxx"
                  className={cn(glassInput, "pl-10 h-10 text-xs w-full font-medium")}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={cn(glassBtnGhost, "h-10 flex-1 justify-center disabled:opacity-40")}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(glassBtnPrimary, "h-10 flex-1 justify-center font-bold disabled:opacity-60")}
            >
              {isSubmitting ? "Menyimpan..." : "Buat Undangan"}
            </button>
          </div>
        </form>
      </LiquidGlassCard>
    </div>
  );
}
