"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Mail,
  Users,
  UserCheck,
  DoorOpen,
  Armchair,
  Crown,
  Loader2,
} from "lucide-react";
import { StatCard } from "./stat-card";
import { fetchWithAuth } from "@/lib/client-auth";
import { useSocket } from "@/hooks/use-socket";
import { useDashboardStore } from "@/store/dashboard.store";
import type { DashboardOverview } from "@/types/dashboard.type";
import type { KehadiranStats } from "@/types/kehadiran.type";

function fmt(n: number) {
  return n.toLocaleString("id-ID");
}

function overviewFromSocket(stats: KehadiranStats, prev: DashboardOverview | null): DashboardOverview | null {
  if (!prev) return null;
  const totalKehadiran = stats.hadir + stats.terlambat;
  return {
    ...prev,
    totalKehadiran,
    belumHadir: stats.tidakHadir,
    persentaseKehadiran: Math.round(stats.persentaseKehadiran * 1000) / 10,
    kursiTerisi: totalKehadiran,
    totalUndangan: stats.total,
  };
}

export function DashboardOverviewCards() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const { stats: socketStats } = useDashboardStore();

  useSocket("admin");

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/api/dashboard/stats");
      const json = await res.json();
      if (json.success && json.data) {
        setOverview(json.data as DashboardOverview);
      }
    } catch (err) {
      console.error("Gagal memuat statistik dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (socketStats) {
      setOverview((prev) => overviewFromSocket(socketStats, prev) ?? prev);
      void fetchOverview();
    }
  }, [socketStats, fetchOverview]);

  const cards = useMemo(() => {
    const o = overview;
    const pct = o?.persentaseKehadiran ?? 0;
    const kursiPct =
      o && o.kapasitasKursi > 0
        ? Math.round((o.kursiTerisi / o.kapasitasKursi) * 100)
        : 0;

    return [
      {
        label: "Total Undangan",
        value: loading ? "—" : fmt(o?.totalUndangan ?? 0),
        icon: Mail,
        accent: "blue" as const,
        subtitle: o
          ? `${o.undanganTerkirimPersen}% dari ${fmt(o.totalMahasiswa)} wisudawan`
          : "Memuat…",
        trend: o
          ? { value: `${o.undanganTerkirimPersen}%`, positive: o.undanganTerkirimPersen >= 80 }
          : undefined,
      },
      {
        label: "Total Kehadiran",
        value: loading ? "—" : fmt(o?.totalKehadiran ?? 0),
        icon: UserCheck,
        accent: "emerald" as const,
        subtitle: loading ? "Memuat…" : `${pct}% hadir`,
        trend: o?.scanHariIni
          ? { value: `+${o.scanHariIni} hari ini`, positive: true }
          : undefined,
      },
      {
        label: "Belum Hadir",
        value: loading ? "—" : fmt(o?.belumHadir ?? 0),
        icon: Users,
        accent: "orange" as const,
        subtitle: "Menunggu kedatangan",
      },
      {
        label: "Gate Aktif",
        value: loading ? "—" : String(o?.gateAktif ?? 0),
        icon: DoorOpen,
        accent: "violet" as const,
        subtitle: o
          ? `${o.gateAktif}/${o.gateTotal} petugas scan aktif`
          : "Memuat…",
      },
      {
        label: "Kursi Terisi",
        value: loading ? "—" : `${fmt(o?.kursiTerisi ?? 0)}/${fmt(o?.kapasitasKursi ?? 0)}`,
        icon: Armchair,
        accent: "blue" as const,
        subtitle: o?.lokasiUtama ?? "Auditorium utama",
        trend: o ? { value: `${kursiPct}%`, positive: kursiPct >= 50 } : undefined,
      },
      {
        label: "Blok VIP",
        value: loading ? "—" : fmt(o?.tamuVipTotal ?? 0),
        icon: Crown,
        accent: "orange" as const,
        subtitle: o ? `Hadir ${fmt(o.tamuVipHadir)} orang` : "Memuat…",
      },
    ];
  }, [overview, loading]);

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500 dark:text-white/35">
        <Loader2 className="size-5 animate-spin" />
        Memuat statistik dashboard…
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((s, i) => (
        <StatCard key={s.label} {...s} delay={i * 0.06} />
      ))}
    </div>
  );
}
