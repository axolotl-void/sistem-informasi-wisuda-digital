"use client";

import { SeatMonitor } from "@/features/dashboard/components/seat-monitor";

export default function SeatMonitoringPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          Seat Monitoring
        </h1>
        <p className="mt-2 text-sm font-medium text-white/35">
          Pemantauan denah kursi wisuda secara real-time —{" "}
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Full Seat Monitor Component */}
      <SeatMonitor />
    </div>
  );
}
