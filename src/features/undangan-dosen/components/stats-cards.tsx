"use client";

import { Mail, Clock, UserCheck } from "lucide-react";
import { StatCard } from "@/features/dashboard/components/stat-card";

interface Stats {
  total: number;
  hadir: number;
  belumHadir: number;
}

export function UndanganDosenStatsCards({ stats }: { stats: Stats | null }) {
  const s = stats || { total: 0, hadir: 0, belumHadir: 0 };

  const items = [
    {
      label: "Total Undangan Dosen",
      value: s.total,
      icon: Mail,
      accent: "blue" as const,
      subtitle: "Terdaftar di sistem",
    },
    {
      label: "Sudah Hadir",
      value: s.hadir,
      icon: UserCheck,
      accent: "emerald" as const,
      subtitle: "Sudah scan di gate",
    },
    {
      label: "Belum Hadir",
      value: s.belumHadir,
      icon: Clock,
      accent: "orange" as const,
      subtitle: "Menunggu kehadiran",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}
