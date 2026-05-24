"use client";

import React, { useState, useEffect } from "react";
import { Armchair, Users, Loader2, Save, Calculator, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// --- Types --------------------------------------------------------------------

interface BlokConfig {
  kuning: string;
  biru: string;
  ungu: string;
  hijau: string;
  kuotaPendamping: string;
}

interface BlokInfo {
  key: keyof Omit<BlokConfig, "kuotaPendamping">;
  label: string;
  color: string;
  border: string;
  bg: string;
  dot: string;
}

// --- Constants ----------------------------------------------------------------

const BLOK_LIST: BlokInfo[] = [
  {
    key: "kuning",
    label: "Blok Kuning",
    color: "text-amber-400",
    border: "border-amber-500/25",
    bg: "bg-amber-500/[0.06]",
    dot: "bg-amber-400",
  },
  {
    key: "biru",
    label: "Blok Biru",
    color: "text-cyan-400",
    border: "border-cyan-500/25",
    bg: "bg-cyan-500/[0.06]",
    dot: "bg-cyan-400",
  },
  {
    key: "ungu",
    label: "Blok Ungu",
    color: "text-fuchsia-400",
    border: "border-fuchsia-500/25",
    bg: "bg-fuchsia-500/[0.06]",
    dot: "bg-fuchsia-400",
  },
  {
    key: "hijau",
    label: "Blok Hijau",
    color: "text-lime-400",
    border: "border-lime-500/25",
    bg: "bg-lime-500/[0.06]",
    dot: "bg-lime-400",
  },
];

const DEFAULT_CONFIG: BlokConfig = {
  kuning: "39",
  biru: "52",
  ungu: "52",
  hijau: "39",
  kuotaPendamping: "2",
};

// --- Helpers ------------------------------------------------------------------

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("wisuda-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    return parsed?.state?.token ?? null;
  } catch { return null; }
}

// --- Component ----------------------------------------------------------------

