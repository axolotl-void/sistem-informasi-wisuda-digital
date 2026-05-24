"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Camera, CheckCircle2, AlertCircle, Hash,
  GraduationCap, BookOpen, Mail, Save, Loader2,
  QrCode, Calendar, MapPin, ArrowRight, Shirt,
  Sparkles, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// --- Types --------------------------------------------------------------------

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

interface FormState {
  fakultas: string;
  prodi: string;
  ukuranToga: string;
}

interface FormErrors {
  fakultas?: string;
  prodi?: string;
}

// --- Constants ----------------------------------------------------------------

const FAKULTAS_OPTIONS = [
  "Fakultas Teknik",
  "Fakultas Ekonomi",
  "Fakultas Hukum",
  "Fakultas MIPA",
  "Fakultas Kedokteran",
  "Fakultas Ilmu Sosial dan Politik",
  "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)",
  "Fakultas Sains, Teknologi, dan Ilmu Kesehatan (FSTIK)",
];

const TOGA_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

// --- Progress helpers ---------------------------------------------------------

function calcProgress(data: MahasiswaData | null, toga: string): number {
  if (!data) return 0;
  const fields = [
    data.nama,
    data.nim,
    data.email,
    data.fakultas,
    data.prodi,
    String(data.angkatan),
    data.foto,
    toga,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

function getProgressColor(value: number) {
  if (value < 40) return { bar: "from-red-500 to-rose-400", text: "text-red-400", glow: "shadow-red-500/20" };
  if (value < 75) return { bar: "from-amber-500 to-yellow-400", text: "text-amber-400", glow: "shadow-amber-500/20" };
  return { bar: "from-emerald-500 to-teal-400", text: "text-emerald-400", glow: "shadow-emerald-500/20" };
}

// --- Sub-components -----------------------------------------------------------

function SkeletonCard({ h = "h-32" }: { h?: string }) {
  return (
    <div className={`${h} rounded-3xl bg-white/[0.03] border border-white/[0.05] animate-pulse`} />
  );
}

function SectionCard({
  children, delay = 0, className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className={`rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-xl shadow-black/20 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function FieldLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <label className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-widest text-white/30 mb-2">
      <Icon className="size-3 text-cyan-400/60" />
      {label}
    </label>
  );
}

const inputBase =
  "w-full h-12 rounded-2xl border bg-white/[0.04] px-4 text-sm text-white/80 placeholder-white/15 outline-none transition-all duration-200 backdrop-blur-sm";
const inputNormal =
  `${inputBase} border-white/[0.08] focus:border-cyan-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-cyan-500/10 focus:shadow-lg focus:shadow-cyan-500/5`;
const inputError =
  `${inputBase} border-red-500/40 bg-red-500/[0.04] focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10`;
const inputDisabled =
  `${inputBase} border-white/[0.05] bg-white/[0.02] text-white/30 cursor-not-allowed select-none`;
const selectBase =
  `${inputNormal} cursor-pointer appearance-none`;

// --- Toga Segmented Control ---------------------------------------------------

function TogaControl({
  value, onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TOGA_SIZES.map((size) => {
        const active = value === size;
        return (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            className={`relative h-10 min-w-[3rem] px-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${
              active
                ? "bg-gradient-to-br from-cyan-500/30 to-teal-500/20 border border-cyan-400/40 text-cyan-300 shadow-lg shadow-cyan-500/15"
                : "border border-white/[0.08] bg-white/[0.03] text-white/35 hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white/60"
            }`}
          >
            {active && (
              <motion.span
                layoutId="toga-active"
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{size}</span>
          </button>
        );
      })}
    </div>
  );
}

// --- Avatar Upload ------------------------------------------------------------

function AvatarUpload({
  foto, nama, onUpload, isUploading = false,
}: {
  foto: string | null;
  nama: string;
  onUpload: () => void;
  isUploading?: boolean;
}) {
  const initials = nama
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`relative group ${isUploading ? "cursor-wait" : "cursor-pointer"}`}
      onClick={!isUploading ? onUpload : undefined}
    >
      {/* Neon ring */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-cyan-500/40 via-blue-500/30 to-indigo-500/40 blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex size-24 items-center justify-center rounded-full border-2 border-cyan-400/30 bg-gradient-to-br from-[#0d1829] to-[#0a1020] overflow-hidden shadow-2xl shadow-cyan-500/10">
        {foto ? (
          <img src={foto} alt={nama} className="size-full object-cover" />
        ) : (
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-400">
            {initials}
          </span>
        )}
        {/* Hover / uploading overlay */}
        <div className={`absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center ${isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          {isUploading ? (
            <Loader2 className="size-6 text-white animate-spin" />
          ) : (
            <Camera className="size-6 text-white" />
          )}
        </div>
      </div>
      {/* Camera badge */}
      <div className={`absolute -bottom-0.5 -right-0.5 flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-[#060d1a] shadow-lg shadow-cyan-500/30 transition-opacity ${isUploading ? "opacity-50" : ""}`}>
        {isUploading ? (
          <Loader2 className="size-3.5 text-white animate-spin" />
        ) : (
          <Camera className="size-3.5 text-white" />
        )}
      </div>
    </div>
  );
}

// --- Progress Bar -------------------------------------------------------------

function ProfileProgress({ value }: { value: number }) {
  const { bar, text, glow } = getProgressColor(value);
  const isComplete = value === 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="size-4 text-emerald-400" />
          ) : (
            <AlertCircle className="size-4 text-amber-400/70" />
          )}
          <span className="text-xs font-semibold text-white/50">Kelengkapan Profil</span>
        </div>
        <span className={`text-sm font-black tabular-nums ${text}`}>{value}%</span>
      </div>

      {/* Track */}
      <div className="relative h-2.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
        {/* Glow layer */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${bar} blur-sm opacity-60`}
        />
        {/* Solid bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${bar}`}
        />
      </div>

      <p className={`text-[0.68rem] ${isComplete ? "text-emerald-400/80" : "text-white/25"}`}>
        {isComplete
          ? "✨ Profil lengkap! Semua fitur tersedia."
          : "Lengkapi profil untuk mengakses semua fitur wisuda."}
      </p>
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------

export default function ProfilPage() {
  const [data, setData] = useState<MahasiswaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [form, setForm] = useState<FormState>({ fakultas: "", prodi: "", ukuranToga: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  function getToken(): string | null {
    try {
      const raw = localStorage.getItem("wisuda-auth");
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { state?: { token?: string } };
      return parsed?.state?.token ?? null;
    } catch { return null; }
  }

  useEffect(() => {
    const token = getToken();
    fetch("/api/portal/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          setData(result.data);
          setForm({
            fakultas: result.data.fakultas ?? "",
            prodi: result.data.prodi ?? "",
            ukuranToga: result.data.ukuranToga ?? "",
          });
        }
      })
      .catch(() => toast.error("Gagal memuat data profil"))
      .finally(() => setIsLoading(false));
  }, []);

  // -- Upload foto handler -----------------------------------------------------
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, WebP)");
      return;
    }

    // Validasi ukuran (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 2MB");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // Konversi ke Base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Kirim ke API
      const token = getToken();
      const res = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ foto: base64 }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal mengunggah foto");
      }

      const result = await res.json();
      // Update state lokal dengan foto baru
      setData((prev) => prev ? { ...prev, foto: result.data.foto } : prev);
      // Broadcast ke komponen lain (sidebar) via storage event
      window.dispatchEvent(new StorageEvent("storage", { key: "portal-foto-updated" }));
      toast.success("Foto profil berhasil diperbarui", {
        icon: <CheckCircle2 className="size-4 text-emerald-400" />,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengunggah foto");
    } finally {
      setIsUploadingPhoto(false);
      // Reset input agar file yang sama bisa dipilih lagi
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.fakultas) e.fakultas = "Fakultas wajib dipilih";
    if (!form.prodi.trim()) e.prodi = "Program studi wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!data || !validate()) return;
    setIsSaving(true);
    try {
      const token = getToken();
      const res = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          fakultas: form.fakultas,
          prodi: form.prodi,
        }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      setData((prev) => prev ? { ...prev, fakultas: form.fakultas, prodi: form.prodi } : prev);
      toast.success("Profil berhasil disimpan", {
        description: "Perubahan data Anda telah tersimpan.",
        icon: <CheckCircle2 className="size-4 text-emerald-400" />,
      });
    } catch {
      toast.error("Gagal menyimpan profil", { description: "Coba lagi beberapa saat." });
    } finally {
      setIsSaving(false);
    }
  }

  const progress = calcProgress(data, form.ukuranToga);

  // -- Loading skeleton --------------------------------------------------------
  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard h="h-40" />
        <SkeletonCard h="h-20" />
        <SkeletonCard h="h-64" />
        <SkeletonCard h="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-4">
      {/* -- Hero Header -------------------------------------------------------- */}
      <SectionCard delay={0} className="p-5 overflow-hidden relative">
        {/* Ambient glow */}
        <div className="absolute -top-10 -right-10 size-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 size-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-start gap-4">
          <AvatarUpload
            foto={data?.foto ?? null}
            nama={data?.nama ?? "?"}
            onUpload={() => fileInputRef.current?.click()}
            isUploading={isUploadingPhoto}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-black text-white/90 leading-tight truncate">
                {data?.nama ?? "—"}
              </h1>
              {data?.status === "LULUS" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[0.6rem] font-bold text-emerald-400">
                  <ShieldCheck className="size-2.5" /> Terverifikasi
                </span>
              )}
            </div>
            <p className="text-[0.72rem] text-white/35 mt-0.5 font-mono">{data?.nim ?? "—"}</p>
            <p className="text-[0.65rem] text-white/25 mt-1 truncate">{data?.prodi} · {data?.fakultas}</p>
            {data?.sesiWisuda && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1">
                <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[0.62rem] font-bold text-cyan-400">{data.sesiWisuda}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5 pt-4 border-t border-white/[0.06]">
          <ProfileProgress value={progress} />
        </div>
      </SectionCard>

      {/* -- Undangan Status ---------------------------------------------------- */}
      {data?.undangan && (
        <SectionCard delay={0.05} className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-cyan-400/60" />
              <p className="text-[0.72rem] font-bold uppercase tracking-widest text-white/30">Status Undangan</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[0.62rem] font-bold text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {data.undangan.statusUndangan === "AKTIF" ? "QR Aktif" : data.undangan.statusUndangan}
            </span>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden divide-y divide-white/[0.04]">
            {[
              { icon: Calendar, label: "Tanggal", value: new Date(data.undangan.tanggalWisuda).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
              { icon: MapPin, label: "Tempat", value: data.undangan.tempatWisuda },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <Icon className="size-3.5 text-white/20" />
                  <span className="text-xs text-white/30">{label}</span>
                </div>
                <span className="text-xs font-semibold text-white/60 text-right max-w-[55%]">{value}</span>
              </div>
            ))}
          </div>
          <Link
            href="/portal/tiket"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.08] py-3 text-xs font-bold text-cyan-400 hover:bg-cyan-500/[0.14] hover:border-cyan-500/40 transition-all active:scale-[0.98]"
          >
            <QrCode className="size-3.5" />
            Lihat E-Ticket
            <ArrowRight className="size-3.5" />
          </Link>
        </SectionCard>
      )}

      {/* -- Form --------------------------------------------------------------- */}
      <form onSubmit={handleSave} className="space-y-4">

        {/* Grup Kredensial */}
        <SectionCard delay={0.1} className="p-5 space-y-4">
          <div className="flex items-center gap-2 pb-1">
            <User className="size-3.5 text-cyan-400/60" />
            <p className="text-[0.7rem] font-black uppercase tracking-widest text-white/25">Kredensial</p>
          </div>

          <div>
            <FieldLabel icon={User} label="Nama Lengkap" />
            <input type="text" value={data?.nama ?? ""} disabled className={inputDisabled} />
            <p className="mt-1.5 text-[0.62rem] text-white/20 flex items-center gap-1">
              <ShieldCheck className="size-3" /> Nama dikunci untuk menjaga integritas data akademik
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel icon={Hash} label="NIM" />
              <input type="text" value={data?.nim ?? ""} disabled className={inputDisabled} />
            </div>
            <div>
              <FieldLabel icon={Mail} label="Email" />
              <input type="email" value={data?.email ?? ""} disabled className={inputDisabled} />
            </div>
          </div>
        </SectionCard>

        {/* Grup Akademik */}
        <SectionCard delay={0.15} className="p-5 space-y-4">
          <div className="flex items-center gap-2 pb-1">
            <GraduationCap className="size-3.5 text-cyan-400/60" />
            <p className="text-[0.7rem] font-black uppercase tracking-widest text-white/25">Data Akademik</p>
          </div>

          <div>
            <FieldLabel icon={BookOpen} label="Fakultas" />
            <div className="relative">
              <select
                value={form.fakultas}
                onChange={(e) => { setForm((f) => ({ ...f, fakultas: e.target.value })); setErrors((er) => ({ ...er, fakultas: undefined })); }}
                className={errors.fakultas ? inputError + " cursor-pointer" : selectBase}
              >
                <option value="" className="bg-[#0F172A]">Pilih fakultas...</option>
                {FAKULTAS_OPTIONS.map((f) => (
                  <option key={f} value={f} className="bg-[#0F172A]">{f}</option>
                ))}
              </select>
              <BookOpen className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-3.5 text-white/20" />
            </div>
            <AnimatePresence>
              {errors.fakultas && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-1.5 text-[0.65rem] text-red-400 flex items-center gap-1">
                  <AlertCircle className="size-3" /> {errors.fakultas}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div>
            <FieldLabel icon={GraduationCap} label="Program Studi" />
            <input
              type="text"
              value={form.prodi}
              onChange={(e) => { setForm((f) => ({ ...f, prodi: e.target.value })); setErrors((er) => ({ ...er, prodi: undefined })); }}
              placeholder="Contoh: Teknik Informatika"
              className={errors.prodi ? inputError : inputNormal}
            />
            <AnimatePresence>
              {errors.prodi && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-1.5 text-[0.65rem] text-red-400 flex items-center gap-1">
                  <AlertCircle className="size-3" /> {errors.prodi}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </SectionCard>

        {/* Grup Ukuran Toga */}
        <SectionCard delay={0.2} className="p-5 space-y-4">
          <div className="flex items-center gap-2 pb-1">
            <Shirt className="size-3.5 text-cyan-400/60" />
            <p className="text-[0.7rem] font-black uppercase tracking-widest text-white/25">Atribut Wisuda</p>
          </div>

          <div>
            <FieldLabel icon={Shirt} label="Ukuran Toga" />
            <TogaControl
              value={form.ukuranToga}
              onChange={(v) => setForm((f) => ({ ...f, ukuranToga: v }))}
            />
            {!form.ukuranToga && (
              <p className="mt-2 text-[0.62rem] text-white/20 flex items-center gap-1">
                <AlertCircle className="size-3 text-amber-400/50" />
                <span className="text-amber-400/50">Pilih ukuran toga untuk melengkapi profil</span>
              </p>
            )}
          </div>
        </SectionCard>

        {/* Tombol Simpan */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25, ease: "easeOut" }}
        >
          <button
            type="submit"
            disabled={isSaving}
            className="relative w-full h-14 rounded-3xl text-sm font-black text-white overflow-hidden transition-all duration-300 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 transition-opacity duration-300" />
            {/* Hover glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Neon shadow */}
            <div className="absolute inset-0 rounded-3xl shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow duration-300" />
            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <span className="relative flex items-center justify-center gap-2.5">
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Simpan Perubahan
                </>
              )}
            </span>
          </button>
        </motion.div>

      </form>
    </div>
  );
}
