"use client";

import { Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercent } from "@/utils/format";
import type { KehadiranStats } from "@/types/kehadiran.type";

interface DashboardStatsProps {
  stats: KehadiranStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const items = [
    {
      title: "Total Undangan",
      value: formatNumber(stats.total),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Hadir",
      value: formatNumber(stats.hadir),
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Tidak Hadir",
      value: formatNumber(stats.tidakHadir),
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Terlambat",
      value: formatNumber(stats.terlambat),
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {item.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${item.bg}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            {item.title === "Hadir" && (
              <p className="text-xs text-gray-500 mt-1">
                {formatPercent(stats.persentaseKehadiran)} kehadiran
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
