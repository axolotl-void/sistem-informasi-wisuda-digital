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
  kuotaTamu: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

// Input field — bersih, putih, kontras tinggi
const inputCls = cn(
  "w-full px-4 py-2.5 rounded-xl transition-all duration-200",
  "bg-white",
  "border border-slate-200",
  "text-slate-900",
  "placeholder:text-slate-400",
  "outline-none ring-offset-0",
  "focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
  "disabled:opacity-50 disabled:cursor-not-allowed",
);

const selectTriggerCls = cn(
  "w-full px-4 py-2.5 rounded-xl transition-all duration-200",
  "bg-white",
  "border border-slate-200",
  "text-slate-900",
  "outline-none ring-offset-0",
  "focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
);

// Section heading
const sectionHeading = "text-[10px] font-black uppercase tracking-[0.16em] text-blue-600 mb-3";

// Field label
function FL({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Label className="text-sm font-semibold mb-1.5 block text-slate-700 flex items-center gap-1.5">
      <Icon className="size-3 shrink-0 text-blue-500/70" />
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
        sc.bgLight, sc.borderLight,
      )}>
        <div className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          "bg-white border", sc.borderLight,
        )}>
          <ShieldCheck className={cn("size-5", sc.textLight)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">
            Status Verifikasi
          </p>
          <div className="flex items-center gap-2">
            <span className={cn("size-2 rounded-full shrink-0", sc.dot)} />
            <span className={cn("text-sm font-bold", sc.textLight)}>{sc.label}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">
            Kehadiran
          </p>
          <span className={cn(
            "text-sm font-bold",
            student.kehadiranStatus ? "text-emerald-600" : "text-slate-400",
          )}>
            {student.kehadiranStatus ?? "Belum Hadir"}
          </span>
        </div>
      </div>

      {/* ── Sesi Wisuda Banner (jika ada) ────────────────────────── */}
      {student.sesiWisuda && (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 border border-blue-200">
            <GraduationCap className="size-4 text-blue-600" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
              Sesi Wisuda
            </p>
            <p className="text-sm font-bold text-blue-700">{student.sesiWisuda}</p>
          </div>
        </div>
      )}

      {/* ── Data Grid 2 kolom ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Nama */}
        <div className="md:col-span-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Nama Lengkap</p>
          <p className="text-sm font-semibold text-slate-800">{student.nama}</p>
        </div>
        {/* NIM */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">NIM</p>
          <p className="text-sm font-semibold font-mono text-slate-800">{student.nim}</p>
        </div>
        {/* Angkatan */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Angkatan</p>
          <p className="text-sm font-semibold text-slate-800">{student.angkatan}</p>
        </div>
        {/* Email */}
        <div className="md:col-span-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Email</p>
          <p className="text-sm font-semibold text-slate-800 break-all">{student.email}</p>
        </div>
        {/* Fakultas */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Fakultas</p>
          <p className="text-sm font-semibold text-slate-800">{student.fakultas}</p>
        </div>
        {/* Prodi */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Program Studi</p>
          <p className="text-sm font-semibold text-slate-800">{student.prodi}</p>
        </div>
        {/* Undangan */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Kode Undangan</p>
          <p className="text-sm font-semibold font-mono text-slate-800">
            {student.hasUndangan ? (student.undanganKode ?? "Ada") : "Belum Generate"}
          </p>
        </div>
        {/* Status Undangan */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Status Undangan</p>
          <p className="text-sm font-semibold text-slate-800">{student.undanganStatus ?? "—"}</p>
        </div>
        {/* Sesi Wisuda */}
        <div className="md:col-span-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Sesi Wisuda</p>
          {student.sesiWisuda ? (
            <div className="flex items-center gap-2">
              <GraduationCap className="size-3.5 text-blue-500 shrink-0" />
              <p className="text-sm font-semibold text-slate-800">{student.sesiWisuda}</p>
            </div>
          ) : (
            <p className="text-sm font-semibold text-slate-400">Belum Ditentukan</p>
          )}
        </div>
      </div>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div className="h-px bg-slate-100" />

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
                cls: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
              },
              {
                action: "revision" as const,
                icon: RotateCcw,
                label: "Revisi",
                cls: "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100",
              },
              {
                action: "reject" as const,
                icon: XCircle,
                label: "Tolak",
                cls: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
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
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-emerald-700">
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
            <label htmlFor="nama" className="text-sm font-semibold mb-1.5 block text-slate-700">
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
            <label htmlFor="nim" className="text-sm font-semibold block text-slate-700">
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
            <label htmlFor="angkatan" className="text-sm font-semibold block text-slate-700">
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
            <label htmlFor="fakultas-trigger" className="text-sm font-semibold block text-slate-700">
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
              <SelectContent>
                {FAKULTAS_OPTIONS.map((f) => (
                  <SelectItem key={f} value={f} className="cursor-pointer text-sm">{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prodi */}
          <div className="space-y-1.5">
            <label htmlFor="prodi-trigger" className="text-sm font-semibold block text-slate-700">
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
            <label htmlFor="email" className="text-sm font-semibold block text-slate-700">
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
            <label htmlFor="password" className="text-sm font-semibold block text-slate-700">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Min. 8 karakter. Kosongkan jika tidak ingin mengubah.
            </p>
          </div>

          {/* Sesi Wisuda */}
          <div className="space-y-1.5">
            <label htmlFor="sesi-trigger" className="text-sm font-semibold block text-slate-700">
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
              <SelectContent>
                {SESI_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="cursor-pointer text-sm">{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Verifikasi */}
          <div className="space-y-1.5">
            <label htmlFor="status-trigger" className="text-sm font-semibold block text-slate-700">
              Status Verifikasi
            </label>
            <Select value={form.status} onValueChange={(v) => setField("status", v)} disabled={isLoading}>
              <SelectTrigger
                id="status-trigger"
                className={cn(selectTriggerCls, "h-auto [&>span]:text-slate-900")}
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
            <label htmlFor="kuota" className="text-sm font-semibold block text-slate-700">
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
            <p className="text-xs text-slate-500 mt-1">Maks. 5 orang</p>
          </div>
        </div>
      </div>

      {/* ── Footer Buttons ───────────────────────────────────────── */}
      <div className="flex gap-3 mt-7 pt-5 border-t border-slate-100">
        {/* Batal */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className={cn(
            "flex-1 h-10 rounded-xl border text-sm font-semibold",
            "bg-white border-slate-200 text-slate-700",
            "hover:bg-slate-50",
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
            "bg-gradient-to-r from-blue-500 to-indigo-600",
            "text-white",
            "shadow-[0_4px_14px_rgba(59,130,246,0.35)]",
            "hover:from-blue-600 hover:to-indigo-700",
            "hover:shadow-[0_4px_20px_rgba(59,130,246,0.5)]",
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

export function EditModal({ student, open, onClose, onSuccess, onUpdated }: EditModalProps) {
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
          // ── Size ──────────────────────────────────────────────────
          "w-[95vw] sm:max-w-3xl md:max-w-4xl",
          "max-h-[90vh] overflow-y-auto",
          "p-0 gap-0",
          "rounded-2xl",
          // ── Selalu putih/terang — tidak ikut dark mode ────────────
          "bg-white",
          "border border-slate-200",
          "shadow-[0_20px_60px_rgba(0,0,0,0.15),0_4px_16px_rgba(0,0,0,0.08)]",
          "text-slate-900",
        )}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/80">
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
              <DialogTitle className="text-base font-black text-slate-900 leading-tight truncate">
                {student?.nama ?? "—"}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <DialogDescription className="text-[11px] text-slate-500 font-mono tracking-wide">
                  {student?.nim ?? "—"}
                </DialogDescription>
                {student && (
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5",
                    "text-[9px] font-black tracking-wide",
                    sc.bgLight,
                    sc.borderLight,
                    sc.textLight,
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
          <div className="flex justify-center px-6 py-3 border-b border-slate-100 bg-white">
            <TabsList className={cn(
              "h-9 rounded-full p-1 gap-1 w-full max-w-sm",
              "bg-slate-100",
              "border border-slate-200",
            )}>
              <TabsTrigger
                value="detail"
                className={cn(
                  "flex-1 h-7 rounded-full text-[12px] font-semibold gap-1.5",
                  "transition-all duration-200",
                  "text-slate-500",
                  "data-[state=active]:bg-white data-[state=active]:text-blue-600",
                  "data-[state=active]:shadow-sm",
                )}
              >
                <ShieldCheck className="size-3" />
                Detail &amp; Status
              </TabsTrigger>
              <TabsTrigger
                value="edit"
                className={cn(
                  "flex-1 h-7 rounded-full text-[12px] font-semibold gap-1.5",
                  "transition-all duration-200",
                  "text-slate-500",
                  "data-[state=active]:bg-white data-[state=active]:text-blue-600",
                  "data-[state=active]:shadow-sm",
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
