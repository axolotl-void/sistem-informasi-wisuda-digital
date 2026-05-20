"use client";

import { useState, useEffect } from "react";
import {
  User, CreditCard, Building2, BookOpen, Users as UsersIcon,
  Mail, Lock, Eye, EyeOff, Loader2, Save,
  CheckCircle2, XCircle, RotateCcw, GraduationCap,
  ShieldCheck, CalendarDays, Pencil, Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useWisudawan } from "@/hooks/use-wisudawan";
import type { WisudawanRow } from "@/services/wisudawan.service";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditModalProps {
  student: WisudawanRow | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EditFormData {
  nama: string;
  nim: string;
  email: string;
  password: string;
  fakultas: string;
  prodi: string;
  angkatan: number;
  status: string;
  sesiWisuda: string;
  kuotaTamu: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FAKULTAS_OPTIONS = [
  "Fakultas Teknik",
  "Fakultas Ekonomi",
  "Fakultas Hukum",
  "Fakultas MIPA",
  "Fakultas Kedokteran",
  "Fakultas Ilmu Sosial dan Politik",
];

const PRODI_MAP: Record<string, string[]> = {
  "Fakultas Teknik":                  ["Teknik Informatika", "Teknik Elektro", "Teknik Sipil", "Teknik Mesin"],
  "Fakultas Ekonomi":                 ["Manajemen", "Akuntansi", "Ekonomi Pembangunan"],
  "Fakultas Hukum":                   ["Ilmu Hukum"],
  "Fakultas MIPA":                    ["Matematika", "Fisika", "Kimia", "Biologi"],
  "Fakultas Kedokteran":              ["Pendidikan Dokter", "Keperawatan"],
  "Fakultas Ilmu Sosial dan Politik": ["Ilmu Komunikasi", "Ilmu Politik", "Sosiologi"],
};

const SESI_OPTIONS = [
  { value: "Sesi 1 Pagi",  label: "Sesi 1 — Pagi" },
  { value: "Sesi 2 Siang", label: "Sesi 2 — Siang" },
  { value: "Sesi 3 Sore",  label: "Sesi 3 — Sore" },
];

const STATUS_OPTIONS = [
  { value: "AKTIF",   label: "Aktif" },
  { value: "LULUS",   label: "Terverifikasi" },
  { value: "CUTI",    label: "Cuti" },
  { value: "DROPOUT", label: "Ditolak" },
];

const CURRENT_YEAR = new Date().getFullYear();

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, {
  label: string;
  dot: string;
  textLight: string;
  textDark: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  glow: string;
}> = {
  AKTIF: {
    label: "Aktif",
    dot: "bg-blue-500",
    textLight: "text-blue-700",   textDark: "dark:text-blue-300",
    bgLight: "bg-blue-50",        bgDark: "dark:bg-blue-500/10",
    borderLight: "border-blue-200", borderDark: "dark:border-blue-500/30",
    glow: "",
  },
  LULUS: {
    label: "Terverifikasi",
    dot: "bg-emerald-500",
    textLight: "text-emerald-700",  textDark: "dark:text-emerald-300",
    bgLight: "bg-emerald-50",       bgDark: "dark:bg-emerald-500/10",
    borderLight: "border-emerald-200", borderDark: "dark:border-emerald-500/40",
    glow: "dark:shadow-[0_0_16px_rgba(34,197,94,0.2)]",
  },
  CUTI: {
    label: "Cuti",
    dot: "bg-yellow-500",
    textLight: "text-yellow-700",  textDark: "dark:text-yellow-300",
    bgLight: "bg-yellow-50",       bgDark: "dark:bg-yellow-500/10",
    borderLight: "border-yellow-200", borderDark: "dark:border-yellow-500/30",
    glow: "",
  },
  DROPOUT: {
    label: "Ditolak",
    dot: "bg-red-500",
    textLight: "text-red-700",  textDark: "dark:text-red-300",
    bgLight: "bg-red-50",       bgDark: "dark:bg-red-500/10",
    borderLight: "border-red-200", borderDark: "dark:border-red-500/30",
    glow: "",
  },
};

// ─── Shared class strings ─────────────────────────────────────────────────────

// Input field — Premium Liquid Glass Feel dengan Focus State yang sempurna
const inputCls = cn(
  // Layout & Shape
  "w-full px-4 py-2.5 rounded-xl transition-all duration-200",
  // Background (Transparan tapi padat)
  "bg-white/40 dark:bg-black/40 backdrop-blur-md",
  // Border (Halus)
  "border border-slate-300/50 dark:border-white/10",
  // Warna Teks Input (Value yang diketik)
  "text-slate-900 dark:text-white",
  // Warna Placeholder
  "placeholder:text-slate-400 dark:placeholder:text-slate-500",
  // Hilangkan outline bawaan browser yang jelek
  "outline-none ring-offset-0",
  // Focus State - Light Mode
  "focus:bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30",
  // Focus State - Dark Mode
  "dark:focus:bg-zinc-900/80 dark:focus:border-orange-500 dark:focus:ring-2 dark:focus:ring-orange-500/30",
  // Disabled
  "disabled:opacity-50 disabled:cursor-not-allowed",
);

const selectTriggerCls = cn(
  // Layout & Shape
  "w-full px-4 py-2.5 rounded-xl transition-all duration-200",
  // Background (Transparan tapi padat)
  "bg-white/40 dark:bg-black/40 backdrop-blur-md",
  // Border (Halus)
  "border border-slate-300/50 dark:border-white/10",
  // Warna Teks
  "text-slate-900 dark:text-white",
  // Hilangkan outline bawaan browser yang jelek
  "outline-none ring-offset-0",
  // Focus State - Light Mode
  "focus:bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30",
  // Focus State - Dark Mode
  "dark:focus:bg-zinc-900/80 dark:focus:border-orange-500 dark:focus:ring-2 dark:focus:ring-orange-500/30",
);

// Section heading
const sectionHeading = "text-[10px] font-black uppercase tracking-[0.16em] text-blue-600/70 dark:text-orange-500/60 mb-3";

// Field label - TIPOGRAFI YANG ENAK DILIHAT
function FL({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Label className="text-sm font-semibold mb-1.5 block text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
      <Icon className="size-3 shrink-0 text-blue-500/70 dark:text-orange-500/60" />
      {children}
    </Label>
  );
}

// ─── Tab 1: Detail & Status ───────────────────────────────────────────────────

function TabDetail({
  student,
  onVerify,
  isVerifying,
}: {
  student: WisudawanRow;
  onVerify: (action: "approve" | "reject" | "revision") => void;
  isVerifying: string | null;
}) {
  const sc = STATUS_CFG[student.status] ?? STATUS_CFG.AKTIF;

  return (
    <div className="space-y-5">

      {/* ── Status Banner ───────────────────────────────────────── */}
      <div className={cn(
        "flex items-center gap-4 rounded-2xl border p-4",
        sc.bgLight, sc.bgDark,
        sc.borderLight, sc.borderDark,
        sc.glow,
      )}>
        <div className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          "bg-white/60 dark:bg-black/30 border",
          sc.borderLight, sc.borderDark,
        )}>
          <ShieldCheck className={cn("size-5", sc.textLight, sc.textDark)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 mb-0.5">
            Status Verifikasi
          </p>
          <div className="flex items-center gap-2">
            <span className={cn(
              "size-2 rounded-full shrink-0",
              sc.dot,
              sc.label === "Terverifikasi" && "shadow-[0_0_8px_rgba(34,197,94,0.7)]",
            )} />
            <span className={cn("text-sm font-bold", sc.textLight, sc.textDark)}>
              {sc.label}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400 mb-0.5">
            Kehadiran
          </p>
          <span className={cn(
            "text-sm font-bold",
            student.kehadiranStatus
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-400 dark:text-zinc-500",
          )}>
            {student.kehadiranStatus ?? "Belum Hadir"}
          </span>
        </div>
      </div>

      {/* ── Data Grid 2 kolom ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Nama */}
        <div className="md:col-span-2 rounded-xl border border-slate-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-1">Nama Lengkap</p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{student.nama}</p>
        </div>
        {/* NIM */}
        <div className="rounded-xl border border-slate-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-1">NIM</p>
          <p className="text-sm font-semibold font-mono text-slate-800 dark:text-slate-100">{student.nim}</p>
        </div>
        {/* Angkatan */}
        <div className="rounded-xl border border-slate-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-1">Angkatan</p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{student.angkatan}</p>
        </div>
        {/* Email */}
        <div className="md:col-span-2 rounded-xl border border-slate-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-1">Email</p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 break-all">{student.email}</p>
        </div>
        {/* Fakultas */}
        <div className="rounded-xl border border-slate-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-1">Fakultas</p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{student.fakultas}</p>
        </div>
        {/* Prodi */}
        <div className="rounded-xl border border-slate-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-1">Program Studi</p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{student.prodi}</p>
        </div>
        {/* Undangan */}
        <div className="rounded-xl border border-slate-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-1">Kode Undangan</p>
          <p className="text-sm font-semibold font-mono text-slate-800 dark:text-slate-100">
            {student.hasUndangan ? (student.undanganKode ?? "Ada") : "Belum Generate"}
          </p>
        </div>
        {/* Status Undangan */}
        <div className="rounded-xl border border-slate-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-1">Status Undangan</p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{student.undanganStatus ?? "—"}</p>
        </div>
      </div>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div className="h-px bg-slate-100 dark:bg-zinc-800" />

      {/* ── Verifikasi Actions ───────────────────────────────────── */}
      {student.status !== "LULUS" ? (
        <div className="space-y-2.5">
          <p className={sectionHeading}>Aksi Verifikasi</p>
          <div className="grid grid-cols-3 gap-2.5">
            {([
              {
                action: "approve" as const,
                icon: CheckCircle2,
                label: "Setujui",
                cls: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20",
              },
              {
                action: "revision" as const,
                icon: RotateCcw,
                label: "Revisi",
                cls: "bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-500/20",
              },
              {
                action: "reject" as const,
                icon: XCircle,
                label: "Tolak",
                cls: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20",
              },
            ]).map((btn) => (
              <button
                key={btn.action}
                type="button"
                onClick={() => onVerify(btn.action)}
                disabled={!!isVerifying}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl border py-2.5",
                  "text-[12px] font-bold transition-all duration-200 active:scale-95",
                  "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
                  btn.cls,
                )}
              >
                {isVerifying === btn.action
                  ? <Loader2 className="size-3.5 animate-spin" />
                  : <btn.icon className="size-3.5" />
                }
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3">
          <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            Mahasiswa ini sudah terverifikasi dan siap wisuda.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: Form Edit ─────────────────────────────────────────────────────────

function TabEdit({
  form,
  setField,
  isLoading,
  onSubmit,
  onClose,
}: {
  form: EditFormData;
  setField: <K extends keyof EditFormData>(k: K, v: EditFormData[K]) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const availableProdi = form.fakultas ? (PRODI_MAP[form.fakultas] ?? []) : [];

  return (
    <form id="edit-form" onSubmit={onSubmit}>
      {/* ── 2-column grid layout ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

        {/* ════════════════ KOLOM KIRI ════════════════ */}
        <div className="space-y-4">
          <p className={sectionHeading}>Data Pribadi &amp; Akademik</p>

          {/* Nama */}
          <div className="space-y-1.5">
            <label htmlFor="nama" className="text-sm font-semibold mb-1.5 block text-slate-700 dark:text-slate-200">
              Nama Lengkap
            </label>
            <Input
              id="nama"
              value={form.nama}
              onChange={(e) => setField("nama", e.target.value)}
              disabled={isLoading}
              placeholder="Nama lengkap"
              className={cn(
                "w-full px-4 py-2.5 rounded-xl transition-all duration-200",
                "bg-white/40 dark:bg-black/40 backdrop-blur-md",
                "border border-slate-300/50 dark:border-white/10",
                "text-slate-900 dark:text-white",
                "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                "outline-none ring-offset-0",
                "focus:bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30",
                "dark:focus:bg-zinc-900/80 dark:focus:border-orange-500 dark:focus:ring-2 dark:focus:ring-orange-500/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            />
          </div>

          {/* NIM */}
          <div className="space-y-1.5">
            <label htmlFor="nim" className="text-sm font-semibold block text-slate-700 dark:text-slate-200">
              NIM
            </label>
            <Input
              id="nim"
              value={form.nim}
              onChange={(e) => setField("nim", e.target.value)}
              disabled={isLoading}
              placeholder="NIM"
              className={cn(
                "w-full px-4 py-2.5 rounded-xl transition-all duration-200 font-mono tracking-wide",
                "bg-white/40 dark:bg-black/40 backdrop-blur-md",
                "border border-slate-300/50 dark:border-white/10",
                "text-slate-900 dark:text-white",
                "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                "outline-none ring-offset-0",
                "focus:bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30",
                "dark:focus:bg-zinc-900/80 dark:focus:border-orange-500 dark:focus:ring-2 dark:focus:ring-orange-500/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            />
          </div>

          {/* Angkatan */}
          <div className="space-y-1.5">
            <label htmlFor="angkatan" className="text-sm font-semibold block text-slate-700 dark:text-slate-200">
              Tahun Angkatan
            </label>
            <Input
              id="angkatan"
              type="number"
              min={2000}
              max={2100}
              value={form.angkatan}
              onChange={(e) => setField("angkatan", parseInt(e.target.value) || CURRENT_YEAR)}
              disabled={isLoading}
              placeholder={String(CURRENT_YEAR)}
              className={cn(
                "w-full px-4 py-2.5 rounded-xl transition-all duration-200",
                "bg-white/40 dark:bg-black/40 backdrop-blur-md",
                "border border-slate-300/50 dark:border-white/10",
                "text-slate-900 dark:text-white",
                "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                "outline-none ring-offset-0",
                "focus:bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30",
                "dark:focus:bg-zinc-900/80 dark:focus:border-orange-500 dark:focus:ring-2 dark:focus:ring-orange-500/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            />
          </div>

          {/* Fakultas */}
          <div className="space-y-1.5">
            <label htmlFor="fakultas-trigger" className="text-sm font-semibold block text-slate-700 dark:text-slate-200">
              Fakultas
            </label>
            <Select
              value={form.fakultas}
              onValueChange={(v) => { setField("fakultas", v); setField("prodi", ""); }}
              disabled={isLoading}
            >
              <SelectTrigger
                id="fakultas-trigger"
                className={cn(
                  "w-full px-4 py-2.5 h-auto rounded-xl transition-all duration-200",
                  "bg-white/40 dark:bg-black/40 backdrop-blur-md",
                  "border border-slate-300/50 dark:border-white/10",
                  "text-slate-900 dark:text-white",
                  "outline-none ring-offset-0",
                  "focus:bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30",
                  "dark:focus:bg-zinc-900/80 dark:focus:border-orange-500 dark:focus:ring-2 dark:focus:ring-orange-500/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "[&>span]:text-slate-900 dark:[&>span]:text-white",
                  "[&>span[data-placeholder]]:text-slate-400 dark:[&>span[data-placeholder]]:text-slate-500",
                )}
              >
                <SelectValue placeholder="Pilih fakultas…" />
              </SelectTrigger>
              <SelectContent>
                {FAKULTAS_OPTIONS.map((f) => (
                  <SelectItem key={f} value={f} className="cursor-pointer text-sm">{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prodi */}
          <div className="space-y-1.5">
            <label htmlFor="prodi-trigger" className="text-sm font-semibold block text-slate-700 dark:text-slate-200">
              Program Studi
            </label>
            <Select
              value={form.prodi}
              onValueChange={(v) => setField("prodi", v)}
              disabled={isLoading || !form.fakultas}
            >
              <SelectTrigger
                id="prodi-trigger"
                className={cn(
                  "w-full px-4 py-2.5 h-auto rounded-xl transition-all duration-200",
                  "bg-white/40 dark:bg-black/40 backdrop-blur-md",
                  "border border-slate-300/50 dark:border-white/10",
                  "text-slate-900 dark:text-white",
                  "outline-none ring-offset-0",
                  "focus:bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30",
                  "dark:focus:bg-zinc-900/80 dark:focus:border-orange-500 dark:focus:ring-2 dark:focus:ring-orange-500/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "[&>span]:text-slate-900 dark:[&>span]:text-white",
                  "[&>span[data-placeholder]]:text-slate-400 dark:[&>span[data-placeholder]]:text-slate-500",
                  !form.fakultas && "opacity-50",
                )}
              >
                <SelectValue placeholder={form.fakultas ? "Pilih prodi…" : "Pilih fakultas dulu"} />
              </SelectTrigger>
              <SelectContent>
                {availableProdi.map((p) => (
                  <SelectItem key={p} value={p} className="cursor-pointer text-sm">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ════════════════ KOLOM KANAN ════════════════ */}
        <div className="space-y-4">
          <p className={sectionHeading}>Akun &amp; Status</p>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-semibold block text-slate-700 dark:text-slate-200">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              disabled={isLoading}
              placeholder="email@domain.com"
              className={cn(
                "w-full px-4 py-2.5 rounded-xl transition-all duration-200",
                "bg-white/40 dark:bg-black/40 backdrop-blur-md",
                "border border-slate-300/50 dark:border-white/10",
                "text-slate-900 dark:text-white",
                "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                "outline-none ring-offset-0",
                "focus:bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30",
                "dark:focus:bg-zinc-900/80 dark:focus:border-orange-500 dark:focus:ring-2 dark:focus:ring-orange-500/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-semibold block text-slate-700 dark:text-slate-200">
              Password Baru
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                disabled={isLoading}
                placeholder="Kosongkan jika tidak ingin mengubah"
                className={cn(
                  "w-full px-4 py-2.5 pr-10 rounded-xl transition-all duration-200",
                  "bg-white/40 dark:bg-black/40 backdrop-blur-md",
                  "border border-slate-300/50 dark:border-white/10",
                  "text-slate-900 dark:text-white",
                  "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                  "outline-none ring-offset-0",
                  "focus:bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30",
                  "dark:focus:bg-zinc-900/80 dark:focus:border-orange-500 dark:focus:ring-2 dark:focus:ring-orange-500/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-blue-500 dark:hover:text-orange-400 transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Min. 8 karakter. Kosongkan jika tidak ingin mengubah.
            </p>
          </div>

          {/* Sesi Wisuda */}
          <div className="space-y-1.5">
            <label htmlFor="sesi-trigger" className="text-sm font-semibold block text-slate-700 dark:text-slate-200">
              Sesi Wisuda
            </label>
            <Select
              value={form.sesiWisuda}
              onValueChange={(v) => setField("sesiWisuda", v)}
              disabled={isLoading}
            >
              <SelectTrigger
                id="sesi-trigger"
                className={cn(
                  "w-full px-4 py-2.5 h-auto rounded-xl transition-all duration-200",
                  "bg-white/40 dark:bg-black/40 backdrop-blur-md",
                  "border border-slate-300/50 dark:border-white/10",
                  "text-slate-900 dark:text-white",
                  "outline-none ring-offset-0",
                  "focus:bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30",
                  "dark:focus:bg-zinc-900/80 dark:focus:border-orange-500 dark:focus:ring-2 dark:focus:ring-orange-500/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "[&>span]:text-slate-900 dark:[&>span]:text-white",
                  "[&>span[data-placeholder]]:text-slate-400 dark:[&>span[data-placeholder]]:text-slate-500",
                )}
              >
                <SelectValue placeholder="Pilih sesi…" />
              </SelectTrigger>
              <SelectContent>
                {SESI_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="cursor-pointer text-sm">{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Verifikasi */}
          <div className="space-y-1.5">
            <label htmlFor="status-trigger" className="text-sm font-semibold block text-slate-700 dark:text-slate-200">
              Status Verifikasi
            </label>
            <Select value={form.status} onValueChange={(v) => setField("status", v)} disabled={isLoading}>
              <SelectTrigger
                id="status-trigger"
                className={cn(
                  "w-full px-4 py-2.5 h-auto rounded-xl transition-all duration-200",
                  "bg-white/40 dark:bg-black/40 backdrop-blur-md",
                  "border border-slate-300/50 dark:border-white/10",
                  "text-slate-900 dark:text-white",
                  "outline-none ring-offset-0",
                  "focus:bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30",
                  "dark:focus:bg-zinc-900/80 dark:focus:border-orange-500 dark:focus:ring-2 dark:focus:ring-orange-500/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "[&>span]:text-slate-900 dark:[&>span]:text-white",
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="cursor-pointer text-sm font-medium">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Kuota Keluarga */}
          <div className="space-y-1.5">
            <label htmlFor="kuota" className="text-sm font-semibold block text-slate-700 dark:text-slate-200">
              Kuota Keluarga
            </label>
            <Input
              id="kuota"
              type="number"
              min={0}
              max={5}
              value={form.kuotaTamu}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setField("kuotaTamu", isNaN(val) ? 0 : Math.min(5, Math.max(0, val)));
              }}
              disabled={isLoading}
              className={cn(
                "w-full px-4 py-2.5 rounded-xl transition-all duration-200",
                "bg-white/40 dark:bg-black/40 backdrop-blur-md",
                "border border-slate-300/50 dark:border-white/10",
                "text-slate-900 dark:text-white",
                "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                "outline-none ring-offset-0",
                "focus:bg-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30",
                "dark:focus:bg-zinc-900/80 dark:focus:border-orange-500 dark:focus:ring-2 dark:focus:ring-orange-500/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Maks. 5 orang</p>
          </div>
        </div>
      </div>

      {/* ── Footer Buttons ───────────────────────────────────────── */}
      <div className="flex gap-3 mt-7 pt-5 border-t border-slate-100 dark:border-zinc-800">
        {/* Batal */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className={cn(
            "flex-1 h-10 rounded-xl border text-sm font-semibold",
            "bg-white dark:bg-zinc-900",
            "border-slate-200 dark:border-zinc-700",
            "text-slate-700 dark:text-slate-300",
            "hover:bg-slate-50 dark:hover:bg-zinc-800",
            "transition-all duration-200 active:scale-95",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
          )}
        >
          Batal
        </button>

        {/* Simpan */}
        <button
          type="submit"
          form="edit-form"
          disabled={isLoading}
          className={cn(
            "flex-1 h-10 rounded-xl text-sm font-bold",
            "inline-flex items-center justify-center gap-2",
            // Light
            "bg-gradient-to-r from-blue-500 to-indigo-600",
            "text-white",
            "shadow-[0_4px_14px_rgba(59,130,246,0.4)]",
            "hover:from-blue-600 hover:to-indigo-700",
            "hover:shadow-[0_4px_20px_rgba(59,130,246,0.55)]",
            // Dark
            "dark:from-orange-500 dark:to-amber-500",
            "dark:text-zinc-950",
            "dark:shadow-[0_4px_14px_rgba(249,115,22,0.35)]",
            "dark:hover:from-orange-400 dark:hover:to-amber-400",
            "dark:hover:shadow-[0_0_22px_rgba(249,115,22,0.45)]",
            // Shared
            "transition-all duration-200 active:scale-95",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          )}
        >
          {isLoading
            ? <><Loader2 className="size-4 animate-spin" />Menyimpan…</>
            : <><Save className="size-4" />Simpan Perubahan</>
          }
        </button>
      </div>
    </form>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EditModal({ student, open, onClose, onSuccess }: EditModalProps) {
  const { update, verify } = useWisudawan();
  const [isLoading,   setIsLoading]   = useState(false);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [activeTab,   setActiveTab]   = useState("detail");

  const [form, setFormState] = useState<EditFormData>({
    nama: "", nim: "", email: "", password: "",
    fakultas: "", prodi: "", angkatan: CURRENT_YEAR,
    status: "AKTIF", sesiWisuda: "", kuotaTamu: 2,
  });

  useEffect(() => {
    if (student) {
      setFormState({
        nama:       student.nama,
        nim:        student.nim,
        email:      student.email,
        password:   "",
        fakultas:   student.fakultas,
        prodi:      student.prodi,
        angkatan:   student.angkatan,
        status:     student.status,
        sesiWisuda: student.sesiWisuda ?? "",
        kuotaTamu:  2,
      });
      setActiveTab("detail");
    }
  }, [student]);

  function setField<K extends keyof EditFormData>(key: K, value: EditFormData[K]) {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!student || isLoading) return;

    if (!form.nama.trim())              { toast.error("Nama lengkap wajib diisi"); return; }
    if (!form.nim.trim())               { toast.error("NIM wajib diisi"); return; }
    if (form.nim.trim().length < 8)     { toast.error("NIM minimal 8 karakter"); return; }
    if (!form.email.trim())             { toast.error("Email wajib diisi"); return; }
    if (!form.fakultas)                 { toast.error("Fakultas wajib dipilih"); return; }
    if (!form.prodi)                    { toast.error("Program studi wajib dipilih"); return; }
    if (form.password && form.password.length < 8) { toast.error("Password minimal 8 karakter"); return; }
    if (form.kuotaTamu < 0 || form.kuotaTamu > 5)  { toast.error("Kuota keluarga harus antara 0–5"); return; }

    setIsLoading(true);
    try {
      const payload: Record<string, unknown> = {
        nim:        form.nim.trim(),
        nama:       form.nama.trim(),
        email:      form.email.trim(),
        fakultas:   form.fakultas,
        prodi:      form.prodi,
        angkatan:   form.angkatan,
        status:     form.status,
        sesiWisuda: form.sesiWisuda || null,
      };
      if (form.password.trim()) payload.password = form.password;

      await update(student.id, payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui data");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify(action: "approve" | "reject" | "revision") {
    if (!student) return;
    setIsVerifying(action);
    try {
      await verify(student.id, action);
      const newStatus = action === "approve" ? "LULUS" : action === "reject" ? "DROPOUT" : "AKTIF";
      setField("status", newStatus);
      onSuccess?.();
    } catch {
      toast.error("Gagal memverifikasi");
    } finally {
      setIsVerifying(null);
    }
  }

  function handleClose() {
    if (!isLoading && !isVerifying) onClose();
  }

  const sc       = student ? (STATUS_CFG[student.status] ?? STATUS_CFG.AKTIF) : STATUS_CFG.AKTIF;
  const initials = student
    ? student.nama.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "—";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          // ── Size — melebar ke samping, tidak memanjang ke bawah ──
          "w-[95vw] sm:max-w-3xl md:max-w-4xl",
          "max-h-[90vh] overflow-y-auto",
          "p-0 gap-0",
          "rounded-2xl",
          // ── Light Mode — glass dengan kontras tinggi ─────────────
          "bg-white/85 backdrop-blur-xl",
          "border border-white/60",
          "shadow-[0_8px_40px_rgba(37,99,235,0.18),0_2px_8px_rgba(0,0,0,0.08)]",
          "text-slate-900",
          // ── Dark Mode ────────────────────────────────────────────
          "dark:bg-zinc-950/85 dark:backdrop-blur-xl",
          "dark:border-orange-500/25",
          "dark:shadow-[0_0_50px_-8px_rgba(249,115,22,0.3),0_8px_32px_rgba(0,0,0,0.4)]",
          "dark:text-slate-50",
        )}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-zinc-800/80 bg-white/30 dark:bg-black/20">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl",
              "text-[13px] font-black",
              "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
              "dark:from-orange-500 dark:to-amber-500 dark:text-zinc-950",
              "shadow-[0_4px_12px_rgba(59,130,246,0.4)]",
              "dark:shadow-[0_4px_12px_rgba(249,115,22,0.35)]",
            )}>
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-black text-slate-900 dark:text-white leading-tight truncate">
                {student?.nama ?? "—"}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <DialogDescription className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono tracking-wide">
                  {student?.nim ?? "—"}
                </DialogDescription>
                {student && (
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5",
                    "text-[9px] font-black tracking-wide",
                    sc.bgLight, sc.bgDark,
                    sc.borderLight, sc.borderDark,
                    sc.textLight, sc.textDark,
                    sc.glow,
                  )}>
                    <span className={cn("size-1.5 rounded-full", sc.dot)} />
                    {sc.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* ── Tabs — pill style, full width ──────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
          <div className="flex justify-center px-6 py-3 border-b border-slate-100 dark:border-zinc-800/80 bg-white/20 dark:bg-black/10">
            <TabsList className={cn(
              "h-9 rounded-full p-1 gap-1 w-full max-w-sm",
              "bg-slate-100/80 dark:bg-zinc-900/80",
              "border border-slate-200 dark:border-zinc-700",
            )}>
              <TabsTrigger
                value="detail"
                className={cn(
                  "flex-1 h-7 rounded-full text-[12px] font-semibold gap-1.5",
                  "transition-all duration-300",
                  "text-slate-500 dark:text-zinc-400",
                  // Active light
                  "data-[state=active]:bg-white data-[state=active]:text-blue-600",
                  "data-[state=active]:shadow-sm",
                  // Active dark
                  "dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-orange-400",
                  "dark:data-[state=active]:shadow-md",
                )}
              >
                <ShieldCheck className="size-3" />
                Detail &amp; Status
              </TabsTrigger>
              <TabsTrigger
                value="edit"
                className={cn(
                  "flex-1 h-7 rounded-full text-[12px] font-semibold gap-1.5",
                  "transition-all duration-300",
                  "text-slate-500 dark:text-zinc-400",
                  "data-[state=active]:bg-white data-[state=active]:text-blue-600",
                  "data-[state=active]:shadow-sm",
                  "dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-orange-400",
                  "dark:data-[state=active]:shadow-md",
                )}
              >
                <Pencil className="size-3" />
                Edit Data
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab content */}
          <TabsContent value="detail" className="px-6 py-5 mt-0 focus-visible:ring-0">
            {student && (
              <TabDetail
                student={student}
                onVerify={handleVerify}
                isVerifying={isVerifying}
              />
            )}
          </TabsContent>

          <TabsContent value="edit" className="px-6 py-5 mt-0 focus-visible:ring-0">
            <TabEdit
              form={form}
              setField={setField}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              onClose={handleClose}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
