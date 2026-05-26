"use client";

import React, { useState } from "react";
import { usePengaturanStore } from "@/store/pengaturan.store";
import { Clock, DoorOpen, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  pengaturanPanel,
  pengaturanInput,
  pengaturanHeading,
  pengaturanSubheading,
  pengaturanBtnEmerald,
  pengaturanListItem,
  pengaturanEmptyList,
} from "../pengaturan-ui";

const listBtn = cn(
  "flex size-8 cursor-pointer items-center justify-center rounded-lg border transition-all disabled:opacity-50",
  "border-slate-200/80 bg-slate-50 text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600",
  "dark:border-white/[0.04] dark:bg-white/[0.02] dark:text-white/30 dark:hover:border-rose-500/20 dark:hover:bg-rose-500/[0.08] dark:hover:text-rose-400",
);

const sectionTitle = "text-sm font-bold text-slate-800 flex items-center gap-2 dark:text-white/70";

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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menambahkan sesi");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={cn(pengaturanHeading)}>
          <Clock className="size-4.5 text-emerald-600 dark:text-emerald-400" />
          Manajemen Sesi
        </h2>
        <p className={pengaturanSubheading}>Atur daftar pembagian sesi upacara wisuda yang aktif</p>
      </div>

      <div className={cn(pengaturanPanel, "space-y-4 p-6")}>
        <h3 className={cn(sectionTitle)}>
          <Clock className="size-4 text-emerald-600 dark:text-emerald-400/80" />
          Daftar Sesi Wisuda
        </h3>

        <form onSubmit={handleAddSesi} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Sesi Pagi, Sesi Khusus"
            value={newSesi}
            onChange={(e) => setNewSesi(e.target.value)}
            disabled={isLoading}
            className={cn(pengaturanInput, "flex-1 focus:border-emerald-500/50 focus:ring-emerald-500/10")}
          />
          <button type="submit" disabled={isLoading} className={cn(pengaturanBtnEmerald, "w-12")}>
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-5" />}
          </button>
        </form>

        <div className="max-h-80 divide-y divide-slate-200/70 overflow-y-auto pr-1 dark:divide-white/[0.04]">
          {sesiList.length === 0 ? (
            <p className={pengaturanEmptyList}>Belum ada sesi dikonfigurasi</p>
          ) : (
            sesiList.map((sesi) => (
              <div key={sesi} className="flex items-center justify-between py-3">
                <span className={pengaturanListItem}>{sesi}</span>
                <button
                  type="button"
                  onClick={() => deleteSesi(sesi)}
                  disabled={isLoading}
                  className={listBtn}
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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menambahkan gate");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={cn(pengaturanHeading)}>
          <DoorOpen className="size-4.5 text-blue-600 dark:text-blue-400" />
          Manajemen Gate
        </h2>
        <p className={pengaturanSubheading}>
          Atur daftar gerbang pemindai kode yang aktif untuk verifikasi kehadiran
        </p>
      </div>

      <div className={cn(pengaturanPanel, "space-y-4 p-6")}>
        <h3 className={cn(sectionTitle)}>
          <DoorOpen className="size-4 text-blue-600 dark:text-blue-400/80" />
          Daftar Pintu (Gate) Scanner
        </h3>

        <form onSubmit={handleAddGate} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Gate VIP, Gate Utara"
            value={newGate}
            onChange={(e) => setNewGate(e.target.value)}
            disabled={isLoading}
            className={cn(pengaturanInput, "flex-1")}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              pengaturanBtnEmerald,
              "w-12 border-blue-300/80 bg-blue-50 text-blue-700 hover:bg-blue-100",
              "dark:border-blue-500/25 dark:bg-blue-500/[0.08] dark:text-blue-400",
            )}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-5" />}
          </button>
        </form>

        <div className="max-h-80 divide-y divide-slate-200/70 overflow-y-auto pr-1 dark:divide-white/[0.04]">
          {gateList.length === 0 ? (
            <p className={pengaturanEmptyList}>Belum ada gate dikonfigurasi</p>
          ) : (
            gateList.map((gate) => (
              <div key={gate} className="flex items-center justify-between py-3">
                <span className={pengaturanListItem}>{gate}</span>
                <button
                  type="button"
                  onClick={() => deleteGate(gate)}
                  disabled={isLoading}
                  className={listBtn}
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

export function SesiGateTab() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <SesiTab />
      <GateTab />
    </div>
  );
}
