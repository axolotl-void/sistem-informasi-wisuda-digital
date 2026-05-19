"use client";

import {
  Mail, Users, UserCheck, DoorOpen,
  Armchair, Crown,
} from "lucide-react";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { SeatMonitor } from "@/features/dashboard/components/seat-monitor";
import { QrPanel } from "@/features/dashboard/components/qr-panel";
import { ActivityTable } from "@/features/dashboard/components/activity-table";

// ─── Dummy stat data ─────────────────────────────────────────────────────────

const stats = [
  { label: "Total Undangan", value: "1,248", icon: Mail, accent: "blue" as const, subtitle: "Terkirim semua", trend: { value: "100%", positive: true } },
  { label: "Total Kehadiran", value: "847", icon: UserCheck, accent: "emerald" as const, subtitle: "67.8% hadir", trend: { value: "+12", positive: true } },
  { label: "Belum Hadir", value: "371", icon: Users, accent: "orange" as const, subtitle: "Menunggu kedatangan" },
  { label: "Gate Aktif", value: "4", icon: DoorOpen, accent: "violet" as const, subtitle: "Semua gate online" },
  { label: "Kursi Terisi", value: "164/200", icon: Armchair, accent: "blue" as const, subtitle: "Auditorium utama", trend: { value: "82%", positive: true } },
  { label: "Tamu VIP", value: "24", icon: Crown, accent: "orange" as const, subtitle: "Hadir 20 orang" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-white">Dashboard</h1>
        <p className="mt-2 text-sm font-medium text-white/35">
          Monitoring realtime wisuda digital — {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.08} />
        ))}
      </div>

      {/* Seat monitoring — full width */}
      <SeatMonitor />

      {/* QR Panel + Activity Table — side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <QrPanel />
        </div>
        <div className="lg:col-span-3">
          <ActivityTable />
        </div>
      </div>
    </div>
  );
}
