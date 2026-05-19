"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStore } from "@/store/dashboard.store";
import { useSocket } from "@/hooks/use-socket";
import { formatNumber, formatPercent } from "@/utils/format";
import type { KehadiranStats as KehadiranStatsType } from "@/types/kehadiran.type";

interface KehadiranStatsProps {
  stats: KehadiranStatsType;
}

export function KehadiranStats({ stats: initialStats }: KehadiranStatsProps) {
  const { stats, setStats } = useDashboardStore();
  useSocket("admin");

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats, setStats]);

  const current = stats ?? initialStats;

  const items = [
    {
      label: "Hadir",
      value: current.hadir,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Tidak Hadir",
      value: current.tidakHadir,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Terlambat",
      value: current.terlambat,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Persentase",
      value: formatPercent(current.persentaseKehadiran),
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
      isString: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {item.label}
            </CardTitle>
            <div className={`p-2 rounded-lg ${item.bg}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {item.isString ? item.value : formatNumber(item.value as number)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
