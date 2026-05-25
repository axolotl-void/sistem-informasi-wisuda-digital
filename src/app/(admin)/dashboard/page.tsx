"use client";

import {
  Mail,
  Users,
  UserCheck,
  DoorOpen,
  Armchair,
  Crown,
  Sparkles,
} from "lucide-react";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { SeatPreview } from "@/features/dashboard/components/seat-preview";
import { QrPanel } from "@/features/dashboard/components/qr-panel";
import { ActivityTable } from "@/features/dashboard/components/activity-table";
const stats = [
  {
    label: "Total Undangan",
    value: "1,248",
    icon: Mail,
    accent: "blue" as const,
    subtitle: "Terkirim semua",
    trend: { value: "100%", positive: true },
  },
  {
    label: "Total Kehadiran",
    value: "847",
    icon: UserCheck,
    accent: "emerald" as const,
    subtitle: "67.8% hadir",
    trend: { value: "+12", positive: true },
  },
  {
    label: "Belum Hadir",
    value: "371",
    icon: Users,
    accent: "orange" as const,
    subtitle: "Menunggu kedatangan",
  },
  {
    label: "Gate Aktif",
    value: "4",
    icon: DoorOpen,
    accent: "violet" as const,
    subtitle: "Semua gate online",
  },
  {
    label: "Kursi Terisi",
    value: "164/200",
    icon: Armchair,
    accent: "blue" as const,
    subtitle: "Auditorium utama",
    trend: { value: "82%", positive: true },
  },
  {
    label: "Tamu VIP",
    value: "24",
    icon: Crown,
    accent: "orange" as const,
    subtitle: "Hadir 20 orang",
  },
];

export default function DashboardPage() {
  const dateLabel = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="dashboard-mesh relative -m-4 min-h-full overflow-hidden rounded-none p-4 sm:-m-6 sm:p-6 sm:rounded-3xl">
      <div className="relative z-10 space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/90 px-3 py-1 text-[11px] font-semibold text-blue-800 shadow-[0_2px_12px_rgba(59,130,246,0.1)] dark:border-white/10 dark:bg-white/[0.08] dark:text-white/50">
              <Sparkles className="size-3.5 text-blue-600 dark:text-blue-400" />
              Monitoring realtime
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              <span className="bg-gradient-to-br from-slate-900 via-blue-900 to-violet-800 bg-clip-text text-transparent dark:hidden">
                Dashboard
              </span>
              <span className="hidden dark:inline">Dashboard</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-slate-700 dark:text-white/40">
              Wisuda digital — {dateLabel}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/90 bg-white/90 px-4 py-2.5 shadow-[0_4px_20px_rgba(16,185,129,0.1)] dark:border-white/10 dark:bg-white/[0.08]">
            <span className="inline-flex size-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-white/70">
              Sistem aktif
            </span>
          </div>
        </header>

        {/* Stat cards */}
        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((s, i) => (
              <StatCard key={s.label} {...s} delay={i * 0.06} />
            ))}
          </div>
        </section>

        <SeatPreview />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div id="scanner" className="scroll-mt-6 lg:col-span-2">
            <QrPanel />
          </div>
          <div className="lg:col-span-3">
            <ActivityTable />
          </div>
        </div>
      </div>
    </div>
  );
}
