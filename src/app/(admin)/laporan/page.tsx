"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWithAuth } from "@/lib/client-auth";

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
  loading,
}: {
  label: string;
  value: string;
  color: string;
  loading?: boolean;
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
      {loading ? (
        <div className="mt-2 h-7 w-16 animate-pulse rounded bg-slate-200/50 dark:bg-white/10" />
      ) : (
        <p className={cn("mt-1.5 text-2xl font-bold tabular-nums tracking-tight", color)}>
          {value}
        </p>
      )}
    </div>
  );
}

export default function LaporanPage() {
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  // Fetch live stats from API
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await fetchWithAuth("/api/dashboard/stats");
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat statistik dasbor:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  // Generic PDF Table Generator with professional layout, margins, & auto-paging
  const generatePdfReport = (title: string, headers: string[], rows: any[][], filename: string) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    
    // Kop Surat Resmi
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("SISTEM INFORMASI WISUDA DIGITAL", 105, 18, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Laporan Kehadiran & Administrasi Kegiatan Wisuda Periode 2024/2025", 105, 24, { align: "center" });
    
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(15, 28, 195, 28);
    
    // Judul Dokumen
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(title, 15, 37);
    
    // Informasi & Tanggal cetak
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")} · Universitas Pembangunan Nasional`, 15, 42);
    
    let y = 48;
    const colWidths = headers.map(() => 180 / headers.length);
    
    // Render Table Headers
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(15, y, 180, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85); // slate-700
    
    let currentX = 15;
    headers.forEach((h, idx) => {
      doc.text(h, currentX + 2, y + 5.5);
      currentX += colWidths[idx];
    });
    
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.line(15, y + 8, 195, y + 8);
    y += 8;
    
    // Render Rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105); // slate-600
    
    rows.forEach((row, rowIdx) => {
      // Check page height overflow
      if (y + 8 > pageHeight - 20) {
        doc.addPage();
        y = 20;
        
        // Re-draw headers on new page
        doc.setFillColor(241, 245, 249);
        doc.rect(15, y, 180, 8, "F");
        doc.setFont("helvetica", "bold");
        doc.setTextColor(51, 65, 85);
        let cx = 15;
        headers.forEach((h, idx) => {
          doc.text(h, cx + 2, y + 5.5);
          cx += colWidths[idx];
        });
        doc.line(15, y + 8, 195, y + 8);
        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
      }
      
      // Zebra stripe styling
      if (rowIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(15, y, 180, 7.5, "F");
      }
      
      let cx = 15;
      row.forEach((cell, cellIdx) => {
        const val = String(cell ?? "-");
        // Truncate text block to prevent cell overlap
        const maxChars = Math.floor(colWidths[cellIdx] / 2.2);
        const truncated = val.length > maxChars ? val.substring(0, maxChars - 3) + "..." : val;
        
        doc.text(truncated, cx + 2, y + 5);
        cx += colWidths[cellIdx];
      });
      
      doc.setDrawColor(241, 245, 249); // slate-100 border tipis
      doc.line(15, y + 7.5, 195, y + 7.5);
      y += 7.5;
    });
    
    doc.save(filename);
  };

  // Main Handler for All Excel & PDF Exports
  const handleExport = async (type: string, format: "excel" | "pdf") => {
    setExporting(`${type}-${format}`);
    try {
      if (type === "kehadiran") {
        const res = await fetchWithAuth("/api/kehadiran?limit=5000");
        const json = await res.json();
        if (!json.success || !json.data?.data) {
          throw new Error("Gagal mengambil data kehadiran");
        }
        const rawData = json.data.data;

        if (format === "excel") {
          const exportData = rawData.map((u: any, idx: number) => ({
            No: idx + 1,
            NIM: u.mahasiswa?.nim ?? "-",
            Nama: u.mahasiswa?.nama ?? "-",
            Fakultas: u.mahasiswa?.fakultas ?? "-",
            Prodi: u.mahasiswa?.prodi ?? "-",
            "Sesi Wisuda": u.mahasiswa?.sesiWisuda ?? "Sesi Utama",
            "Status Kehadiran": u.statusKehadiran ?? "TIDAK_HADIR",
            "Waktu Scan": u.waktuScan ? new Date(u.waktuScan).toLocaleTimeString("id-ID") : "-",
            Catatan: u.catatan ?? "-",
          }));

          const ws = XLSX.utils.json_to_sheet(exportData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Kehadiran");
          XLSX.writeFile(wb, `Laporan_Kehadiran_Wisuda_${Date.now()}.xlsx`);
        } else {
          const headers = ["No", "NIM", "Nama Wisudawan", "Fakultas", "Sesi", "Status", "Waktu Scan"];
          const rows = rawData.map((u: any, idx: number) => [
            idx + 1,
            u.mahasiswa?.nim ?? "-",
            u.mahasiswa?.nama ?? "-",
            u.mahasiswa?.fakultas?.replace("Fakultas ", "F. ") ?? "-",
            u.mahasiswa?.sesiWisuda ?? "Sesi Utama",
            u.statusKehadiran ?? "TIDAK_HADIR",
            u.waktuScan ? new Date(u.waktuScan).toLocaleTimeString("id-ID") : "-",
          ]);
          generatePdfReport("LAPORAN KEHADIRAN WISUDAWAN", headers, rows, `Laporan_Kehadiran_Wisuda_${Date.now()}.pdf`);
        }
      } 
      
      else if (type === "wisudawan") {
        const res = await fetchWithAuth("/api/mahasiswa/export");
        const json = await res.json();
        if (!json.success || !json.data) {
          throw new Error("Gagal mengambil data wisudawan");
        }
        const rawData = json.data;

        if (format === "excel") {
          const ws = XLSX.utils.json_to_sheet(rawData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Wisudawan");
          XLSX.writeFile(wb, `Laporan_Data_Wisudawan_${Date.now()}.xlsx`);
        } else {
          const headers = ["No", "NIM", "Nama Wisudawan", "Fakultas", "Program Studi", "Status Verifikasi"];
          const rows = rawData.map((m: any) => [
            m.No,
            m.NIM,
            m.Nama,
            m.Fakultas?.replace("Fakultas ", "F. ") ?? "-",
            m["Program Studi"] ?? "-",
            m["Status Verifikasi"] ?? "-",
          ]);
          generatePdfReport("LAPORAN DATA WISUDAWAN TERDAFTAR", headers, rows, `Laporan_Data_Wisudawan_${Date.now()}.pdf`);
        }
      } 
      
      else if (type === "undangan") {
        const res = await fetchWithAuth("/api/undangan?limit=5000");
        const json = await res.json();
        if (!json.success || !json.data?.data) {
          throw new Error("Gagal mengambil data undangan");
        }
        const rawData = json.data.data;

        if (format === "excel") {
          const exportData = rawData.map((u: any, idx: number) => ({
            No: idx + 1,
            "Kode Undangan": u.kode,
            NIM: u.mahasiswa?.nim ?? "-",
            Nama: u.mahasiswa?.nama ?? "-",
            "Kuota Tamu": u.kuotaTamu,
            "Status Undangan": u.statusUndangan,
            "Tempat Wisuda": u.tempatWisuda,
            "Tanggal Wisuda": new Date(u.tanggalWisuda).toLocaleDateString("id-ID"),
          }));

          const ws = XLSX.utils.json_to_sheet(exportData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Undangan Digital");
          XLSX.writeFile(wb, `Laporan_Undangan_Digital_${Date.now()}.xlsx`);
        } else {
          const headers = ["No", "Kode Undangan", "NIM", "Nama Wisudawan", "Kuota Tamu", "Status QR"];
          const rows = rawData.map((u: any, idx: number) => [
            idx + 1,
            u.kode,
            u.mahasiswa?.nim ?? "-",
            u.mahasiswa?.nama ?? "-",
            u.kuotaTamu,
            u.statusUndangan,
          ]);
          generatePdfReport("LAPORAN PENGGUNAAN UNDANGAN DIGITAL (QR CODE)", headers, rows, `Laporan_Undangan_Digital_${Date.now()}.pdf`);
        }
      } 
      
      else if (type === "statistik") {
        const [statsRes, seatsRes] = await Promise.all([
          fetchWithAuth("/api/dashboard/stats"),
          fetchWithAuth("/api/dashboard/seats"),
        ]);
        const statsJson = await statsRes.json();
        const seatsJson = await seatsRes.json();

        if (!statsJson.success || !seatsJson.success) {
          throw new Error("Gagal memuat statistik");
        }

        const o = statsJson.data;
        const seats = seatsJson.data || [];

        // Hitung breakdown per fakultas
        const vipInvs = seats.slice(0, 20);
        const regularInvs = seats.slice(20);
        const facultyGroups: Record<string, any[]> = {};
        regularInvs.forEach((inv: any) => {
          if (!inv.mahasiswa) return;
          const fac = inv.mahasiswa.fakultas;
          if (!fac) return;
          if (!facultyGroups[fac]) facultyGroups[fac] = [];
          facultyGroups[fac].push(inv);
        });

        const blockData = [
          {
            name: "Blok VIP",
            total: vipInvs.length,
            hadir: vipInvs.filter((i: any) => i.kehadiran?.statusKehadiran === "HADIR" || i.kehadiran?.statusKehadiran === "TERLAMBAT").length,
          },
          {
            name: "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)",
            total: (facultyGroups["Fakultas Keguruan dan Ilmu Pendidikan (FKIP)"] || []).length,
            hadir: (facultyGroups["Fakultas Keguruan dan Ilmu Pendidikan (FKIP)"] || []).filter((i: any) => i.kehadiran?.statusKehadiran === "HADIR" || i.kehadiran?.statusKehadiran === "TERLAMBAT").length,
          },
          {
            name: "Fakultas Sains, Teknologi, dan Ilmu Kesehatan (FSTIK)",
            total: (facultyGroups["Fakultas Sains, Teknologi, dan Ilmu Kesehatan (FSTIK)"] || []).length,
            hadir: (facultyGroups["Fakultas Sains, Teknologi, dan Ilmu Kesehatan (FSTIK)"] || []).filter((i: any) => i.kehadiran?.statusKehadiran === "HADIR" || i.kehadiran?.statusKehadiran === "TERLAMBAT").length,
          },
        ];

        if (format === "excel") {
          const statsSummary = [
            { Parameter: "Total Wisudawan Terdaftar", Nilai: o.totalMahasiswa },
            { Parameter: "Total Undangan QR Aktif", Nilai: o.totalUndangan },
            { Parameter: "Wisudawan Sudah Hadir", Nilai: o.totalKehadiran },
            { Parameter: "Wisudawan Belum Hadir", Nilai: o.belumHadir },
            { Parameter: "Persentase Kehadiran", Nilai: `${o.persentaseKehadiran}%` },
            { Parameter: "Total Kapasitas Kursi", Nilai: o.kapasitasKursi },
            { Parameter: "Petugas Scan Aktif", Nilai: `${o.gateAktif}/${o.gateTotal}` },
          ];

          const blockSummary = blockData.map((b) => ({
            "Nama Blok/Fakultas": b.name,
            "Total Kursi": b.total,
            "Kursi Terisi (Hadir)": b.hadir,
            "Kursi Kosong": b.total - b.hadir,
            "Rasio Kehadiran": b.total > 0 ? `${Math.round((b.hadir / b.total) * 100)}%` : "0%",
          }));

          const ws1 = XLSX.utils.json_to_sheet(statsSummary);
          const ws2 = XLSX.utils.json_to_sheet(blockSummary);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws1, "Ringkasan Statistik");
          XLSX.utils.book_append_sheet(wb, ws2, "Rasio Per Blok");
          XLSX.writeFile(wb, `Laporan_Statistik_Acara_${Date.now()}.xlsx`);
        } else {
          // Buat PDF Statistik Kustom
          const doc = new jsPDF();
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.text("SISTEM INFORMASI WISUDA DIGITAL", 105, 18, { align: "center" });
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.text("Laporan Resmi Statistik & Evaluasi Wisuda Periode 2024/2025", 105, 24, { align: "center" });
          doc.line(15, 28, 195, 28);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.text("RINGKASAN STATISTIK EVALUASI ACARA", 15, 38);
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 15, 43);

          // Render Parameter Table
          let y = 50;
          doc.setFillColor(241, 245, 249);
          doc.rect(15, y, 180, 8, "F");
          doc.setFont("helvetica", "bold");
          doc.text("Parameter Metrik Wisuda", 18, y + 5.5);
          doc.text("Nilai Acara", 140, y + 5.5);
          y += 8;

          const statsRows = [
            ["Total Wisudawan Terdaftar", `${o.totalMahasiswa} wisudawan`],
            ["Total Undangan QR Aktif", `${o.totalUndangan} kartu`],
            ["Wisudawan Sudah Hadir (Check-in)", `${o.totalKehadiran} orang`],
            ["Wisudawan Belum Hadir (Absen)", `${o.belumHadir} orang`],
            ["Persentase Kehadiran", `${o.persentaseKehadiran}%`],
            ["Kapasitas Alokasi Kursi", `${o.kapasitasKursi} unit`],
            ["Scanner Gate Aktif", `${o.gateAktif} dari ${o.gateTotal} pos`],
          ];

          doc.setFont("helvetica", "normal");
          statsRows.forEach((r, idx) => {
            if (idx % 2 === 1) {
              doc.setFillColor(248, 250, 252);
              doc.rect(15, y, 180, 7, "F");
            }
            doc.text(r[0], 18, y + 4.5);
            doc.text(r[1], 140, y + 4.5);
            doc.line(15, y + 7, 195, y + 7);
            y += 7;
          });

          // Render Block Breakdown Table
          y += 10;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text("DISTRIBUSI KEHADIRAN PER BLOK RUANGAN", 15, y);
          y += 4;

          doc.setFillColor(241, 245, 249);
          doc.rect(15, y, 180, 8, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.text("Nama Blok / Fakultas", 18, y + 5.5);
          doc.text("Total Kursi", 110, y + 5.5);
          doc.text("Terisi (Hadir)", 135, y + 5.5);
          doc.text("Persentase", 165, y + 5.5);
          y += 8;

          doc.setFont("helvetica", "normal");
          blockData.forEach((b, idx) => {
            if (idx % 2 === 1) {
              doc.setFillColor(248, 250, 252);
              doc.rect(15, y, 180, 7.5, "F");
            }
            doc.text(b.name.replace("Fakultas ", "F. "), 18, y + 5);
            doc.text(String(b.total), 110, y + 5);
            doc.text(String(b.hadir), 135, y + 5);
            doc.text(b.total > 0 ? `${Math.round((b.hadir / b.total) * 100)}%` : "0%", 165, y + 5);
            doc.line(15, y + 7.5, 195, y + 7.5);
            y += 7.5;
          });

          doc.save(`Laporan_Statistik_Acara_${Date.now()}.pdf`);
        }
      }
      toast.success("Laporan berhasil diekspor dan diunduh!");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Gagal mengekspor laporan.");
    } finally {
      setExporting(null);
    }
  };

  // Download all reports at once sequential
  const handleExportAll = async () => {
    setExporting("all");
    try {
      toast.loading("Memulai ekspor semua laporan...", { id: "export-all" });
      await handleExport("kehadiran", "excel");
      await new Promise((resolve) => setTimeout(resolve, 800));
      await handleExport("wisudawan", "excel");
      await new Promise((resolve) => setTimeout(resolve, 800));
      await handleExport("undangan", "excel");
      await new Promise((resolve) => setTimeout(resolve, 800));
      await handleExport("statistik", "excel");
      toast.success("Seluruh laporan berhasil diekspor!", { id: "export-all" });
    } catch {
      toast.error("Gagal mengekspor semua laporan.", { id: "export-all" });
    } finally {
      setExporting(null);
    }
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
          onClick: () => handleExport("kehadiran", "excel"),
        },
        {
          label: "Export PDF",
          icon: FileText,
          onClick: () => handleExport("kehadiran", "pdf"),
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
          onClick: () => handleExport("wisudawan", "excel"),
        },
        {
          label: "Export PDF",
          icon: FileText,
          onClick: () => handleExport("wisudawan", "pdf"),
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
          onClick: () => handleExport("undangan", "excel"),
        },
        {
          label: "Export PDF",
          icon: FileText,
          onClick: () => handleExport("undangan", "pdf"),
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
          onClick: () => handleExport("statistik", "excel"),
        },
        {
          label: "Export PDF",
          icon: FileText,
          onClick: () => handleExport("statistik", "pdf"),
        },
      ],
      delay: 0.18,
    },
  ];

  return (
    <div className="dashboard-mesh relative -m-4 min-h-full space-y-5 overflow-hidden rounded-none p-4 sm:-m-6 sm:rounded-3xl sm:p-6">
      
      {/* Dynamic Processing Overlay */}
      <AnimatePresence>
        {exporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-3.5 rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#0c1120] border border-slate-200 dark:border-white/[0.08]">
              <Loader2 className="size-9 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="text-xs font-bold text-slate-800 dark:text-white/80">
                {exporting === "all" ? "Mengekspor semua data..." : "Sedang menyusun data dokumen..."}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-white/30">
                Mohon tunggu, jangan tutup halaman ini.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          onClick={handleExportAll}
          disabled={!!exporting}
          className={cn(
            "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[0.68rem] font-semibold transition-all active:scale-[0.97] disabled:opacity-50",
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
        <MiniStat
          label="Total Wisudawan"
          value={stats ? stats.totalMahasiswa.toLocaleString("id-ID") : "0"}
          color="text-slate-800 dark:text-white/80"
          loading={statsLoading}
        />
        <MiniStat
          label="Sudah Hadir"
          value={stats ? stats.totalKehadiran.toLocaleString("id-ID") : "0"}
          color="text-emerald-600 dark:text-emerald-400"
          loading={statsLoading}
        />
        <MiniStat
          label="QR Aktif"
          value={stats ? stats.totalUndangan.toLocaleString("id-ID") : "0"}
          color="text-blue-600 dark:text-blue-400"
          loading={statsLoading}
        />
        <MiniStat
          label="Kehadiran"
          value={stats ? `${stats.persentaseKehadiran}%` : "0%"}
          color="text-violet-600 dark:text-violet-400"
          loading={statsLoading}
        />
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
