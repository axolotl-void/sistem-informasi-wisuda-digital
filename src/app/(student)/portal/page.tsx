"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Camera, CheckCircle2, AlertCircle,
  GraduationCap, BookOpen, Hash, Save, Loader2,
  QrCode, Calendar, MapPin, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MahasiswaData {
  id: string;
  nim: string;
  nama: string;
  email: string;
  fakultas: string;
  prodi: string;
  angkatan: number;
  status: string;
  sesiWisuda: string | null;
  foto: string | null;
  undangan: {
    id: string;
    kode: string;
    statusUndangan: string;
    tanggalWisuda: string;
    tempatWisuda: string;
    kuotaTamu: number;
  } | null;
}

const FAKULTAS_OPTIONS = [
  "Fakultas Teknik",
  "Fakultas Ekonomi",
  "Fakultas Hukum",
  "Fakultas MIPA",
  "Fakultas Kedokteran",
  "Fakultas Ilmu Sosial dan Politik",
];

// ─── Progress helpers ─────────────────────────────────────────────────────────

function calcProgress(data: MahasiswaData | null): number {
  if (!data) return 0;
  const fields = [data.nama, data.nim, data.fakultas, data.prodi, String(data.angkatan), data.foto];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

// ─── Components ───────────────────────────────────────────────────────────────

function ProgressBar({ value }: { value: number }) {
  const color =
    value < 40 ? "from-red-500 to-orange-500" :
    value < 80 ? "from-amber-500 to-yellow-400" :
    "from-emerald-500 to-teal-400";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[0.72rem] font-semibold text-white/40">Kelengkapan Profil</span>
        <span className={`text-[0.72rem] font-bold ${value === 100 ? "text-emerald-400" : "text-white/60"}`}>
          {value}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
      {value === 100 ? (
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="size-3.5" />
          <span className="text-[0.7rem] font-semibold">Profil lengkap! Anda bisa mendaftarkan tamu.</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-amber-400/70">
          <AlertCircle className="size-3.5" />
          <span className="text-[0.7rem]">Lengkapi profil untuk mengakses fitur Pengajuan Tamu.</span>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full h-12 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-white/80 placeholder-white/20 outline-none transition-all focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilPage() {
  const [data, setData] = useState<MahasiswaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    fakultas: "",
    prodi: "",
    angkatan: "",
  });

  // Fetch data mahasiswa dari API
  useEffect(() => {
    fetch("/api/portal/me", { credentials: "include" })
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          setData(result.data);
          setForm({
            nama: result.data.nama,
            fakultas: result.data.fakultas,
            prodi: result.data.prodi,
            angkatan: String(result.data.angkatan),
          });
        }
      })
      .catch(() => toast.error("Gagal memuat data profil"))
      .finally(() => setIsLoading(false));
  }, []);

  const progress = calcProgress(data);
  const avatar = data?.nama
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/wisudawan/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nama: form.nama,
          fakultas: form.fakultas,
          prodi: form.prodi,
          angkatan: Number(form.angkatan),
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      toast.success("Profil berhasil disimpan");
    } catch {
      toast.error("Gagal menyimpan profil");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
          <User className="size-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white/90">
            Halo, {data?.nama.split(" ")[0] ?? "Wisudawan"}! 👋
          </h1>
          <p className="text-xs text-white/30">Selamat datang di Portal Wisuda Digital</p>
        </div>
      </div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4"
      >
        <ProgressBar value={progress} />
      </motion.div>

      {/* Avatar + info */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4"
      >
        <div className="relative shrink-0">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-blue-500/20 overflow-hidden">
            {data?.foto ? (
              <img src={data.foto} alt="Foto" className="size-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-blue-300">{avatar}</span>
            )}
          </div>
          <button
            type="button"
            className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-xl bg-blue-500 border-2 border-[#060d1a] text-white shadow-lg hover:bg-blue-400 transition-colors"
          >
            <Camera className="size-3.5" />
          </button>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white/80 truncate">{data?.nama}</p>
          <p className="text-xs text-white/35 mt-0.5">{data?.nim}</p>
          <p className="text-[0.65rem] text-white/25 mt-1 truncate">{data?.prodi} · {data?.fakultas}</p>
          {data?.sesiWisuda && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 border border-blue-500/15 px-2 py-1">
              <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[0.62rem] font-semibold text-blue-400">{data.sesiWisuda}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Undangan status card */}
      {data?.undangan && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-white/50">Status Undangan</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[0.65rem] font-bold text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {data.undangan.statusUndangan === "AKTIF" ? "QR Aktif" : data.undangan.statusUndangan}
            </span>
          </div>
          <div className="space-y-0 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            {[
              { icon: Calendar, label: "Tanggal", value: new Date(data.undangan.tanggalWisuda).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
              { icon: MapPin, label: "Tempat", value: data.undangan.tempatWisuda },
            ].map(({ icon: Icon, label, value }, i) => (
              <div key={label} className={`flex items-center justify-between px-3 py-2.5 ${i > 0 ? "border-t border-white/[0.04]" : ""}`}>
                <div className="flex items-center gap-2">
                  <Icon className="size-3.5 text-white/25" />
                  <span className="text-xs text-white/35">{label}</span>
                </div>
                <span className="text-xs font-semibold text-white/60 text-right max-w-[55%]">{value}</span>
              </div>
            ))}
          </div>
          <Link
            href="/portal/tiket"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 py-2.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/15 transition-all"
          >
            <QrCode className="size-3.5" />
            Lihat E-Ticket
            <ArrowRight className="size-3.5" />
          </Link>
        </motion.div>
      )}

      {/* Edit form */}
      <motion.form
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onSubmit={handleSave}
        className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-4"
      >
        <p className="text-[0.72rem] font-bold uppercase tracking-wider text-white/25">Edit Data Diri</p>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-wider text-white/30">
            <User className="size-3" /> Nama Lengkap
          </label>
          <input
            type="text"
            value={form.nama}
            onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
            placeholder="Nama sesuai ijazah"
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-wider text-white/30">
            <Hash className="size-3" /> NIM
          </label>
          <input
            type="text"
            value={data?.nim ?? ""}
            disabled
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-wider text-white/30">
              <GraduationCap className="size-3" /> Angkatan
            </label>
            <input
              type="number"
              value={form.angkatan}
              onChange={(e) => setForm((f) => ({ ...f, angkatan: e.target.value }))}
              placeholder="2023"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-wider text-white/30">
              <BookOpen className="size-3" /> Fakultas
            </label>
            <select
              value={form.fakultas}
              onChange={(e) => setForm((f) => ({ ...f, fakultas: e.target.value }))}
              className={inputCls + " cursor-pointer"}
            >
              {FAKULTAS_OPTIONS.map((f) => (
                <option key={f} value={f} className="bg-[#0F172A]">{f}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-wider text-white/30">
            <BookOpen className="size-3" /> Program Studi
          </label>
          <input
            type="text"
            value={form.prodi}
            onChange={(e) => setForm((f) => ({ ...f, prodi: e.target.value }))}
            placeholder="Program studi Anda"
            className={inputCls}
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full h-12 rounded-2xl border border-blue-500/30 bg-blue-500/15 text-sm font-bold text-blue-400 transition-all hover:border-blue-500/50 hover:bg-blue-500/20 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <><Loader2 className="size-4 animate-spin" /> Menyimpan...</>
          ) : (
            <><Save className="size-4" /> Simpan Perubahan</>
          )}
        </button>
      </motion.form>
    </div>
  );
}
