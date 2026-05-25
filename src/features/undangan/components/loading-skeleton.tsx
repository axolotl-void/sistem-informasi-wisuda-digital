"use client";

import { LiquidGlassCard } from "@/components/ui/liquid-glass";

export function LoadingSkeleton() {
  return (
    <LiquidGlassCard hover={false} className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-white/60 bg-white/30 dark:border-white/[0.08] dark:bg-white/[0.03]">
              {Array.from({ length: 10 }).map((_, i) => (
                <th key={i} className="py-3 pl-4 text-left">
                  <div className="h-2.5 w-16 rounded-full bg-white/60 dark:bg-white/[0.06]" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr
                key={i}
                className="border-b border-white/40 dark:border-white/[0.04]"
              >
                <td className="py-3 pl-4 pr-3">
                  <div className="size-9 rounded-md bg-white/50 dark:bg-white/[0.06]" />
                </td>
                {Array.from({ length: 9 }).map((_, j) => (
                  <td key={j} className="py-3 pr-4">
                    <div className="h-2.5 w-24 rounded-full bg-white/45 dark:bg-white/[0.05]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LiquidGlassCard>
  );
}
