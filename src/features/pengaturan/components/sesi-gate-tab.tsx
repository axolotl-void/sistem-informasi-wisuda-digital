"use client";

import React, { useState } from "react";
import { usePengaturanStore } from "@/store/pengaturan.store";
import { Clock, DoorOpen, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function SesiTab() {
  const { sesiList, addSesi, deleteSesi, isLoading } = usePengaturanStore();
  const [newSesi, setNewSesi] = useState("");

  const handleAddSesi = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = newSesi.trim();
    if (!val) {
      toast.error("Nama sesi tidak boleh kosong");
      return;
    }
    try {
      await addSesi(val);
      setNewSesi("");
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan sesi");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white/90 flex items-center gap-2">
          <Clock className="size-4.5 text-emerald-400" />
          Manajemen Sesi
        </h2>
        <p className="text-xs text-white/30 mt-0.5">
          Atur daftar pembagian sesi upacara wisuda yang aktif
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-bold text-white/70 flex items-center gap-2">
          <Clock className="size-4 text-emerald-400/80" />
          Daftar Sesi Wisuda
        </h3>

        {/* Form Tambah Sesi */}
        <form onSubmit={handleAddSesi} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Sesi Pagi, Sesi Khusus"
            value={newSesi}
            onChange={(e) => setNewSesi(e.target.value)}
            disabled={isLoading}
            className="h-10 flex-1 rounded-xl border border-white/[0.08] bg-[#07111F]/40 px-3.5 text-xs text-white/80 placeholder-white/15 outline-none transition-all hover:border-white/[0.15] focus:border-emerald-500/50 focus:bg-white/[0.04] focus:ring-4 focus:ring-emerald-500/5"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-10 w-12 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-400 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/[0.15] hover:text-emerald-300 active:scale-[0.96] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-5" />}
          </button>
        </form>

        {/* List Sesi */}
        <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto pr-1">
          {sesiList.length === 0 ? (
            <p className="text-[11px] text-white/20 py-6 text-center">Belum ada sesi dikonfigurasi</p>
          ) : (
            sesiList.map((sesi) => (
              <div key={sesi} className="flex items-center justify-between py-3">
                <span className="text-xs font-semibold text-white/70">{sesi}</span>
                <button
                  type="button"
                  onClick={() => deleteSesi(sesi)}
                  disabled={isLoading}
                  className="flex size-8 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.02] text-white/30 hover:border-rose-500/20 hover:bg-rose-500/[0.08] hover:text-rose-400 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function GateTab() {
  const { gateList, addGate, deleteGate, isLoading } = usePengaturanStore();
  const [newGate, setNewGate] = useState("");

  const handleAddGate = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = newGate.trim();
    if (!val) {
      toast.error("Nama gate tidak boleh kosong");
      return;
    }
    try {
      await addGate(val);
      setNewGate("");
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan gate");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white/90 flex items-center gap-2">
          <DoorOpen className="size-4.5 text-blue-400" />
          Manajemen Gate
        </h2>
        <p className="text-xs text-white/30 mt-0.5">
          Atur daftar gerbang pemindai kode yang aktif untuk verifikasi kehadiran
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-bold text-white/70 flex items-center gap-2">
          <DoorOpen className="size-4 text-blue-400/80" />
          Daftar Pintu (Gate) Scanner
        </h3>

        {/* Form Tambah Gate */}
        <form onSubmit={handleAddGate} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Gate VIP, Gate Utara"
            value={newGate}
            onChange={(e) => setNewGate(e.target.value)}
            disabled={isLoading}
            className="h-10 flex-1 rounded-xl border border-white/[0.08] bg-[#07111F]/40 px-3.5 text-xs text-white/80 placeholder-white/15 outline-none transition-all hover:border-white/[0.15] focus:border-blue-500/50 focus:bg-white/[0.04] focus:ring-4 focus:ring-blue-500/5"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-10 w-12 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/[0.08] text-blue-400 transition-all hover:border-blue-500/40 hover:bg-blue-500/[0.15] hover:text-blue-300 active:scale-[0.96] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-5" />}
          </button>
        </form>

        {/* List Gate */}
        <div className="divide-y divide-white/[0.04] max-h-80 overflow-y-auto pr-1">
          {gateList.length === 0 ? (
            <p className="text-[11px] text-white/20 py-6 text-center">Belum ada gate dikonfigurasi</p>
          ) : (
            gateList.map((gate) => (
              <div key={gate} className="flex items-center justify-between py-3">
                <span className="text-xs font-semibold text-white/70">{gate}</span>
                <button
                  type="button"
                  onClick={() => deleteGate(gate)}
                  disabled={isLoading}
                  className="flex size-8 items-center justify-center rounded-lg border border-white/[0.04] bg-white/[0.02] text-white/30 hover:border-rose-500/20 hover:bg-rose-500/[0.08] hover:text-rose-400 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Kept for backward compatibility
export function SesiGateTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SesiTab />
      <GateTab />
    </div>
  );
}
