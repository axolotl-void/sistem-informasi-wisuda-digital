"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { useSocket } from "@/hooks/use-socket";
import { useKehadiranStore } from "@/store/kehadiran.store";
import { SOCKET_EVENTS } from "@/utils/constants";

import { KehadiranStats } from "@/features/kehadiran/components/kehadiran-stats";
import { KehadiranToolbar } from "@/features/kehadiran/components/kehadiran-toolbar";
import { KehadiranTable } from "@/features/kehadiran/components/kehadiran-table";

export default function KehadiranPage() {
  const { fetchData, fetchStats } = useKehadiranStore();
  const { socket } = useSocket("admin");
  const [isLive, setIsLive] = useState(false);

  // Load initial statistics and attendance list on mount
  useEffect(() => {
    fetchStats();
    fetchData();
  }, [fetchData, fetchStats]);

  // Hook real-time socket events for seamless, no-refresh UI updates
  useEffect(() => {
    if (!socket) {
      setIsLive(false);
      return;
    }

    const handleConnect = () => setIsLive(true);
    const handleDisconnect = () => setIsLive(false);

    if (socket.connected) {
      setIsLive(true);
    }

    const handleScanSuccess = () => {
      // Trigger a store refresh for both table records and metrics
      fetchData();
      fetchStats();
    };

    const handleStatsUpdate = () => {
      // Update global metrics cards
      fetchStats();
    };

    // Attach listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on(SOCKET_EVENTS.SCAN_SUCCESS, handleScanSuccess);
    socket.on(SOCKET_EVENTS.STATS_UPDATE, handleStatsUpdate);

    return () => {
      // Clean up listeners
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off(SOCKET_EVENTS.SCAN_SUCCESS, handleScanSuccess);
      socket.off(SOCKET_EVENTS.STATS_UPDATE, handleStatsUpdate);
    };
  }, [socket, fetchData, fetchStats]);

  return (
    <div className="dashboard-mesh relative -m-4 min-h-full space-y-6 overflow-hidden rounded-none p-4 sm:-m-6 sm:rounded-3xl sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-white/90 bg-white/90 shadow-[0_4px_16px_rgba(59,130,246,0.1)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            <ClipboardList className="size-5.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white/90">
              Monitoring Kehadiran
            </h1>
            <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-white/35">
              Pantau absensi wisudawan secara realtime dari seluruh gerbang
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <div
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 backdrop-blur-xl transition-all duration-300 ${
              isLive
                ? "border-emerald-400/40 bg-emerald-50 text-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.08)] dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400 dark:shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                : "border-slate-200/80 bg-slate-50 text-slate-500 dark:border-white/5 dark:bg-white/2 dark:text-white/30"
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                isLive
                  ? "animate-pulse bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] dark:bg-emerald-400 dark:shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                  : "bg-slate-300 dark:bg-white/10"
              }`}
            />
            <span className="text-[0.7rem] font-bold uppercase tracking-wider">
              {isLive ? "Sistem Terhubung (Live)" : ""}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Metrics & Interactive Progress Section */}
      <div className="relative z-10 space-y-4">
        <KehadiranStats />
      </div>

      {/* Filter Toolbar Area */}
      <div className="relative z-10">
        <KehadiranToolbar />
      </div>

      {/* Table Data Section */}
      <div className="relative z-10">
        <KehadiranTable />
      </div>
    </div>
  );
}
