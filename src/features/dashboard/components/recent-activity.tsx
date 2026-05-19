"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardStore } from "@/store/dashboard.store";
import { useSocket } from "@/hooks/use-socket";
import { formatRelativeTime } from "@/utils/format";

export function RecentActivity() {
  useSocket("admin");
  const { recentActivity } = useDashboardStore();

  const typeConfig = {
    scan: { label: "Scan", variant: "default" as const },
    undangan: { label: "Undangan", variant: "secondary" as const },
    mahasiswa: { label: "Mahasiswa", variant: "outline" as const },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Belum ada aktivitas
          </p>
        ) : (
          <ul className="space-y-3">
            {recentActivity.map((activity) => {
              const config = typeConfig[activity.type];
              return (
                <li key={activity.id} className="flex items-start gap-3">
                  <Badge variant={config.variant} className="mt-0.5 shrink-0">
                    {config.label}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
