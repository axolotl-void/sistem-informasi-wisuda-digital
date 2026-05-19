"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/utils/format";
import type { KehadiranStats } from "@/types/kehadiran.type";

interface DashboardChartsProps {
  stats: KehadiranStats;
}

export function DashboardCharts({ stats }: DashboardChartsProps) {
  const total = stats.total || 1;
  const hadirPct = (stats.hadir / total) * 100;
  const terlambatPct = (stats.terlambat / total) * 100;
  const tidakHadirPct = (stats.tidakHadir / total) * 100;

  const segments = [
    { label: "Hadir", pct: hadirPct, color: "bg-green-500" },
    { label: "Terlambat", pct: terlambatPct, color: "bg-yellow-500" },
    { label: "Tidak Hadir", pct: tidakHadirPct, color: "bg-red-400" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Distribusi Kehadiran</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar stacked */}
        <div className="flex h-4 rounded-full overflow-hidden w-full bg-gray-100">
          {segments.map((s) => (
            <div
              key={s.label}
              className={`${s.color} transition-all duration-500`}
              style={{ width: `${s.pct}%` }}
              title={`${s.label}: ${s.pct.toFixed(1)}%`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${s.color}`} />
                <span className="text-gray-600">{s.label}</span>
              </div>
              <span className="font-medium text-gray-900">
                {formatPercent(s.pct / 100)}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center pt-2">
          Total kehadiran: {formatPercent(stats.persentaseKehadiran)}
        </p>
      </CardContent>
    </Card>
  );
}
