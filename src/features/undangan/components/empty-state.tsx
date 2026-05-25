"use client";

import { Mail, Plus } from "lucide-react";
import { useUndanganStore } from "../store";
import { GlassChip, glassBtnPrimary } from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";

export function EmptyState() {
  const { openGenerateModal } = useUndanganStore();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <GlassChip className="mb-4 flex size-14 items-center justify-center p-0">
        <Mail className="size-6 text-slate-400 dark:text-white/25" />
      </GlassChip>
      <p className="text-sm font-semibold text-slate-600 dark:text-white/55">
        Tidak ada undangan ditemukan
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-white/30">
        Coba ubah filter atau generate undangan baru
      </p>
      <button
        type="button"
        onClick={openGenerateModal}
        className={cn(glassBtnPrimary, "mt-5 h-9 gap-2 px-4")}
      >
        <Plus className="size-3.5" />
        Generate Undangan
      </button>
    </div>
  );
}
