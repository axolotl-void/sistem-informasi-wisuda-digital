"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Trash2, Lock, AlertTriangle,
  UserCheck, Phone, Loader2, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PROFILE_COMPLETE = true; // Ganti ke false untuk test locked state
const KUOTA_TAMU = 3;

interface Tamu {
  id: string;
  nama: string;
  hubungan: string;
  noHp: string;
}

const MOCK_TAMU_AWAL: Tamu[] = [
  { id: "1", nama: "Siti Rahayu", hubungan: "Ibu", noHp: "081234567890" },
];

const HUBUNGAN_OPTIONS = ["Ayah", "Ibu", "Kakak", "Adik", "Suami/Istri", "Lainnya"];

// ─── Components ───────────────────────────────────────────────────────────────

function LockedState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] py-12 px-6 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 mb-4">
        <Lock className="size-6 text-amber-400" />
      </div>
      <h3 className="text-sm font-bold text-white/70 mb-1">Profil Belum Lengkap</h3>
      <p className="text-xs text-white/35 leading-relaxed max-w-xs">
        Lengkapi profil Anda terlebih dahulu sebelum mendaftarkan tamu pendamping.
      </p>
      <a
        href="/portal"
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/15 transition-colors"
      >
        <AlertTriangle className="size-3.5" />
        Lengkapi Profil
      </a>
    </motion.div>
  );
}

function KuotaBar({ used, max }: { used: number; max: number }) {
  const pct = Math.round((used / max) * 100);
  const color = used >= max ? "from-red-500 to-rose-500" : used >= max - 1 ? "from-amber-500 to-yellow-400" : "from-blue-500 to-indigo-500";
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-white/30" />
          <span className="text-xs font-semibold text-white/50">Kuota Tamu</span>
        </div>
        <span className={`text-xs font-bold ${used >= max ? "text-red-400" : "text-white/70"}`}>
          {used} / {max} orang
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
      {used >= max && (
        <p className="text-[0.68rem] text-red-400/80 flex items-center gap-1">
          <AlertTriangle className="size-3" />
          Kuota tamu sudah penuh
        </p>
      )}
    </div>
  );
}

function TamuCard({
  tamu, index, onDelete,
}: {
  tamu: Tamu;
  index: number;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 600));
    onDelete(tamu.id);
    toast.success(`${tamu.nama} dihapus dari daftar tamu`);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/20">
        <span className="text-sm font-bold text-indigo-300">
          {tamu.nama.split(" ").map((n) => n[0]).join("").slice(0, 2)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/80 truncate">{tamu.nama}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[0.65rem] font-medium text-indigo-400/70 bg-indigo-500/10 border border-indigo-500/15 rounded-md px-1.5 py-0.5">
            {tamu.hubungan}
          </span>
          {tamu.noHp && (
            <span className="text-[0.65rem] text-white/25 truncate">{tamu.noHp}</span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="flex size-8 shrink-0 items-center justify-center rounded-xl text-white/20 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40"
      >
        {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
      </button>
    </motion.div>
  );
}

// ─── Add Tamu Form ────────────────────────────────────────────────────────────

function AddTamuForm({ onAdd }: { onAdd: (t: Tamu) => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nama: "", hubungan: "Ibu", noHp: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama.trim()) { toast.error("Nama tamu wajib diisi"); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    onAdd({ id: Date.now().toString(), ...form });
    setForm({ nama: "", hubungan: "Ibu", noHp: "" });
    setSaving(false);
    setOpen(false);
    toast.success("Tamu berhasil ditambahkan");
  }

  const inputCls = "w-full h-12 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-white/80 placeholder-white/20 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.02] py-4 text-sm font-semibold text-white/30 hover:border-blue-500/30 hover:bg-blue-500/[0.04] hover:text-blue-400 transition-all"
      >
        <Plus className="size-4" />
        Tambah Tamu
      </button>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-4 space-y-3"
    >
      <p className="text-[0.72rem] font-bold uppercase tracking-wider text-blue-400/60">Tambah Tamu Baru</p>

      <input
        type="text"
        value={form.nama}
        onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
        placeholder="Nama lengkap tamu"
        className={inputCls}
        autoFocus
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          value={form.hubungan}
          onChange={(e) => setForm((f) => ({ ...f, hubungan: e.target.value }))}
          className={inputCls + " cursor-pointer"}
        >
          {HUBUNGAN_OPTIONS.map((h) => (
            <option key={h} value={h} className="bg-[#0F172A]">{h}</option>
          ))}
        </select>
        <input
          type="tel"
          value={form.noHp}
          onChange={(e) => setForm((f) => ({ ...f, noHp: e.target.value }))}
          placeholder="No. HP (opsional)"
          className={inputCls}
        />
      </div>

      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 h-11 rounded-2xl border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-white/40 hover:bg-white/[0.07] transition-all"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 h-11 rounded-2xl border border-blue-500/30 bg-blue-500/15 text-sm font-bold text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? <><Loader2 className="size-4 animate-spin" /> Menyimpan...</> : <><UserCheck className="size-4" /> Tambahkan</>}
        </button>
      </div>
    </motion.form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TamuPage() {
  const [tamuList, setTamuList] = useState<Tamu[]>(MOCK_TAMU_AWAL);
  const isLocked = !MOCK_PROFILE_COMPLETE;
  const kuotaSisa = KUOTA_TAMU - tamuList.length;

  function handleAdd(t: Tamu) {
    setTamuList((prev) => [...prev, t]);
  }

  function handleDelete(id: string) {
    setTamuList((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
          <Users className="size-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white/90">Pengajuan Tamu</h1>
          <p className="text-xs text-white/30">Daftarkan keluarga / pendamping Anda</p>
        </div>
      </div>

      {isLocked ? (
        <LockedState />
      ) : (
        <>
          {/* Kuota bar */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <KuotaBar used={tamuList.length} max={KUOTA_TAMU} />
          </motion.div>

          {/* Daftar tamu */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2.5"
          >
            {tamuList.length > 0 && (
              <p className="text-[0.72rem] font-bold uppercase tracking-wider text-white/25 px-1">
                Tamu Terdaftar ({tamuList.length})
              </p>
            )}

            <AnimatePresence mode="popLayout">
              {tamuList.map((t, i) => (
                <TamuCard key={t.id} tamu={t} index={i} onDelete={handleDelete} />
              ))}
            </AnimatePresence>

            {tamuList.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-8 text-center"
              >
                <Users className="size-8 text-white/10 mb-2" />
                <p className="text-sm text-white/25">Belum ada tamu terdaftar</p>
              </motion.div>
            )}
          </motion.div>

          {/* Add form */}
          {kuotaSisa > 0 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <AddTamuForm onAdd={handleAdd} />
            </motion.div>
          )}

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-2.5 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3.5"
          >
            <CheckCircle2 className="size-4 text-white/20 shrink-0 mt-0.5" />
            <p className="text-[0.7rem] text-white/25 leading-relaxed">
              Tamu yang terdaftar akan mendapatkan akses masuk ke venue wisuda bersama Anda.
              Pastikan data yang dimasukkan sudah benar.
            </p>
          </motion.div>
        </>
      )}
    </div>
  );
}
