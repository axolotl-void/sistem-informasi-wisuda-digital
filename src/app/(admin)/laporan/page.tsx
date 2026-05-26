"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Users,
  UserCheck,
  QrCode,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const glassCard = cn(
  "group relative overflow-hidden rounded-xl border p-5 transition-all duration-200",
  "border-slate-200/90 bg-white/95 shadow-[0_4px_16px_rgba(59,130,246,0.06)]",
  "hover:border-slate-300/90 hover:shadow-[0_8px_24px_rgba(59,130,246,0.08)]",
  "dark:border-white/[0.06] dark:bg-white/[0.025] dark:shadow-none",
  "dark:hover:border-white/[0.1] dark:hover:bg-white/[0.04]",
);

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  actions: { label: string; icon: React.ElementType; onClick: () => void }[];
  delay: number;
}

function ReportCard({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBg,
  actions,
  delay,
}: ReportCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={glassCard}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent dark:via-white/[0.07]" />

      <div className="flex items-start gap-4">
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", iconBg)}>
          <Icon className={cn("size-4", iconColor)} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-tight text-slate-900 dark:text-white/80">
            {title}
          </h3>
          <p className="mt-1 text-[0.7rem] leading-relaxed text-slate-600 dark:text-white/30">
            {description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={cn(
                  "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[0.68rem] font-medium transition-all duration-150 active:scale-[0.97]",
                  "border-slate-200/90 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-800",
                  "dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-white/45 dark:hover:border-white/[0.12] dark:hover:bg-white/[0.06] dark:hover:text-white/65",
                )}
              >
                <action.icon className="size-3" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        "border-slate-200/90 bg-white/95 shadow-sm",
        "dark:border-white/[0.06] dark:bg-white/[0.025] dark:shadow-none",
      )}
    >
      <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/22">
        {label}
      </p>
      <p className={cn("mt-1.5 text-2xl font-bold tabular-nums tracking-tight", color)}>
        {value}
      </p>
    </div>
  );
}

export default function LaporanPage() {
  const handleDownload = (type: string) => {
    console.log(`Download ${type}`);
  };

  const reports: ReportCardProps[] = [
    {
      title: "Laporan Kehadiran Wisuda",
      description:
        "Rekap lengkap kehadiran wisudawan berdasarkan sesi, fakultas, dan gate masuk.",
      icon: UserCheck,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg:
        "border border-emerald-200/80 bg-emerald-50 dark:border-transparent dark:bg-emerald-500/[0.08]",
      actions: [
        {
          label: "Export Excel",
          icon: FileSpreadsheet,
          onClick: () => handleDownload("kehadiran-excel"),
        },
        {
          label: "Export PDF",
          icon: FileText,
          onClick: () => handleDownload("kehadiran-pdf"),
        },
      ],
      delay: 0.06,
    },
    {
      title: "Laporan Data Wisudawan",
      description:
        "Daftar lengkap wisudawan beserta status verifikasi, undangan, dan kehadiran.",
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg:
        "border border-blue-200/80 bg-blue-50 dark:border-transparent dark:bg-blue-500/[0.08]",
      actions: [
        {
          label: "Export Excel",
          icon: FileSpreadsheet,
          onClick: () => handleDownload("wisudawan-excel"),
        },
        {
          label: "Export PDF",
          icon: FileText,
          onClick: () => handleDownload("wisudawan-pdf"),
        },
      ],
      delay: 0.1,
    },
    {
      title: "Laporan Undangan Digital",
      description:
        "Status generate, download, dan penggunaan QR Code undangan per mahasiswa.",
      icon: QrCode,
      iconColor: "text-violet-600 dark:text-violet-400",
      iconBg:
        "border border-violet-200/80 bg-violet-50 dark:border-transparent dark:bg-violet-500/[0.08]",
      actions: [
        {
          label: "Export Excel",
          icon: FileSpreadsheet,
          onClick: () => handleDownload("undangan-excel"),
        },
        {
          label: "Export PDF",
          icon: FileText,
          onClick: () => handleDownload("undangan-pdf"),
        },
      ],
      delay: 0.14,
    },
    {
      title: "Laporan Statistik Acara",
      description:
        "Ringkasan statistik acara wisuda: total hadir, persentase kehadiran, dan distribusi per fakultas.",
      icon: TrendingUp,
      iconColor: "text-orange-600 dark:text-orange-400",
      iconBg:
        "border border-orange-200/80 bg-orange-50 dark:border-transparent dark:bg-orange-500/[0.08]",
      actions: [
        {
          label: "Export Excel",
          icon: FileSpreadsheet,
          onClick: () => handleDownload("statistik-excel"),
        },
        {
          label: "Export PDF",
          icon: FileText,
          onClick: () => handleDownload("statistik-pdf"),
        },
      ],
      delay: 0.18,
    },
  ];

  return (
    <div className="dashboard-mesh relative -m-4 min-h-full space-y-5 overflow-hidden rounded-none p-4 sm:-m-6 sm:rounded-3xl sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/90 bg-white/90 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
            <BarChart3 className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-[1.1rem] font-bold leading-tight tracking-tight text-slate-900 dark:text-white/90">
              Laporan
            </h1>
            <p className="mt-0.5 text-[0.68rem] text-slate-600 dark:text-white/28">
              Export dan unduh laporan wisuda
            </p>
          </div>
        </div>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[0.68rem] font-semibold transition-all active:scale-[0.97]",
            "border-blue-300/80 bg-blue-50 text-blue-700 hover:border-blue-400 hover:bg-blue-100",
            "dark:border-blue-500/25 dark:bg-blue-500/[0.08] dark:text-blue-400 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/[0.14]",
          )}
        >
          <Download className="size-3" />
          Export Semua
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.04 }}
        className="relative z-10 grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        <MiniStat label="Total Wisudawan" value="1,248" color="text-slate-800 dark:text-white/80" />
        <MiniStat label="Sudah Hadir" value="847" color="text-emerald-600 dark:text-emerald-400" />
        <MiniStat label="QR Aktif" value="401" color="text-blue-600 dark:text-blue-400" />
        <MiniStat label="Kehadiran" value="67.8%" color="text-violet-600 dark:text-violet-400" />
      </motion.div>

      <div className="relative z-10 grid grid-cols-1 gap-3 md:grid-cols-2">
        {reports.map((r) => (
          <ReportCard key={r.title} {...r} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={cn(
          "relative z-10 flex items-center gap-2 rounded-xl border px-4 py-3",
          "border-slate-200/80 bg-white/90 dark:border-white/[0.05] dark:bg-white/[0.02]",
        )}
      >
        <Calendar className="size-3.5 shrink-0 text-slate-400 dark:text-white/20" />
        <p className="text-[0.68rem] text-slate-600 dark:text-white/25">
          Data laporan untuk periode{" "}
          <span className="font-medium text-slate-800 dark:text-white/45">
            Wisuda 2024/2025
          </span>{" "}
          — Auditorium Utama
        </p>
      </motion.div>
    </div>
  );
}
