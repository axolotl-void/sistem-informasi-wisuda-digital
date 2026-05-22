"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Ticket, Download, Share2, Copy, Check,
  MapPin, Clock, Users, QrCode, Loader2,
  CalendarDays, DoorOpen, Info,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_TICKET = {
  kode: "WIS-2025-A001",
  qrToken: "WIS-23210056-A001-PAGI-2025",
  nama: "Ahmad Pratama",
  nim: "23210056",
  fakultas: "Fakultas Teknik",
  prodi: "Teknik Informatika",
  sesi: "Sesi 2 — Siang",
  waktu: "13.00 – 16.00 WIB",
  tanggal: "Sabtu, 24 Mei 2025",
  gedung: "Auditorium Utama",
  gate: "Gate B",
  kuotaTamu: 3,
  status: "AKTIF" as "AKTIF" | "DIGUNAKAN" | "KADALUARSA",
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG = {
  AKTIF: {
    label: "QR Aktif",
    dot: "bg-emerald-400 animate-pulse",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  DIGUNAKAN: {
    label: "Sudah Digunakan",
    dot: "bg-blue-400",
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  KADALUARSA: {
    label: "Kadaluarsa",
    dot: "bg-red-400",
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
};

// ─── Ticket Card ──────────────────────────────────────────────────────────────

function TicketCard({
  ticket, qrDataUrl,
}: {
  ticket: typeof MOCK_TICKET;
  qrDataUrl: string;
}) {
  const cfg = STATUS_CFG[ticket.status];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-b from-[#0d1829] to-[#080f1e] shadow-2xl">
      {/* Top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 size-32 bg-blue-500/10 blur-3xl rounded-full" />

      {/* Header strip */}
      <div className="relative px-6 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-blue-400/60">
              Universitas Nusantara
            </p>
            <h2 className="text-lg font-black text-white/90 mt-0.5 leading-tight">
              Undangan Wisuda
            </h2>
            <p className="text-[0.65rem] text-white/30 mt-0.5">Periode 2024/2025</p>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 border ${cfg.bg} ${cfg.border}`}>
            <span className={`size-1.5 rounded-full ${cfg.dot}`} />
            <span className={`text-[0.6rem] font-bold ${cfg.text}`}>{cfg.label}</span>
          </div>
        </div>
      </div>

      {/* Divider with notch */}
      <div className="relative flex items-center px-4">
        <div className="size-5 rounded-full bg-[#060d1a] border border-white/[0.06] shrink-0 -ml-6" />
        <div className="flex-1 border-t border-dashed border-white/[0.08] mx-2" />
        <div className="size-5 rounded-full bg-[#060d1a] border border-white/[0.06] shrink-0 -mr-6" />
      </div>

      {/* QR Section */}
      <div className="flex flex-col items-center px-6 py-6 gap-4">
        {/* QR Code */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-2xl scale-110" />
          <div className="relative rounded-2xl bg-white p-4 shadow-2xl">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" width={180} height={180} className="block" />
            ) : (
              <div className="size-[180px] flex items-center justify-center">
                <Loader2 className="size-8 text-gray-300 animate-spin" />
              </div>
            )}
          </div>
          {/* Corner decorations */}
          {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos) => (
            <div key={pos} className={`absolute ${pos} size-4 border-2 border-blue-400/40 rounded-sm`}
              style={{
                borderRight: pos.includes("right") ? undefined : "none",
                borderLeft: pos.includes("left") ? undefined : "none",
                borderBottom: pos.includes("bottom") ? undefined : "none",
                borderTop: pos.includes("top") ? undefined : "none",
              }}
            />
          ))}
        </div>

        {/* Kode */}
        <div className="text-center">
          <p className="font-mono text-xs font-bold text-white/50 tracking-widest">{ticket.kode}</p>
          <p className="text-[0.6rem] text-white/20 mt-0.5">Tunjukkan QR ini kepada petugas</p>
        </div>
      </div>

      {/* Divider */}
      <div className="relative flex items-center px-4">
        <div className="size-5 rounded-full bg-[#060d1a] border border-white/[0.06] shrink-0 -ml-6" />
        <div className="flex-1 border-t border-dashed border-white/[0.08] mx-2" />
        <div className="size-5 rounded-full bg-[#060d1a] border border-white/[0.06] shrink-0 -mr-6" />
      </div>

      {/* Info Section */}
      <div className="px-6 py-5 space-y-3">
        {/* Nama */}
        <div className="text-center pb-3 border-b border-white/[0.05]">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/25">Nama Wisudawan</p>
          <p className="text-base font-black text-white/90 mt-1">{ticket.nama}</p>
          <p className="text-[0.7rem] text-white/35">{ticket.nim} · {ticket.prodi}</p>
        </div>

        {/* Detail grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { icon: Clock, label: "Sesi", value: ticket.sesi },
            { icon: CalendarDays, label: "Tanggal", value: ticket.tanggal },
            { icon: MapPin, label: "Gedung", value: ticket.gedung },
            { icon: DoorOpen, label: "Gate Masuk", value: ticket.gate },
            { icon: Clock, label: "Waktu", value: ticket.waktu },
            { icon: Users, label: "Kuota Tamu", value: `${ticket.kuotaTamu} orang` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="size-3 text-white/20" />
                <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-white/25">{label}</p>
              </div>
              <p className="text-[0.78rem] font-bold text-white/70 leading-tight">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gate instruction banner */}
      <div className="mx-4 mb-5 rounded-2xl border border-blue-500/15 bg-blue-500/[0.07] px-4 py-3">
        <div className="flex items-start gap-2.5">
          <Info className="size-4 text-blue-400/60 shrink-0 mt-0.5" />
          <div>
            <p className="text-[0.7rem] font-bold text-blue-400/80">Instruksi Gate Masuk</p>
            <p className="text-[0.65rem] text-white/30 mt-0.5 leading-relaxed">
              Hadir 30 menit sebelum acara dimulai. Masuk melalui <strong className="text-white/50">{ticket.gate}</strong>.
              Tunjukkan QR Code ini kepada petugas scan di pintu masuk.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom glow */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TiketPage() {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(MOCK_TICKET.qrToken, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#1e293b", light: "#ffffff" },
    })
      .then(setQrDataUrl)
      .catch(() => {});
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText(MOCK_TICKET.kode).then(() => {
      setCopied(true);
      toast.success("Kode undangan disalin");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleShare() {
    const text = `🎓 Undangan Wisuda Digital\n👤 ${MOCK_TICKET.nama}\n🎫 Kode: ${MOCK_TICKET.kode}\n📅 ${MOCK_TICKET.tanggal}\n🕐 ${MOCK_TICKET.sesi} (${MOCK_TICKET.waktu})\n📍 ${MOCK_TICKET.gedung}`;
    if (navigator.share) {
      navigator.share({ title: "Undangan Wisuda", text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  }

  async function handleDownload() {
    if (!qrDataUrl) return;
    setIsDownloading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [85, 150] });

      pdf.setFillColor(8, 15, 30);
      pdf.rect(0, 0, 85, 150, "F");

      pdf.setTextColor(147, 197, 253);
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "bold");
      pdf.text("UNIVERSITAS NUSANTARA", 42.5, 8, { align: "center" });

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.text("UNDANGAN WISUDA", 42.5, 15, { align: "center" });

      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(0.2);
      pdf.line(10, 18, 75, 18);

      pdf.addImage(qrDataUrl, "PNG", 22.5, 22, 40, 40);

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text(MOCK_TICKET.nama, 42.5, 68, { align: "center" });

      pdf.setFontSize(7);
      pdf.setTextColor(147, 197, 253);
      pdf.text(MOCK_TICKET.nim, 42.5, 73, { align: "center" });

      const rows = [
        ["Sesi", MOCK_TICKET.sesi],
        ["Tanggal", MOCK_TICKET.tanggal],
        ["Waktu", MOCK_TICKET.waktu],
        ["Gedung", MOCK_TICKET.gedung],
        ["Gate", MOCK_TICKET.gate],
      ];

      let y = 82;
      rows.forEach(([label, value]) => {
        pdf.setFontSize(6);
        pdf.setTextColor(100, 116, 139);
        pdf.text(label, 12, y);
        pdf.setTextColor(200, 220, 255);
        pdf.text(value, 73, y, { align: "right" });
        pdf.setDrawColor(30, 41, 59);
        pdf.setLineWidth(0.1);
        pdf.line(12, y + 1.5, 73, y + 1.5);
        y += 8;
      });

      pdf.setFontSize(5.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text("Tunjukkan QR Code ini kepada petugas saat memasuki venue", 42.5, 138, { align: "center" });
      pdf.text(MOCK_TICKET.kode, 42.5, 143, { align: "center" });

      pdf.save(`e-ticket-${MOCK_TICKET.kode}.pdf`);
      toast.success("E-Ticket berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh E-Ticket");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
          <Ticket className="size-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white/90">E-Ticket</h1>
          <p className="text-xs text-white/30">Undangan digital wisuda Anda</p>
        </div>
      </div>

      {/* Ticket */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <TicketCard ticket={MOCK_TICKET} qrDataUrl={qrDataUrl} />
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-2.5"
      >
        {[
          {
            icon: isDownloading ? Loader2 : Download,
            label: isDownloading ? "Mengunduh..." : "Download",
            onClick: handleDownload,
            variant: "primary",
            disabled: isDownloading,
            spin: isDownloading,
          },
          {
            icon: Share2,
            label: "Bagikan",
            onClick: handleShare,
            variant: "default",
            disabled: false,
            spin: false,
          },
          {
            icon: copied ? Check : Copy,
            label: copied ? "Tersalin!" : "Salin Kode",
            onClick: handleCopy,
            variant: copied ? "success" : "default",
            disabled: false,
            spin: false,
          },
        ].map(({ icon: Icon, label, onClick, variant, disabled, spin }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-3.5 text-[0.7rem] font-semibold transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed ${
              variant === "primary"
                ? "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/15"
                : variant === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-white/[0.08] bg-white/[0.04] text-white/40 hover:bg-white/[0.07] hover:text-white/60"
            }`}
          >
            <Icon className={`size-5 ${spin ? "animate-spin" : ""}`} />
            {label}
          </button>
        ))}
      </motion.div>

      {/* Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center text-[0.68rem] text-white/20 leading-relaxed"
      >
        Simpan atau screenshot E-Ticket ini. Tunjukkan QR Code kepada petugas saat memasuki venue wisuda.
      </motion.p>
    </div>
  );
}
