"use client";

import { cn } from "@/lib/utils";

export type StudentStatus =
  | "belum-login"
  | "profile-belum-lengkap"
  | "menunggu-verifikasi"
  | "terverifikasi"
  | "qr-aktif"
  | "sudah-hadir";

const config: Record<
  StudentStatus,
  { label: string; dot: string; text: string; bg: string }
> = {
  "belum-login": {
    label: "Belum Login",
    dot: "bg-zinc-400",
    text: "text-zinc-300",
    bg: "bg-zinc-500/10",
  },
  "profile-belum-lengkap": {
    label: "Profile Belum Lengkap",
    dot: "bg-orange-400",
    text: "text-orange-300",
    bg: "bg-orange-500/10",
  },
  "menunggu-verifikasi": {
    label: "Menunggu Verifikasi",
    dot: "bg-yellow-400",
    text: "text-yellow-300",
    bg: "bg-yellow-500/10",
  },
  terverifikasi: {
    label: "Terverifikasi",
    dot: "bg-blue-400",
    text: "text-blue-300",
    bg: "bg-blue-500/10",
  },
  "qr-aktif": {
    label: "QR Aktif",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
  },
  "sudah-hadir": {
    label: "Sudah Hadir",
    dot: "bg-green-400 animate-pulse",
    text: "text-green-300",
    bg: "bg-green-500/10",
  },
};

interface StatusBadgeProps {
  status: StudentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        c.bg,
        c.text,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}
