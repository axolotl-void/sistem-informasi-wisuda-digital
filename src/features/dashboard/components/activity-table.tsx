"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  time: string;
  name: string;
  seat: string;
  gate: string;
  status: "success" | "failed" | "pending";
}

const activities: Activity[] = [
  { id: "1", time: "09:45:12", name: "Ahmad Pratama", seat: "A-5", gate: "Gate 1", status: "success" },
  { id: "2", time: "09:44:58", name: "Siti Lestari", seat: "B-12", gate: "Gate 2", status: "success" },
  { id: "3", time: "09:44:30", name: "Budi Hidayat", seat: "C-8", gate: "Gate 1", status: "failed" },
  { id: "4", time: "09:43:55", name: "Rina Wati", seat: "D-22", gate: "Gate 3", status: "success" },
  { id: "5", time: "09:43:20", name: "Dimas Nugroho", seat: "E-15", gate: "Gate 2", status: "success" },
  { id: "6", time: "09:42:45", name: "Putri Sari", seat: "F-3", gate: "Gate 4", status: "pending" },
  { id: "7", time: "09:42:10", name: "Rizky Ramadhan", seat: "G-18", gate: "Gate 1", status: "success" },
  { id: "8", time: "09:41:30", name: "Ayu Utami", seat: "H-10", gate: "Gate 3", status: "success" },
];

const statusConfig = {
  success: { icon: CheckCircle2, text: "Berhasil", color: "text-emerald-400" },
  failed: { icon: XCircle, text: "Gagal", color: "text-red-400" },
  pending: { icon: Clock, text: "Menunggu", color: "text-orange-400" },
};

export function ActivityTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
      className="rounded-2xl border p-6 backdrop-blur-xl
        bg-white/70 border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)]
        dark:bg-white/[0.04] dark:border-white/[0.08] dark:shadow-none"
    >
      <div className="mb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Aktivitas Terkini</h2>
        <p className="text-sm font-medium text-slate-500 dark:text-white/35">Log scan kehadiran realtime</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/[0.06]">
              {["Waktu", "Nama", "Kursi", "Gate", "Status"].map((h) => (
                <th
                  key={h}
                  className="pb-3 pr-4 text-left text-xs font-semibold tracking-wider text-slate-400 dark:text-white/25 uppercase last:pr-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {activities.map((a, i) => {
              const cfg = statusConfig[a.status];
              const Icon = cfg.icon;
              return (
                <motion.tr
                  key={a.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="group"
                >
                  <td className="py-3 pr-4">
                    <span className="font-mono text-xs tabular-nums text-slate-400 dark:text-white/40">{a.time}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm font-medium text-slate-800 dark:text-white/80">{a.name}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="rounded bg-slate-100 dark:bg-white/[0.06] px-2 py-0.5 text-xs font-mono text-slate-600 dark:text-white/50">
                      {a.seat}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-medium text-slate-500 dark:text-white/40">{a.gate}</span>
                  </td>
                  <td className="py-3">
                    <span className={cn("inline-flex items-center gap-1", cfg.color)}>
                      <Icon className="size-3.5" />
                      <span className="text-xs font-semibold">{cfg.text}</span>
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
