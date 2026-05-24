"use client";

import { cn } from "@/lib/utils";
import type { InvitationStatus, AttendanceStatus } from "../types";

const statusConfig: Record<InvitationStatus, { label: string; dot: string; pill: string }> = {
  belum_generate: {
    label: "Belum Generate",
    dot: "bg-zinc-400 dark:bg-zinc-500",
    pill: "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-500/20",
  },
  qr_aktif: {
    label: "QR Aktif",
    dot: "bg-blue-500 dark:bg-blue-400",
    pill: "bg-blue-50 text-blue-600 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
  },
  sudah_download: {
    label: "Sudah Download",
    dot: "bg-violet-500 dark:bg-violet-400",
    pill: "bg-violet-50 text-violet-600 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/20",
  },
  sudah_hadir: {
    label: "Sudah Hadir",
    dot: "bg-emerald-500 dark:bg-emerald-400",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  },
  expired: {
    label: "Expired",
    dot: "bg-orange-500 dark:bg-orange-400",
    pill: "bg-orange-50 text-orange-600 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20",
  },
  invalid: {
    label: "Invalid",
    dot: "bg-red-500 dark:bg-red-400",
    pill: "bg-red-50 text-red-600 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  },
};

const attendanceConfig: Record<AttendanceStatus, { label: string; pill: string }> = {
  belum_hadir: {
    label: "Belum Hadir",
    pill: "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-400 dark:ring-zinc-500/20",
  },
  hadir: {
    label: "Hadir",
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  },
  terlambat: {
    label: "Terlambat",
    pill: "bg-orange-50 text-orange-600 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20",
  },
  tidak_hadir: {
    label: "Tidak Hadir",
    pill: "bg-red-50 text-red-600 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  },
};

interface StatusBadgeProps {
  status: InvitationStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const cfg = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium ring-1",
        size === "sm" ? "px-2 py-0.5 text-[0.68rem]" : "px-2.5 py-1 text-xs",
        cfg.pill
      )}
    >
      <span className={cn("size-1.5 rounded-full", cfg.dot,
        status === "qr_aktif" && "animate-pulse"
      )} />
      {cfg.label}
    </span>
  );
}

interface AttendanceBadgeProps {
  status: AttendanceStatus;
  size?: "sm" | "md";
}

export function AttendanceBadge({ status, size = "sm" }: AttendanceBadgeProps) {
  const cfg = attendanceConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium ring-1",
        size === "sm" ? "px-2 py-0.5 text-[0.68rem]" : "px-2.5 py-1 text-xs",
        cfg.pill
      )}
    >
      {cfg.label}
    </span>
  );
}
