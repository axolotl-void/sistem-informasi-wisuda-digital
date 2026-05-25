"use client";

import { Mail, QrCode, Clock, Download, UserCheck, Users } from "lucide-react";
import { StatCard } from "@/features/dashboard/components/stat-card";
import type { InvitationStats } from "../types";

export function InvitationStatsCards({ stats }: { stats: InvitationStats }) {
  const items = [
    {
      label: "Total Undangan",
      value: stats.total,
      icon: Mail,
      accent: "blue" as const,
      subtitle: "Terdaftar di sistem",
    },
    {
      label: "QR Aktif",
      value: stats.qrAktif,
      icon: QrCode,
      accent: "violet" as const,
      subtitle: "Siap discan",
    },
    {
      label: "Belum Generate",
      value: stats.belumGenerate,
      icon: Clock,
      accent: "orange" as const,
      subtitle: "Perlu digenerate",
    },
    {
      label: "Sudah Download",
      value: stats.sudahDownload,
      icon: Download,
      accent: "blue" as const,
      subtitle: "Diunduh wisudawan",
    },
    {
      label: "Sudah Hadir",
      value: stats.sudahHadir,
      icon: UserCheck,
      accent: "emerald" as const,
      subtitle: "Hadir di venue",
    },
    {
      label: "Kuota Tamu",
      value: stats.totalKuotaTamu,
      icon: Users,
      accent: "orange" as const,
      subtitle: "Total kuota",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}
