"use client";

import { motion } from "framer-motion";
import { Mail, Plus } from "lucide-react";
import { useUndanganStore } from "../store";

export function EmptyState() {
  const { openGenerateModal } = useUndanganStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl" />
        <div className="relative flex size-16 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.04]">
          <Mail className="size-7 text-gray-300 dark:text-white/20" />
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-400 dark:text-white/40">Tidak ada undangan ditemukan</p>
      <p className="mt-1 text-xs text-gray-400 dark:text-white/20">Coba ubah filter atau generate undangan baru</p>
      <button
        type="button"
        onClick={openGenerateModal}
        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-600 transition-all hover:border-blue-400 hover:bg-blue-100 cursor-pointer dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/15"
      >
        <Plus className="size-3.5" />
        Generate Undangan
      </button>
    </motion.div>
  );
}
