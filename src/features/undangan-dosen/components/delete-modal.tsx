"use client";

import { Trash2 } from "lucide-react";
import { LiquidGlassCard, glassBtnGhost } from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";

const glassBtnDanger = cn(
  glassBtnGhost,
  "border-red-400/35 bg-red-500/10 text-red-700 hover:bg-red-500/15",
  "dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/18",
);

interface DeleteSingleProps {
  open: boolean;
  item: any | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteUndanganDosenModal({
  open,
  item,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteSingleProps) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55" onClick={!isDeleting ? onClose : undefined} />
      <LiquidGlassCard hover={false} className="relative z-10 w-full max-w-md p-6">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/10">
          <Trash2 className="size-5 text-red-600 dark:text-red-400" />
        </div>

        <h2 className="text-base font-bold text-slate-900 dark:text-white/90">
          Hapus Undangan Dosen?
        </h2>
        <p className="mt-2 text-[0.82rem] leading-relaxed text-slate-600 dark:text-white/45">
          Anda akan menghapus undangan milik dosen **{item.nama}** ({item.jabatan}) secara permanen.
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className={cn(glassBtnGhost, "h-10 flex-1 justify-center disabled:opacity-40")}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={cn(glassBtnDanger, "h-10 flex-1 justify-center font-bold disabled:opacity-60")}
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </LiquidGlassCard>
    </div>
  );
}

interface DeleteAllProps {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteAllUndanganDosenDialog({
  open,
  count,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteAllProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55" onClick={!isDeleting ? onClose : undefined} />
      <LiquidGlassCard hover={false} className="relative z-10 w-full max-w-md p-6">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/10">
          <Trash2 className="size-5 text-red-600 dark:text-red-400" />
        </div>

        <h2 className="text-base font-bold text-slate-900 dark:text-white/90">
          Hapus Semua Undangan Dosen?
        </h2>
        <p className="mt-2 text-[0.82rem] leading-relaxed text-slate-600 dark:text-white/45">
          Anda akan menghapus <span className="font-semibold text-red-600 dark:text-red-400">{count} data undangan dosen</span> secara permanen beserta data riwayat check-in terkait.
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className={cn(glassBtnGhost, "h-10 flex-1 justify-center disabled:opacity-40")}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={cn(glassBtnDanger, "h-10 flex-1 justify-center font-bold disabled:opacity-60")}
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus Semua"}
          </button>
        </div>
      </LiquidGlassCard>
    </div>
  );
}
