"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useScannerStore } from "@/store/scanner.store";
import { useDashboardStore } from "@/store/dashboard.store";
import { useSocket } from "@/hooks/use-socket";
import { formatDateTime } from "@/utils/format";

export function RealtimeAttendance() {
  const { isConnected } = useScannerStore();
  const { stats } = useDashboardStore();
  useSocket("admin");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Kehadiran Realtime</CardTitle>
        <Badge variant={isConnected ? "default" : "secondary"}>
          <span
            className={`w-2 h-2 rounded-full mr-1.5 ${
              isConnected ? "bg-green-400 animate-pulse" : "bg-gray-400"
            }`}
          />
          {isConnected ? "Live" : "Offline"}
        </Badge>
      </CardHeader>
      <CardContent>
        {stats ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{stats.hadir}</p>
              <p className="text-xs text-green-600">Hadir</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-700">{stats.tidakHadir}</p>
              <p className="text-xs text-red-600">Belum Hadir</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            Menunggu data...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
