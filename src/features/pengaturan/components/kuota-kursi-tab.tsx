"use client";

import React, { useState, useEffect } from "react";
import { Armchair, Users, Loader2, Save, Calculator, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  pengaturanInput,
  pengaturanHeading,
  pengaturanSubheading,
  pengaturanLabel,
  pengaturanBtnPrimary,
} from "../pengaturan-ui";

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

const BLOK_LIST: BlokInfo[] = [
  {
    key: "kuning",
    label: "Blok Kuning",
    color: "text-amber-700 dark:text-amber-400",
    border: "border-amber-300/80 dark:border-amber-500/25",
    bg: "bg-amber-50 dark:bg-amber-500/[0.06]",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  {
    key: "biru",
    label: "Blok Biru",
    color: "text-cyan-700 dark:text-cyan-400",
    border: "border-cyan-300/80 dark:border-cyan-500/25",
    bg: "bg-cyan-50 dark:bg-cyan-500/[0.06]",
    dot: "bg-cyan-500 dark:bg-cyan-400",
  },
  {
    key: "ungu",
    label: "Blok Ungu",
    color: "text-fuchsia-700 dark:text-fuchsia-400",
    border: "border-fuchsia-300/80 dark:border-fuchsia-500/25",
    bg: "bg-fuchsia-50 dark:bg-fuchsia-500/[0.06]",
    dot: "bg-fuchsia-500 dark:bg-fuchsia-400",
  },
  {
    key: "hijau",
    label: "Blok Hijau",
    color: "text-lime-700 dark:text-lime-400",
    border: "border-lime-300/80 dark:border-lime-500/25",
    bg: "bg-lime-50 dark:bg-lime-500/[0.06]",
    dot: "bg-lime-500 dark:bg-lime-400",
  },
];

const DEFAULT_CONFIG: BlokConfig = {
  kuning: "39",
  biru: "52",
  ungu: "52",
  hijau: "39",
  kuotaPendamping: "2",
};

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("wisuda-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

export function KuotaKursiTab() {
  const [form, setForm] = useState<BlokConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

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
      // default
    } finally {
      setIsFetching(false);
    }
  }

  function handleChange(key: keyof BlokConfig, value: string) {
    if (value !== "" && !/^\d+$/.test(value)) return;
    setForm((f) => ({ ...f, [key]: value }));
  }

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

      localStorage.setItem("wisuda_blok_kursi", JSON.stringify(payload));
      toast.success("Konfigurasi blok kursi berhasil disimpan");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan konfigurasi");
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-5 animate-spin text-slate-400 dark:text-white/30" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className={cn(pengaturanHeading)}>
            <Armchair className="size-4.5 text-blue-600 dark:text-blue-400" />
            Kapasitas Kursi & Kuota Tamu
          </h2>
          <p className={pengaturanSubheading}>
            Atur kapasitas per blok auditorium dan batas maksimum tamu pendamping
          </p>
        </div>
        <button
          type="button"
          onClick={fetchConfig}
          className="flex size-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-white/25 dark:hover:bg-white/[0.06] dark:hover:text-white/50"
          title="Refresh"
        >
          <RefreshCw className="size-3.5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className={cn(pengaturanLabel, "mb-3 flex items-center gap-1.5")}>
            <Armchair className="size-3" />
            Kapasitas Per Blok
          </p>
          <div className="grid grid-cols-2 gap-3">
            {BLOK_LIST.map((blok) => (
              <div
                key={blok.key}
                className={cn("space-y-2 rounded-2xl border p-3.5", blok.border, blok.bg)}
              >
                <label
                  className={cn(
                    "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider",
                    blok.color,
                  )}
                >
                  <span className={cn("size-2 rounded-full", blok.dot)} />
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
                  className={pengaturanInput}
                />
                <p className="text-[10px] text-slate-500 dark:text-white/25">
                  {parseInt(form[blok.key]) || 0} kursi
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200/80 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/[0.05]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="size-4 text-blue-600 dark:text-blue-400/60" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400/70">
                  Total Kapasitas Kursi
                </p>
                <p className="mt-0.5 text-[10px] text-slate-600 dark:text-white/25">
                  Dihitung otomatis dari jumlah semua blok
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black tabular-nums text-blue-700 dark:text-blue-400">
                {totalKapasitas}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-white/25">kursi total</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {BLOK_LIST.map((blok) => (
              <div key={blok.key} className="flex items-center gap-1">
                <span className={cn("size-1.5 rounded-full", blok.dot)} />
                <span className="text-[10px] text-slate-600 dark:text-white/30">
                  {blok.label.replace("Blok ", "")}:{" "}
                  <span className="font-bold text-slate-800 dark:text-white/50">
                    {parseInt(form[blok.key]) || 0}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={cn(pengaturanLabel, "flex items-center gap-1.5")}>
            <Users className="size-3.5 text-slate-400 dark:text-white/30" />
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
            className={pengaturanInput}
          />
          <p className="text-[10px] text-slate-500 dark:text-white/25">
            Jumlah tamu pendamping default per undangan
          </p>
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
                Simpan Konfigurasi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
