"use client";

import { cn } from "@/lib/utils";
import type { InvitationStatus, AttendanceStatus } from "../types";

const statusConfig: Record<
  InvitationStatus,
  { label: string; dot: string; light: string; dark: string }
> = {
  belum_generate: {
    label: "Belum Generate",
    dot: "bg-zinc-400",
    light: "border-zinc-400/30 bg-zinc-500/12 text-zinc-700",
    dark: "dark:border-zinc-500/25 dark:bg-zinc-500/10 dark:text-zinc-300",
  },
  qr_aktif: {
    label: "QR Aktif",
    dot: "bg-blue-500",
    light: "border-blue-400/30 bg-blue-500/15 text-blue-800",
    dark: "dark:border-blue-500/25 dark:bg-blue-500/12 dark:text-blue-300",
  },
  sudah_download: {
    label: "Sudah Download",
    dot: "bg-violet-500",
    light: "border-violet-400/30 bg-violet-500/15 text-violet-800",
    dark: "dark:border-violet-500/25 dark:bg-violet-500/12 dark:text-violet-300",
  },
  sudah_hadir: {
    label: "Sudah Hadir",
    dot: "bg-emerald-500",
    light: "border-emerald-400/30 bg-emerald-500/15 text-emerald-800",
    dark: "dark:border-emerald-500/25 dark:bg-emerald-500/12 dark:text-emerald-300",
  },
  expired: {
    label: "Expired",
    dot: "bg-orange-500",
    light: "border-orange-400/30 bg-orange-500/15 text-orange-800",
    dark: "dark:border-orange-500/25 dark:bg-orange-500/12 dark:text-orange-300",
  },
  invalid: {
    label: "Invalid",
    dot: "bg-red-500",
    light: "border-red-400/30 bg-red-500/15 text-red-800",
    dark: "dark:border-red-500/25 dark:bg-red-500/12 dark:text-red-300",
  },
};

const attendanceConfig: Record<
  AttendanceStatus,
  { label: string; light: string; dark: string }
> = {
  belum_hadir: {
    label: "Belum Hadir",
    light: "border-zinc-400/30 bg-zinc-500/12 text-zinc-700",
    dark: "dark:border-zinc-500/25 dark:bg-zinc-500/10 dark:text-zinc-300",
  },
  hadir: {
    label: "Hadir",
    light: "border-emerald-400/30 bg-emerald-500/15 text-emerald-800",
    dark: "dark:border-emerald-500/25 dark:bg-emerald-500/12 dark:text-emerald-300",
  },
  terlambat: {
    label: "Terlambat",
    light: "border-orange-400/30 bg-orange-500/15 text-orange-800",
    dark: "dark:border-orange-500/25 dark:bg-orange-500/12 dark:text-orange-300",
  },
  tidak_hadir: {
    label: "Tidak Hadir",
    light: "border-red-400/30 bg-red-500/15 text-red-800",
    dark: "dark:border-red-500/25 dark:bg-red-500/12 dark:text-red-300",
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
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[0.68rem]" : "px-2.5 py-1 text-xs",
        cfg.light,
        cfg.dark,
      )}
    >
      <span className={cn("size-1.5 rounded-full", cfg.dot)} />
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
        "inline-flex items-center rounded-full border font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[0.68rem]" : "px-2.5 py-1 text-xs",
        cfg.light,
        cfg.dark,
      )}
    >
      {cfg.label}
    </span>
  );
}
