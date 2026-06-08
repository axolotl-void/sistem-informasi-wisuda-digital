"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/axios";
import {
  QrCode, Download, Share2, Calendar,
  MapPin, Users, FileText, Copy, Check,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { useAuth } from "@/hooks/use-auth";
import { API_ROUTES } from "@/utils/constants";
import { formatDate } from "@/utils/format";
import type { Undangan } from "@/types/undangan.type";

export default function MahasiswaUndanganPage() {
  const { user } = useAuth();
  const [undangan, setUndangan] = useState<Undangan | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    api.get(API_ROUTES.UNDANGAN.BASE, { params: { mahasiswaId: user.id } })
      .then((res) => {
        const inv = res.data.data?.data?.[0] ?? null;
        setUndangan(inv);
        if (inv?.qrToken) {
          QRCode.toDataURL(inv.qrToken, {
            width: 280, margin: 2, errorCorrectionLevel: "H",
            color: { dark: "#1e293b", light: "#ffffff" },
          }).then(setQrDataUrl).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const handleDownload = async () => {
    if (!undangan || !qrDataUrl) return;
    setIsExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });

      // Background
      pdf.setFillColor(8, 15, 30);
      pdf.rect(0, 0, 148, 210, "F");

      // Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("UNDANGAN WISUDA", 74, 20, { align: "center" });

      pdf.setFontSize(10);
      pdf.setTextColor(147, 197, 253);
      pdf.text("Universitas Nusantara", 74, 28, { align: "center" });

      // Divider
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(0.3);
      pdf.line(20, 33, 128, 33);

      // Student info
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(undangan.mahasiswa?.nama ?? "—", 74, 44, { align: "center" });

      pdf.setFontSize(9);
      pdf.setTextColor(147, 197, 253);
      pdf.text(`NIM: ${undangan.mahasiswa?.nim ?? "—"}`, 74, 51, { align: "center" });

      // Details
      const details = [
        ["Tanggal", formatDate(undangan.tanggalWisuda)],
        ["Tempat", undangan.tempatWisuda],
        ["Kuota Tamu", `${undangan.kuotaTamu} orang`],
        ["Kode", undangan.kode],
      ];

      let y = 62;
      details.forEach(([label, value]) => {
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(label, 20, y);
        pdf.setTextColor(200, 220, 255);
        pdf.text(value, 128, y, { align: "right" });
        pdf.setDrawColor(30, 41, 59);
        pdf.setLineWidth(0.1);
        pdf.line(20, y + 2, 128, y + 2);
        y += 10;
      });

      // QR Code
      if (qrDataUrl) {
        pdf.addImage(qrDataUrl, "PNG", 44, 115, 60, 60);
      }

      pdf.setFontSize(7);
      pdf.setTextColor(71, 85, 105);
      pdf.text("Tunjukkan QR Code ini saat memasuki venue", 74, 182, { align: "center" });
      pdf.text(undangan.kode, 74, 187, { align: "center" });

      pdf.save(`undangan-${undangan.kode}.pdf`);
      toast.success("PDF berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    if (!undangan) return;
    const text = `Undangan Wisuda Digital\n${undangan.mahasiswa?.nama}\nKode: ${undangan.kode}\nTanggal: ${formatDate(undangan.tanggalWisuda)}\nTempat: ${undangan.tempatWisuda}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = () => {
    if (!undangan) return;
    navigator.clipboard.writeText(undangan.kode).then(() => {
      setCopied(true);
      toast.success("Kode disalin");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-5">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 60%)" }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center gap-4"
      >
        <div className="flex size-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
          <QrCode className="size-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white/90">Undangan Wisuda</h1>
          <p className="text-sm text-white/30 mt-0.5">QR Code undangan digital Anda</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-64 rounded-2xl bg-white/[0.03] animate-pulse" />
          <div className="h-32 rounded-2xl bg-white/[0.03] animate-pulse" />
        </div>
      ) : !undangan ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03] py-16 text-center"
        >
          <QrCode className="size-10 text-white/10 mb-3" />
          <p className="text-sm font-semibold text-white/30">Undangan belum tersedia</p>
          <p className="text-xs text-white/20 mt-1">Hubungi admin fakultas Anda</p>
        </motion.div>
      ) : (
        <>
          {/* QR Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="relative z-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6"
          >
            {/* QR Code */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-blue-500/15 blur-xl" />
                <div className="relative rounded-2xl bg-white p-4 shadow-2xl">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Code" width={200} height={200} />
                  ) : (
                    <div className="size-[200px] bg-gray-100 rounded-lg animate-pulse" />
                  )}
                </div>
              </div>
              <div className="text-center">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/25">Kode Undangan</p>
                <p className="mt-1 font-mono text-sm font-bold text-white/70">{undangan.kode}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-0 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              {[
                { icon: Calendar, label: "Tanggal Wisuda", value: formatDate(undangan.tanggalWisuda) },
                { icon: MapPin, label: "Tempat", value: undangan.tempatWisuda },
                { icon: Users, label: "Kuota Tamu", value: `${undangan.kuotaTamu} orang` },
              ].map(({ icon: Icon, label, value }, i) => (
                <div key={label} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-t border-white/[0.04]" : ""}`}>
                  <div className="flex items-center gap-2">
                    <Icon className="size-3.5 text-white/25" />
                    <span className="text-xs text-white/35">{label}</span>
                  </div>
                  <span className="text-xs font-semibold text-white/60">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative z-10 grid grid-cols-2 gap-3"
          >
            {[
              {
                icon: isExporting ? FileText : Download,
                label: isExporting ? "Mengunduh..." : "Download PDF",
                onClick: handleDownload,
                variant: "primary",
                disabled: isExporting,
              },
              {
                icon: Share2,
                label: "Bagikan",
                onClick: handleShare,
                variant: "default",
                disabled: false,
              },
              {
                icon: copied ? Check : Copy,
                label: copied ? "Tersalin!" : "Salin Kode",
                onClick: handleCopy,
                variant: "default",
                disabled: false,
              },
              {
                icon: FileText,
                label: "Print",
                onClick: () => window.print(),
                variant: "default",
                disabled: false,
              },
            ].map(({ icon: Icon, label, onClick, variant, disabled }) => (
              <button
                key={label}
                type="button"
                onClick={onClick}
                disabled={disabled}
                className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer ${
                  variant === "primary"
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/15"
                    : "border-white/[0.08] bg-white/[0.04] text-white/50 hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-white/70"
                }`}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </motion.div>

          {/* Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 text-center text-[0.7rem] text-white/20"
          >
            Tunjukkan QR Code ini kepada petugas saat memasuki venue wisuda
          </motion.p>
        </>
      )}
    </div>
  );
}
