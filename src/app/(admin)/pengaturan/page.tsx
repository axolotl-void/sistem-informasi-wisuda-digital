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

type TabId = "identitas" | "sesi" | "gate" | "kuota";

interface TabItem {
  id: TabId;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ReactNode;
}

export default function PengaturanPage() {
  const fetchSettings = usePengaturanStore((state) => state.fetchSettings);
  const [activeTab, setActiveTab] = useState<TabId>("identitas");

  // Load settings on mount
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-white">Pengaturan</h1>
        <p className="mt-2 text-sm font-medium text-white/35">
          Pusat Kontrol & Konfigurasi Sistem Informasi Wisuda Digital (Super Admin)
        </p>
      </div>

      {/* Main Glassmorphic Container with Internal Sidebar/Tabs */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch min-h-[500px]">
        {/* Left Navigation Sidebar / Mobile Top bar */}
        <div className="w-full lg:w-72 shrink-0 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1.5 p-2 rounded-2xl border border-white/[0.06] bg-white/[0.01] backdrop-blur-xl no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer group shrink-0 lg:shrink-1 ${
                  isActive
                    ? "text-blue-400"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.02]"
                }`}
              >
                {/* Active Sliding Background Pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 rounded-xl bg-blue-500/[0.06] border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.06)]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                <div
                  className={`relative flex size-9 items-center justify-center rounded-lg border transition-all duration-200 ${
                    isActive
                      ? "border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.2)]"
                      : "border-white/[0.06] bg-white/[0.02] text-white/30 group-hover:border-white/[0.12] group-hover:text-white/50"
                  }`}
                >
                  <Icon className="size-4.5" />
                </div>

                <div className="relative text-left hidden sm:block">
                  <p className="text-xs font-bold tracking-wide">{tab.label}</p>
                  <p className="text-[10px] font-medium text-white/20 mt-0.5 group-hover:text-white/30 transition-colors">
                    {tab.sublabel}
                  </p>
                </div>

                {/* Mobile-only compact text label */}
                <div className="relative text-left sm:hidden">
                  <p className="text-xs font-bold tracking-wide">{tab.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content View Panel */}
        <div className="flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.01] p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          {/* Subtle Ambient Decorative Glowing Accent (Inner Core shadow) */}
          <div className="absolute -right-24 -top-24 size-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -left-24 -bottom-24 size-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="relative h-full flex flex-col"
            >
              {currentTab.component}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
