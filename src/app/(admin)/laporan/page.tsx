"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Download, FileSpreadsheet, FileText,
  TrendingUp, Users, UserCheck, QrCode, Calendar,
} from "lucide-react";

// ─── Report card ──────────────────────────────────────────────────────────────

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  actions: { label: string; icon: React.ElementType; onClick: () => void }[];
  delay: number;
}

function ReportCard({ title, description, icon: Icon, iconColor, iconBg, actions, delay }: ReportCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.025] p-5 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.04]"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

      <div className="flex items-start gap-4">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`size-4 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white/80 leading-tight">{title}</h3>
          <p className="text-[0.7rem] text-white/30 mt-1 leading-relaxed">{description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 text-[0.68rem] font-medium text-white/45 transition-all duration-150 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white/65 active:scale-[0.97] cursor-pointer"
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

// ─── Stat mini ────────────────────────────────────────────────────────────────

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
      <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-white/22">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold tabular-nums tracking-tight ${color}`}>{value}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LaporanPage() {
  const handleDownload = (type: string) => {
    // Placeholder — akan diintegrasikan dengan API
    console.log(`Download ${type}`);
  };

  const reports: ReportCardProps[] = [
    {
      title: "Laporan Kehadiran Wisuda",
      description: "Rekap lengkap kehadiran wisudawan berdasarkan sesi, fakultas, dan gate masuk.",
      icon: UserCheck,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/[0.08]",
      actions: [
        { label: "Export Excel", icon: FileSpreadsheet, onClick: () => handleDownload("kehadiran-excel") },
        { label: "Export PDF", icon: FileText, onClick: () => handleDownload("kehadiran-pdf") },
      ],
      delay: 0.06,
    },
    {
      title: "Laporan Data Wisudawan",
      description: "Daftar lengkap wisudawan beserta status verifikasi, undangan, dan kehadiran.",
      icon: Users,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/[0.08]",
      actions: [
        { label: "Export Excel", icon: FileSpreadsheet, onClick: () => handleDownload("wisudawan-excel") },
        { label: "Export PDF", icon: FileText, onClick: () => handleDownload("wisudawan-pdf") },
      ],
      delay: 0.1,
    },
    {
      title: "Laporan Undangan Digital",
      description: "Status generate, download, dan penggunaan QR Code undangan per mahasiswa.",
      icon: QrCode,
      iconColor: "text-violet-400",
      iconBg: "bg-violet-500/[0.08]",
      actions: [
        { label: "Export Excel", icon: FileSpreadsheet, onClick: () => handleDownload("undangan-excel") },
        { label: "Export PDF", icon: FileText, onClick: () => handleDownload("undangan-pdf") },
      ],
      delay: 0.14,
    },
    {
      title: "Laporan Statistik Acara",
      description: "Ringkasan statistik acara wisuda: total hadir, persentase kehadiran, dan distribusi per fakultas.",
      icon: TrendingUp,
      iconColor: "text-orange-400",
      iconBg: "bg-orange-500/[0.08]",
      actions: [
        { label: "Export Excel", icon: FileSpreadsheet, onClick: () => handleDownload("statistik-excel") },
        { label: "Export PDF", icon: FileText, onClick: () => handleDownload("statistik-pdf") },
      ],
      delay: 0.18,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
            <BarChart3 className="size-4 text-blue-400" />
          </div>
          <div>
            <h1 className="text-[1.1rem] font-bold tracking-tight text-white/90 leading-tight">Laporan</h1>
            <p className="text-[0.68rem] text-white/28 mt-0.5">Export dan unduh laporan wisuda</p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-blue-500/25 bg-blue-500/[0.08] px-2.5 text-[0.68rem] font-semibold text-blue-400 transition-all duration-150 hover:border-blue-500/40 hover:bg-blue-500/[0.14] active:scale-[0.97] cursor-pointer"
        >
          <Download className="size-3" />
          Export Semua
        </button>
      </motion.div>

      {/* Mini stats */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.04 }}
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        <MiniStat label="Total Wisudawan" value="1,248" color="text-white/80" />
        <MiniStat label="Sudah Hadir" value="847" color="text-emerald-400" />
        <MiniStat label="QR Aktif" value="401" color="text-blue-400" />
        <MiniStat label="Kehadiran" value="67.8%" color="text-violet-400" />
      </motion.div>

      {/* Report cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {reports.map((r) => (
          <ReportCard key={r.title} {...r} />
        ))}
      </div>

      {/* Period info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3"
      >
        <Calendar className="size-3.5 text-white/20 shrink-0" />
        <p className="text-[0.68rem] text-white/25">
          Data laporan untuk periode <span className="text-white/45 font-medium">Wisuda 2024/2025</span> — Auditorium Utama
        </p>
      </motion.div>
    </div>
  );
}
