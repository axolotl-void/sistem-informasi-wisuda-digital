"use client";

import { SeatMonitor } from "@/features/dashboard/components/seat-monitor";

export default function SeatMonitoringPage() {
  return (
    <div className="dashboard-mesh relative -m-4 min-h-full overflow-hidden rounded-none p-4 sm:-m-6 sm:rounded-3xl sm:p-6">
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            <span className="bg-gradient-to-br from-slate-900 via-blue-900 to-violet-800 bg-clip-text text-transparent dark:hidden">
              Seat Monitoring
            </span>
            <span className="hidden dark:inline">Seat Monitoring</span>
          </h1>
        </div>

        {/* Full Seat Monitor Component */}
        <SeatMonitor />
      </div>
    </div>
  );
}