export function KuotaKursiTab() {
  const [form, setForm] = useState<BlokConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Total kapasitas = jumlah semua blok (read-only)
  const totalKapasitas =
    (parseInt(form.kuning) || 0) +
    (parseInt(form.biru) || 0) +
    (parseInt(form.ungu) || 0) +
    (parseInt(form.hijau) || 0);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setIsFetching(true);
    try {
      const token = getToken();
      const res = await fetch("/api/pengaturan/blok-kursi", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      const result = await res.json();
      if (result.data) {
        setForm({
          kuning: String(result.data.kuning),
          biru: String(result.data.biru),
          ungu: String(result.data.ungu),
          hijau: String(result.data.hijau),
          kuotaPendamping: String(result.data.kuotaPendamping),
        });
      }
    } catch {
      // Gunakan default jika gagal
    } finally {
      setIsFetching(false);
    }
  }

  // Handle input — gunakan string agar bisa hapus angka 0
  function handleChange(key: keyof BlokConfig, value: string) {
    // Hanya izinkan angka
    if (value !== "" && !/^\d+$/.test(value)) return;
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Saat blur, pastikan tidak kosong
  function handleBlur(key: keyof BlokConfig) {
    setForm((f) => ({
      ...f,
      [key]: f[key] === "" ? "0" : f[key],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      kuning: parseInt(form.kuning) || 0,
      biru: parseInt(form.biru) || 0,
      ungu: parseInt(form.ungu) || 0,
      hijau: parseInt(form.hijau) || 0,
      kuotaPendamping: parseInt(form.kuotaPendamping) || 0,
    };

    if (totalKapasitas === 0) {
      toast.error("Total kapasitas tidak boleh 0");
      return;
    }

    setIsLoading(true);
    try {
      const token = getToken();
      const res = await fetch("/api/pengaturan/blok-kursi", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal menyimpan");

      // Simpan juga ke localStorage agar seat monitor bisa baca tanpa auth
      localStorage.setItem("wisuda_blok_kursi", JSON.stringify(payload));

      toast.success("Konfigurasi blok kursi berhasil disimpan");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan konfigurasi");
    } finally {
      setIsLoading(false);
    }
  }

  const inputCls = (hasError = false) =>
    `h-10 w-full rounded-xl border px-3.5 text-sm font-semibold text-white/80 placeholder-white/15 outline-none transition-all duration-200 bg-[#07111F]/40 ${
      hasError
        ? "border-rose-500/50 focus:border-rose-500"
        : "border-white/[0.08] hover:border-white/[0.15] focus:border-blue-500/50 focus:bg-white/[0.04] focus:ring-2 focus:ring-blue-500/10"
    }`;

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-5 text-white/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-white/90 flex items-center gap-2">
            <Armchair className="size-4.5 text-blue-400" />
            Kapasitas Kursi & Kuota Tamu
          </h2>
          <p className="text-xs text-white/30 mt-0.5">
            Atur kapasitas per blok auditorium dan batas maksimum tamu pendamping
          </p>
        </div>
        <button
          type="button"
          onClick={fetchConfig}
          className="flex size-8 items-center justify-center rounded-xl text-white/25 hover:bg-white/[0.06] hover:text-white/50 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="size-3.5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Kapasitas per blok */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/35 mb-3 flex items-center gap-1.5">
            <Armchair className="size-3" />
            Kapasitas Per Blok
          </p>
          <div className="grid grid-cols-2 gap-3">
            {BLOK_LIST.map((blok) => (
              <div
                key={blok.key}
                className={`rounded-2xl border ${blok.border} ${blok.bg} p-3.5 space-y-2`}
              >
                <label className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${blok.color}`}>
                  <span className={`size-2 rounded-full ${blok.dot}`} />
                  {blok.label}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form[blok.key]}
                  onChange={(e) => handleChange(blok.key, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onBlur={() => handleBlur(blok.key)}
                  disabled={isLoading}
                  placeholder="0"
                  className={inputCls()}
                />
                <p className="text-[10px] text-white/25">
                  {parseInt(form[blok.key]) || 0} kursi
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Total kapasitas — read only */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.05] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="size-4 text-blue-400/60" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-400/70">
                  Total Kapasitas Kursi
                </p>
                <p className="text-[10px] text-white/25 mt-0.5">
                  Dihitung otomatis dari jumlah semua blok
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-blue-400 tabular-nums">{totalKapasitas}</p>
              <p className="text-[10px] text-white/25">kursi total</p>
            </div>
          </div>
          {/* Mini breakdown */}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {BLOK_LIST.map((blok) => (
              <div key={blok.key} className="flex items-center gap-1">
                <span className={`size-1.5 rounded-full ${blok.dot}`} />
                <span className="text-[10px] text-white/30">
                  {blok.label.replace("Blok ", "")}: <span className="font-bold text-white/50">{parseInt(form[blok.key]) || 0}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Kuota pendamping */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
            <Users className="size-3.5 text-white/30" />
            Default Kuota Pendamping
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={form.kuotaPendamping}
            onChange={(e) => handleChange("kuotaPendamping", e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={() => handleBlur("kuotaPendamping")}
            disabled={isLoading}
            placeholder="0"
            className={inputCls()}
          />
          <p className="text-[10px] text-white/25">
            Jumlah tamu pendamping default per undangan
          </p>
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-500/25 bg-blue-500/[0.08] px-5 text-xs font-bold text-blue-400 transition-all duration-150 hover:border-blue-500/40 hover:bg-blue-500/[0.15] hover:text-blue-300 active:scale-[0.97] disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(59,130,246,0.15)]"
          >
            {isLoading ? (
              <><Loader2 className="size-3.5 animate-spin" /> Menyimpan...</>
            ) : (
              <><Save className="size-3.5" /> Simpan Konfigurasi</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
