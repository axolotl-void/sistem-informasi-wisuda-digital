"use client";

import React, { useEffect, useState } from "react";
import { usePengaturanStore } from "@/store/pengaturan.store";
import {
  IdentitasAcaraTab,
  SesiTab,
  GateTab,
  KuotaKursiTab,
} from "@/features/pengaturan";
import { Settings, Clock, DoorOpen, Armchair } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type TabId = "identitas" | "sesi" | "gate" | "kuota";

interface TabItem {
  id: TabId;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ReactNode;
}

const navShell = cn(
  "flex w-full shrink-0 flex-row gap-1.5 overflow-x-auto rounded-2xl border p-2 backdrop-blur-xl lg:w-72 lg:flex-col lg:overflow-visible",
  "border-slate-200/90 bg-white/90 shadow-sm",
  "dark:border-white/[0.06] dark:bg-white/[0.01] dark:shadow-none",
);

const contentShell = cn(
  "relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl border p-6 backdrop-blur-xl sm:p-8",
  "border-slate-200/90 bg-white/95 shadow-[0_4px_20px_rgba(59,130,246,0.06)]",
  "dark:border-white/[0.06] dark:bg-white/[0.01] dark:shadow-none",
);

export default function PengaturanPage() {
  const fetchSettings = usePengaturanStore((state) => state.fetchSettings);
  const [activeTab, setActiveTab] = useState<TabId>("identitas");

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const tabs: TabItem[] = [
    {
      id: "identitas",
      label: "Identitas Acara",
      sublabel: "Nama, tanggal, lokasi",
      icon: Settings,
      component: <IdentitasAcaraTab />,
    },
    {
      id: "sesi",
      label: "Manajemen Sesi",
      sublabel: "Pagi, siang, sore",
      icon: Clock,
      component: <SesiTab />,
    },
    {
      id: "gate",
      label: "Manajemen Gate",
      sublabel: "Scanner active pintu",
      icon: DoorOpen,
      component: <GateTab />,
    },
    {
      id: "kuota",
      label: "Kuota & Kursi",
      sublabel: "Kapasitas & pendamping",
      icon: Armchair,
      component: <KuotaKursiTab />,
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className="dashboard-mesh relative -m-4 min-h-full space-y-6 overflow-hidden rounded-none p-4 sm:-m-6 sm:rounded-3xl sm:p-6">
      <div className="relative z-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Pengaturan
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-white/35">
          Pusat Kontrol & Konfigurasi Sistem Informasi Wisuda Digital (Super Admin)
        </p>
      </div>

      <div className="relative z-10 flex min-h-[500px] flex-col items-stretch gap-6 lg:flex-row">
        <div className={navShell}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "group relative flex shrink-0 cursor-pointer items-center gap-3.5 rounded-xl px-4 py-3 text-left transition-all duration-200 lg:shrink",
                  isActive
                    ? "text-blue-700 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-white/40 dark:hover:bg-white/[0.02] dark:hover:text-white/70",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 rounded-xl border border-blue-300/60 bg-blue-50 shadow-sm dark:border-blue-500/20 dark:bg-blue-500/[0.06] dark:shadow-[0_0_15px_rgba(59,130,246,0.06)]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                <div
                  className={cn(
                    "relative flex size-9 items-center justify-center rounded-lg border transition-all duration-200",
                    isActive
                      ? "border-blue-300/70 bg-blue-100 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:shadow-[0_0_8px_rgba(59,130,246,0.2)]"
                      : "border-slate-200/80 bg-slate-50 text-slate-500 group-hover:border-slate-300 group-hover:text-slate-700 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-white/30 dark:group-hover:border-white/[0.12] dark:group-hover:text-white/50",
                  )}
                >
                  <Icon className="size-4.5" />
                </div>

                <div className="relative hidden text-left sm:block">
                  <p className="text-xs font-bold tracking-wide">{tab.label}</p>
                  <p
                    className={cn(
                      "mt-0.5 text-[10px] font-medium transition-colors",
                      isActive
                        ? "text-blue-600/80 dark:text-blue-400/60"
                        : "text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-white/30",
                    )}
                  >
                    {tab.sublabel}
                  </p>
                </div>

                <div className="relative text-left sm:hidden">
                  <p className="text-xs font-bold tracking-wide">{tab.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className={contentShell}>
          <div className="pointer-events-none absolute -right-24 -top-24 size-48 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/5" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 size-48 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/5" />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="relative flex h-full flex-col"
            >
              {currentTab.component}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
