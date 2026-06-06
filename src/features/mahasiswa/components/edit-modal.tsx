"use client";

import { useState, useEffect } from "react";
import {
  User, CreditCard, Building2, BookOpen, Users as UsersIcon,
  Mail, Lock, Eye, EyeOff, Loader2, Save,
  CheckCircle2, XCircle, RotateCcw, GraduationCap,
  ShieldCheck, CalendarDays, Pencil, Ticket, DoorOpen, Shirt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useWisudawan } from "@/hooks/use-wisudawan";
import type { WisudawanRow } from "@/services/wisudawan.service";
import { api } from "@/lib/axios";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  glassBtnGhost,
  glassBtnPrimary,
  glassInput,
} from "@/components/ui/liquid-glass";
import { usePengaturanStore } from "@/store/pengaturan.store";

// --- Types --------------------------------------------------------------------

interface EditModalProps {
  student: WisudawanRow | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onUpdated?: (updated: WisudawanRow) => void;
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
  gate: string;
  kuotaTamu: number;
  ukuranToga: string;
}

// --- Constants ----------------------------------------------------------------

const FAKULTAS_OPTIONS = [
  "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)",
  "Fakultas Sains, Teknologi, dan Ilmu Kesehatan (FSTIK)",
];

const PRODI_MAP: Record<string, string[]> = {
  "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)": [
    "S1 Pendidikan Bahasa dan Sastra Aceh",
    "S1 Pendidikan Bahasa Indonesia",
    "S1 Pendidikan Bahasa Inggris",
    "S1 Pendidikan Matematika",
    "S1 Pendidikan Jasmani",
    "S1 Pendidikan Guru Sekolah Dasar (PGSD)",
    "S1 Pendidikan Guru Pendidikan Anak Usia Dini (PG PAUD)",
    "S1 Pendidikan Ilmu Pengetahuan Alam (Pendidikan IPA)",
    "S1 Pendidikan Seni Pertunjukan",
    "S2 Penjaminan Mutu Pendidikan",
    "S2 Pendidikan Dasar",
    "Pendidikan Profesi Guru (PPG)"
  ],
  "Fakultas Sains, Teknologi, dan Ilmu Kesehatan (FSTIK)": [
    "S1 Ilmu Komputer",
    "S1 Keperawatan",
    "S1 Kebidanan"
  ],
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

// --- Status config ------------------------------------------------------------

const STATUS_CFG: Record<string, {
  label: string;
  dot: string;
  text: string;
  banner: string;
  iconBox: string;
  badge: string;
}> = {
  AKTIF: {
    label: "Aktif",
    dot: "bg-blue-500",
    text: "text-blue-800 dark:text-blue-300",
    banner:
      "border-blue-400/35 bg-blue-500/12 backdrop-blur-xl dark:border-blue-500/25 dark:bg-blue-500/10",
    iconBox:
      "border-blue-400/40 bg-blue-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-blue-500/30 dark:bg-blue-500/15",
    badge:
      "border-blue-400/30 bg-blue-500/15 text-blue-800 dark:border-blue-500/25 dark:bg-blue-500/12 dark:text-blue-300",
  },
  LULUS: {
    label: "Terverifikasi",
    dot: "bg-emerald-500",
    text: "text-emerald-800 dark:text-emerald-300",
    banner:
      "border-emerald-400/40 bg-emerald-500/15 backdrop-blur-xl shadow-[0_0_24px_rgba(16,185,129,0.08)] dark:border-emerald-500/30 dark:bg-emerald-500/10",
    iconBox:
      "border-emerald-400/40 bg-emerald-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-emerald-500/30 dark:bg-emerald-500/15",
    badge:
      "border-emerald-400/35 bg-emerald-500/15 text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/12 dark:text-emerald-300",
  },
  REVISI: {
    label: "Revisi",
    dot: "bg-amber-500",
    text: "text-amber-800 dark:text-amber-300",
    banner:
      "border-amber-400/35 bg-amber-500/12 backdrop-blur-xl dark:border-amber-500/25 dark:bg-amber-500/10",
    iconBox:
      "border-amber-400/40 bg-amber-500/20 dark:border-amber-500/30 dark:bg-amber-500/15",
    badge:
      "border-amber-400/30 bg-amber-500/15 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/12 dark:text-amber-300",
  },
  CUTI: {
    label: "Cuti",
    dot: "bg-amber-500",
    text: "text-amber-800 dark:text-amber-300",
    banner:
      "border-amber-400/35 bg-amber-500/12 backdrop-blur-xl dark:border-amber-500/25 dark:bg-amber-500/10",
    iconBox:
      "border-amber-400/40 bg-amber-500/20 dark:border-amber-500/30 dark:bg-amber-500/15",
    badge:
      "border-amber-400/30 bg-amber-500/15 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/12 dark:text-amber-300",
  },
  DROPOUT: {
    label: "Ditolak",
    dot: "bg-red-500",
    text: "text-red-800 dark:text-red-300",
    banner:
      "border-red-400/35 bg-red-500/12 backdrop-blur-xl dark:border-red-500/25 dark:bg-red-500/10",
    iconBox:
      "border-red-400/40 bg-red-500/20 dark:border-red-500/30 dark:bg-red-500/15",
    badge:
      "border-red-400/30 bg-red-500/15 text-red-800 dark:border-red-500/25 dark:bg-red-500/12 dark:text-red-300",
  },
};

// --- Shared class strings -----------------------------------------------------

const inputCls = cn(glassInput, "h-auto w-full px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed");
const selectTriggerCls = cn(glassInput, "h-auto w-full px-4 py-2.5 [&>span]:text-slate-900 dark:[&>span]:text-white/90");
const detailFieldCls = cn(
  "rounded-2xl border p-3 backdrop-blur-md",
  "border-white/80 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]",
  "dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none",
);
const detailLabelCls = "text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/35 mb-1";
const detailValueCls = "text-sm font-semibold text-slate-800 dark:text-white/90";
const sectionHeading =
  "text-[10px] font-black uppercase tracking-[0.16em] text-blue-700 dark:text-blue-400/90 mb-3";
const fieldLabelCls = "text-sm font-semibold mb-1.5 block text-slate-700 dark:text-white/75";
const selectContentCls =
  "border-white/80 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f172a]/95";

// --- Tab 1: Detail & Status ---------------------------------------------------

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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-5">

      {/* -- Status Banner ----------------------------------------- */}
      <div className={cn("flex items-center gap-4 rounded-2xl border p-4", sc.banner)}>
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl border", sc.iconBox)}>
          <ShieldCheck className={cn("size-5", sc.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/35 mb-0.5">
            Status Verifikasi
          </p>
          <div className="flex items-center gap-2">
            <span className={cn("size-2 shrink-0 rounded-full", sc.dot)} />
            <span className={cn("text-sm font-bold", sc.text)}>{sc.label}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/35 mb-0.5">
            Kehadiran
          </p>
          <span
            className={cn(
              "text-sm font-bold",
              student.kehadiranStatus
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-slate-500 dark:text-white/40",
            )}
          >
            {student.kehadiranStatus ?? "Belum Hadir"}
          </span>
        </div>
      </div>

      {/* -- Sesi Wisuda Banner (jika ada) -------------------------- */}
      {student.sesiWisuda && (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-400/35 bg-blue-500/12 px-4 py-3 backdrop-blur-xl dark:border-blue-500/25 dark:bg-blue-500/10">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-400/40 bg-blue-500/20 dark:border-blue-500/30 dark:bg-blue-500/15">
            <GraduationCap className="size-4 text-blue-700 dark:text-blue-300" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/35 mb-0.5">
              Sesi Wisuda
            </p>
            <p className="text-sm font-bold text-blue-800 dark:text-blue-300">{student.sesiWisuda}</p>
          </div>
        </div>
      )}

      {/* -- Data Grid 2 kolom -------------------------------------- */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className={cn(detailFieldCls, "md:col-span-2")}>
          <p className={detailLabelCls}>Nama Lengkap</p>
          <p className={detailValueCls}>{student.nama}</p>
        </div>
        <div className={detailFieldCls}>
          <p className={detailLabelCls}>NIM</p>
          <p className={cn(detailValueCls, "font-mono")}>{student.nim}</p>
        </div>
        <div className={detailFieldCls}>
          <p className={detailLabelCls}>Angkatan</p>
          <p className={detailValueCls}>{student.angkatan}</p>
        </div>
        <div className={detailFieldCls}>
          <p className={detailLabelCls}>Email</p>
          <p className={cn(detailValueCls, "break-all")}>{student.email}</p>
        </div>
        <div className={cn(detailFieldCls, "relative pr-10")}>
          <p className={detailLabelCls}>Password</p>
          <p className={cn(detailValueCls, "font-mono break-all pr-2")}>
            {student.password ? (showPassword ? student.password : "••••••••") : "••••••••"}
          </p>
          {student.password ? (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-blue-600 dark:text-white/35 dark:hover:text-blue-400"
              title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="size-3.5 animate-spin text-slate-400 dark:text-white/35" />
            </div>
          )}
        </div>
        <div className={detailFieldCls}>
          <p className={detailLabelCls}>Fakultas</p>
          <p className={detailValueCls}>{student.fakultas}</p>
        </div>
        <div className={detailFieldCls}>
          <p className={detailLabelCls}>Program Studi</p>
          <p className={detailValueCls}>{student.prodi}</p>
        </div>
        <div className={detailFieldCls}>
          <p className={detailLabelCls}>Kode Undangan</p>
          <p className={cn(detailValueCls, "font-mono")}>
            {student.hasUndangan ? (student.undanganKode ?? "Ada") : "Belum Generate"}
          </p>
        </div>
        <div className={detailFieldCls}>
          <p className={detailLabelCls}>Status Undangan</p>
          <p className={detailValueCls}>{student.undanganStatus ?? "-"}</p>
        </div>
        <div className={detailFieldCls}>
          <p className={detailLabelCls}>Sesi Wisuda</p>
          {student.sesiWisuda ? (
            <div className="flex items-center gap-2">
              <GraduationCap className="size-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className={detailValueCls}>{student.sesiWisuda}</p>
            </div>
          ) : (
            <p className="text-sm font-semibold text-slate-400 dark:text-white/35">Belum Ditentukan</p>
          )}
        </div>
        <div className={detailFieldCls}>
          <p className={detailLabelCls}>Gate Wisuda</p>
          {student.gate ? (
            <div className="flex items-center gap-2">
              <DoorOpen className="size-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className={detailValueCls}>{student.gate}</p>
            </div>
          ) : (
            <p className="text-sm font-semibold text-slate-400 dark:text-white/35">Belum Ditentukan</p>
          )}
        </div>
        <div className={detailFieldCls}>
          <p className={detailLabelCls}>Ukuran Toga</p>
          {student.ukuranToga ? (
            <div className="flex items-center gap-2">
              <Shirt className="size-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className={detailValueCls}>{student.ukuranToga}</p>
            </div>
          ) : (
            <p className="text-sm font-semibold text-slate-400 dark:text-white/35">Belum Memilih</p>
          )}
        </div>
      </div>

      <div className="h-px bg-white/60 dark:bg-white/[0.08]" />

      {/* -- Verifikasi Actions ------------------------------------- */}
      {student.status !== "LULUS" ? (
        <div className="space-y-2.5">
          <p className={sectionHeading}>Aksi Verifikasi</p>
          <div className="grid grid-cols-3 gap-2.5">
            {([
              {
                action: "approve" as const,
                icon: CheckCircle2,
                label: "Setujui",
                cls:
                  "border-emerald-400/40 bg-emerald-500/15 text-emerald-800 hover:bg-emerald-500/25 dark:border-emerald-500/30 dark:bg-emerald-500/12 dark:text-emerald-300",
              },
              {
                action: "revision" as const,
                icon: RotateCcw,
                label: "Revisi",
                cls:
                  "border-amber-400/40 bg-amber-500/15 text-amber-800 hover:bg-amber-500/25 dark:border-amber-500/30 dark:bg-amber-500/12 dark:text-amber-300",
              },
              {
                action: "reject" as const,
                icon: XCircle,
                label: "Tolak",
                cls:
                  "border-red-400/40 bg-red-500/15 text-red-800 hover:bg-red-500/25 dark:border-red-500/30 dark:bg-red-500/12 dark:text-red-300",
              },
            ]).map((btn) => (
              <button
                key={btn.action}
                type="button"
                onClick={() => onVerify(btn.action)}
                disabled={!!isVerifying}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl border py-2.5 backdrop-blur-md",
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
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-3 backdrop-blur-xl dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            Mahasiswa ini sudah terverifikasi dan siap wisuda.
          </p>
        </div>
      )}
    </div>
  );
}

// --- Tab 2: Form Edit ---------------------------------------------------------

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
  const { sesiList, gateList } = usePengaturanStore();
  const [showPassword, setShowPassword] = useState(false);
  const availableProdi = form.fakultas ? (PRODI_MAP[form.fakultas] ?? []) : [];

  return (
    <form id="edit-form" onSubmit={onSubmit}>
      {/* -- 2-column grid layout ----------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

        {/* ════════════════ KOLOM KIRI ════════════════ */}
        <div className="space-y-4">
          <p className={sectionHeading}>Data Pribadi &amp; Akademik</p>

          {/* Nama */}
          <div className="space-y-1.5">
            <label htmlFor="nama" className={fieldLabelCls}>
              Nama Lengkap
            </label>
            <Input
              id="nama"
              value={form.nama}
              onChange={(e) => setField("nama", e.target.value)}
              disabled={isLoading}
              placeholder="Nama lengkap"
              className={inputCls}
            />
          </div>

          {/* NIM */}
          <div className="space-y-1.5">
            <label htmlFor="nim" className={fieldLabelCls}>
              NIM
            </label>
            <Input
              id="nim"
              value={form.nim}
              onChange={(e) => setField("nim", e.target.value)}
              disabled={isLoading}
              placeholder="NIM"
              className={cn(inputCls, "font-mono tracking-wide")}
            />
          </div>

          {/* Angkatan */}
          <div className="space-y-1.5">
            <label htmlFor="angkatan" className={fieldLabelCls}>
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
              className={inputCls}
            />
          </div>

          {/* Fakultas */}
          <div className="space-y-1.5">
            <label htmlFor="fakultas-trigger" className={fieldLabelCls}>
              Fakultas
            </label>
            <Select
              value={form.fakultas}
              onValueChange={(v) => { setField("fakultas", v); setField("prodi", ""); }}
              disabled={isLoading}
            >
              <SelectTrigger
                id="fakultas-trigger"
                className={cn(selectTriggerCls, "h-auto [&>span]:text-slate-900 [&>span[data-placeholder]]:text-slate-400")}
              >
                <SelectValue placeholder="Pilih fakultas…" />
              </SelectTrigger>
              <SelectContent className={selectContentCls}>
                {FAKULTAS_OPTIONS.map((f) => (
                  <SelectItem key={f} value={f} className="cursor-pointer text-sm dark:focus:bg-white/10">{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prodi */}
          <div className="space-y-1.5">
            <label htmlFor="prodi-trigger" className={fieldLabelCls}>
              Program Studi
            </label>
            <Select
              value={form.prodi}
              onValueChange={(v) => setField("prodi", v)}
              disabled={isLoading || !form.fakultas}
            >
              <SelectTrigger
                id="prodi-trigger"
                className={cn(selectTriggerCls, "h-auto [&>span]:text-slate-900 [&>span[data-placeholder]]:text-slate-400", !form.fakultas && "opacity-50")}
              >
                <SelectValue placeholder={form.fakultas ? "Pilih prodi…" : "Pilih fakultas dulu"} />
              </SelectTrigger>
              <SelectContent className={selectContentCls}>
                {availableProdi.map((p) => (
                  <SelectItem key={p} value={p} className="cursor-pointer text-sm dark:focus:bg-white/10">{p}</SelectItem>
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
            <label htmlFor="email" className={fieldLabelCls}>
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              disabled={isLoading}
              placeholder="email@domain.com"
              className={inputCls}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className={fieldLabelCls}>
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
                className={cn(inputCls, "pr-10")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-blue-600 dark:text-white/35 dark:hover:text-blue-400"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-white/35">
              Min. 8 karakter. Kosongkan jika tidak ingin mengubah.
            </p>
          </div>

          {/* Sesi Wisuda */}
          <div className="space-y-1.5">
            <label htmlFor="sesi-trigger" className={fieldLabelCls}>
              Sesi Wisuda
            </label>
            <Select
              value={form.sesiWisuda}
              onValueChange={(v) => setField("sesiWisuda", v)}
              disabled={isLoading}
            >
              <SelectTrigger
                id="sesi-trigger"
                className={cn(selectTriggerCls, "h-auto [&>span]:text-slate-900 [&>span[data-placeholder]]:text-slate-400")}
              >
                <SelectValue placeholder="Pilih sesi…" />
              </SelectTrigger>
              <SelectContent className={selectContentCls}>
                {sesiList.map((s) => (
                  <SelectItem key={s} value={s} className="cursor-pointer text-sm dark:focus:bg-white/10">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gate Wisuda */}
          <div className="space-y-1.5">
            <label htmlFor="gate-trigger" className={fieldLabelCls}>
              Gate Wisuda
            </label>
            <Select
              value={form.gate}
              onValueChange={(v) => setField("gate", v)}
              disabled={isLoading}
            >
              <SelectTrigger
                id="gate-trigger"
                className={cn(selectTriggerCls, "h-auto [&>span]:text-slate-900 [&>span[data-placeholder]]:text-slate-400")}
              >
                <SelectValue placeholder="Pilih gate masuk…" />
              </SelectTrigger>
              <SelectContent className={selectContentCls}>
                {gateList.map((g) => (
                  <SelectItem key={g} value={g} className="cursor-pointer text-sm dark:focus:bg-white/10">
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Verifikasi */}
          <div className="space-y-1.5">
            <label htmlFor="status-trigger" className={fieldLabelCls}>
              Status Verifikasi
            </label>
            <Select value={form.status} onValueChange={(v) => setField("status", v)} disabled={isLoading}>
              <SelectTrigger
                id="status-trigger"
                className={cn(selectTriggerCls, "h-auto [&>span]:text-slate-900")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={selectContentCls}>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="cursor-pointer text-sm font-medium dark:focus:bg-white/10">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Kuota Keluarga */}
          <div className="space-y-1.5">
            <label htmlFor="kuota" className={fieldLabelCls}>
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
              className={inputCls}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-white/35">Maks. 5 orang</p>
          </div>

          {/* Ukuran Toga */}
          <div className="space-y-1.5">
            <label htmlFor="toga-trigger" className={fieldLabelCls}>
              Ukuran Toga
            </label>
            <Select
              value={form.ukuranToga || "BELUM_MEMILIH"}
              onValueChange={(v) => setField("ukuranToga", v === "BELUM_MEMILIH" ? "" : v)}
              disabled={isLoading}
            >
              <SelectTrigger
                id="toga-trigger"
                className={cn(selectTriggerCls, "h-auto [&>span]:text-slate-900 dark:[&>span]:text-white/90")}
              >
                <SelectValue placeholder="Pilih ukuran toga…" />
              </SelectTrigger>
              <SelectContent className={selectContentCls}>
                <SelectItem value="BELUM_MEMILIH" className="cursor-pointer text-sm dark:focus:bg-white/10">
                  Belum Memilih
                </SelectItem>
                {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((size) => (
                  <SelectItem key={size} value={size} className="cursor-pointer text-sm dark:focus:bg-white/10">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-7 flex gap-3 border-t border-white/60 pt-5 dark:border-white/[0.08]">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className={cn(
            glassBtnGhost,
            "h-10 flex-1 justify-center text-sm disabled:opacity-40 disabled:cursor-not-allowed",
          )}
        >
          Batal
        </button>
        <button
          type="submit"
          form="edit-form"
          disabled={isLoading}
          className={cn(
            glassBtnPrimary,
            "h-10 flex-1 justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Menyimpan…
            </>
          ) : (
            <>
              <Save className="size-4" />
              Simpan Perubahan
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// --- Main Component -----------------------------------------------------------

export function EditModal({ student, open, onClose, onSuccess, onUpdated }: EditModalProps) {
  const { update, verify } = useWisudawan();
  const fetchSettings = usePengaturanStore((state) => state.fetchSettings);
  const [isLoading,   setIsLoading]   = useState(false);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [activeTab,   setActiveTab]   = useState("detail");
  const [detailedStudent, setDetailedStudent] = useState<WisudawanRow | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const [form, setFormState] = useState<EditFormData>({
    nama: "", nim: "", email: "", password: "",
    fakultas: "", prodi: "", angkatan: CURRENT_YEAR,
    status: "AKTIF", sesiWisuda: "", gate: "", kuotaTamu: 2,
    ukuranToga: "",
  });

  useEffect(() => {
    if (student) {
      setDetailedStudent(student);
      
      api.get(`/api/wisudawan/${student.id}`)
        .then((res) => {
          if (res.data?.success) {
            setDetailedStudent(res.data.data);
            setFormState((prev) => ({
              ...prev,
              gate: res.data.data.gate ?? prev.gate,
              ukuranToga: res.data.data.ukuranToga ?? prev.ukuranToga,
            }));
          }
        })
        .catch((err) => {
          console.error("Gagal memuat detail wisudawan:", err);
        });

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
        gate:       student.gate ?? "",
        kuotaTamu:  2,
        ukuranToga: student.ukuranToga ?? "",
      });
      setActiveTab("detail");
    } else {
      setDetailedStudent(null);
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
        gate:       form.gate || null,
        ukuranToga: form.ukuranToga || null,
      };
      if (form.password.trim()) payload.password = form.password;

      const updated = await update(student.id, payload);
      // Kirim data terbaru ke parent agar editTarget langsung diperbarui
      onUpdated?.(updated);
      onSuccess?.();
      // Pindah ke tab detail agar perubahan langsung terlihat
      setActiveTab("detail");
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
          "w-[95vw] gap-0 rounded-3xl p-0 sm:max-w-3xl md:max-w-4xl",
          "max-h-[90vh] overflow-y-auto",
          "border border-white/90 bg-gradient-to-br from-white/92 via-white/78 to-white/65",
          "text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl",
          "ring-1 ring-slate-900/[0.04]",
          "dark:border-white/15 dark:from-white/[0.12] dark:via-white/[0.08] dark:to-white/[0.04]",
          "dark:text-white dark:shadow-[0_24px_80px_rgba(0,0,0,0.55)] dark:ring-white/10",
        )}
      >
        <DialogHeader className="border-b border-white/60 bg-white/40 px-6 pb-4 pt-5 backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.03]">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl",
              "text-[13px] font-black",
              "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
              "shadow-[0_4px_12px_rgba(59,130,246,0.35)]",
            )}>
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <DialogTitle className="truncate text-base font-black leading-tight text-slate-900 dark:text-white">
                {student?.nama ?? "-"}
              </DialogTitle>
              <div className="mt-1 flex items-center gap-2">
                <DialogDescription className="font-mono text-[11px] tracking-wide text-slate-500 dark:text-white/40">
                  {student?.nim ?? "-"}
                </DialogDescription>
                {student && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wide backdrop-blur-md",
                      sc.badge,
                    )}
                  >
                    <span className={cn("size-1.5 rounded-full", sc.dot)} />
                    {sc.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* -- Tabs — pill style, full width ------------------------ */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
          <div className="flex justify-center border-b border-white/60 bg-white/30 px-6 py-3 backdrop-blur-md dark:border-white/[0.08] dark:bg-white/[0.02]">
            <TabsList
              className={cn(
                "h-10 w-full max-w-sm gap-1 rounded-full border p-1",
                "border-white/80 bg-white/50 backdrop-blur-xl",
                "dark:border-white/10 dark:bg-white/[0.06]",
              )}
            >
              <TabsTrigger
                value="detail"
                className={cn(
                  "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-[12px] font-semibold transition-all",
                  "text-slate-500 dark:text-white/40",
                  "data-[state=active]:border data-[state=active]:border-white/90 data-[state=active]:bg-white/80",
                  "data-[state=active]:text-blue-700 data-[state=active]:shadow-[0_2px_12px_rgba(59,130,246,0.12)]",
                  "dark:data-[state=active]:border-white/15 dark:data-[state=active]:bg-white/12 dark:data-[state=active]:text-blue-300",
                )}
              >
                <ShieldCheck className="size-3" />
                Detail &amp; Status
              </TabsTrigger>
              <TabsTrigger
                value="edit"
                className={cn(
                  "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-[12px] font-semibold transition-all",
                  "text-slate-500 dark:text-white/40",
                  "data-[state=active]:border data-[state=active]:border-white/90 data-[state=active]:bg-white/80",
                  "data-[state=active]:text-blue-700 data-[state=active]:shadow-[0_2px_12px_rgba(59,130,246,0.12)]",
                  "dark:data-[state=active]:border-white/15 dark:data-[state=active]:bg-white/12 dark:data-[state=active]:text-blue-300",
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
                student={detailedStudent ?? student}
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
