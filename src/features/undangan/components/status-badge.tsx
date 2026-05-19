"use client";

import { cn } from "@/lib/utils";
import type { InvitationStatus, AttendanceStatus } from "../types";

const statusConfig: Record<InvitationStatus, { label: string; dot: string; pill: string }> = {
  belum_generate: {
    label: "Belum Generate",
    dot: "bg-zinc-500",
    pill: "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20",
  },
  qr_aktif: {
    label: "QR Aktif",
    dot: "bg-blue-400",
    pill: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  },
  sudah_download: {
    label: "Sudah Download",
    dot: "bg-violet-400",
    pill: "bg-violet-500/10 text-violet-400 ring-violet-500/20",
  },
  sudah_hadir: {
    label: "Sudah Hadir",
    dot: "bg-emerald-400",
    pill: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  },
  expired: {
    label: "Expired",
    dot: "bg-orange-400",
    pill: "bg-orange-500/10 text-orange-400 ring-orange-500/20",
  },
  invalid: {
    label: "Invalid",
    dot: "bg-red-400",
    pill: "bg-red-500/10 text-red-400 ring-red-500/20",
  },
};

const attendanceConfig: Record<AttendanceStatus, { label: string; pill: string }> = {
  belum_hadir: { label: "Belum Hadir", pill: "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20" },
  hadir: { label: "Hadir", pill: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" },
  terlambat: { label: "Terlambat", pill: "bg-orange-500/10 text-orange-400 ring-orange-500/20" },
  tidak_hadir: { label: "Tidak Hadir", pill: "bg-red-500/10 text-red-400 ring-red-500/20" },
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
