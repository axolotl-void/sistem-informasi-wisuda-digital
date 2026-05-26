"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Ticket, Download, Share2, Copy, Check,
  MapPin, Clock, Users, Loader2,
  CalendarDays, DoorOpen, Info, QrCode,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { PortalPageHeader } from "../_components/portal-page-header";
import { fetchWithAuth } from "@/lib/client-auth";

// --- Types --------------------------------------------------------------------

interface UndanganData {
  id: string;
  kode: string;
  qrToken: string;
  qrImageUrl: string | null;
  statusUndangan: "AKTIF" | "DIGUNAKAN" | "KADALUARSA" | "DIBATALKAN";
  tanggalWisuda: string;
  tempatWisuda: string;
  kuotaTamu: number;
}

interface MahasiswaData {
  id: string;
  nama: string;
  nim: string;
  prodi: string;
  fakultas: string;
  sesiWisuda: string | null;
  undangan: UndanganData | null;
}

// --- Helpers ------------------------------------------------------------------

function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function getSesiInfo(sesi: string | null) {
  if (!sesi) return { waktu: "—", gate: "Gate Utama" };
  const lower = sesi.toLowerCase();
  if (lower.includes("pagi") || lower.includes("1"))
    return { waktu: "08.00 – 12.00 WIB", gate: "Gate A" };
  if (lower.includes("siang") || lower.includes("2"))
    return { waktu: "13.00 – 16.00 WIB", gate: "Gate B" };
  if (lower.includes("sore") || lower.includes("3"))
    return { waktu: "16.00 – 19.00 WIB", gate: "Gate C" };
  return { waktu: "—", gate: "Gate Utama" };
}

// --- Status config ------------------------------------------------------------

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
  DIBATALKAN: {
    label: "Dibatalkan",
    dot: "bg-gray-400",
    text: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
  },
};

// --- Ticket Card --------------------------------------------------------------

function TicketCard({ mahasiswa, undangan, qrDataUrl }: {
  mahasiswa: MahasiswaData;
  undangan: UndanganData;
  qrDataUrl: string;
}) {
  const cfg = STATUS_CFG[undangan.statusUndangan] ?? STATUS_CFG.AKTIF;
  const { waktu, gate } = getSesiInfo(mahasiswa.sesiWisuda);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-b from-[#0d1829] to-[#080f1e] shadow-2xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 size-32 bg-blue-500/10 blur-3xl rounded-full" />

      {/* Header */}
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

      {/* Notch divider */}
      <div className="relative flex items-center px-4">
        <div className="size-5 rounded-full bg-[#060d1a] border border-white/[0.06] shrink-0 -ml-6" />
        <div className="flex-1 border-t border-dashed border-white/[0.08] mx-2" />
        <div className="size-5 rounded-full bg-[#060d1a] border border-white/[0.06] shrink-0 -mr-6" />
      </div>

      {/* QR Section */}
      <div className="flex flex-col items-center px-6 py-6 gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-2xl scale-110" />
          <div className="relative rounded-2xl bg-white p-4 shadow-2xl">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code undangan wisuda"
                width={200}
                height={200}
                className="block h-auto w-full max-w-[200px]"
              />
            ) : (
              <div className="size-[180px] flex items-center justify-center">
                <Loader2 className="size-8 text-gray-300 animate-spin" />
              </div>
            )}
          </div>
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
        <div className="text-center">
          <p className="font-mono text-xs font-bold text-white/50 tracking-widest">{undangan.kode}</p>
          <p className="text-[0.6rem] text-white/20 mt-0.5">Tunjukkan QR ini kepada petugas</p>
        </div>
      </div>

      {/* Notch divider */}
      <div className="relative flex items-center px-4">
        <div className="size-5 rounded-full bg-[#060d1a] border border-white/[0.06] shrink-0 -ml-6" />
        <div className="flex-1 border-t border-dashed border-white/[0.08] mx-2" />
        <div className="size-5 rounded-full bg-[#060d1a] border border-white/[0.06] shrink-0 -mr-6" />
      </div>

      {/* Info */}
      <div className="px-6 py-5 space-y-3">
        <div className="text-center pb-3 border-b border-white/[0.05]">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/25">Nama Wisudawan</p>
          <p className="text-base font-black text-white/90 mt-1">{mahasiswa.nama}</p>
          <p className="text-[0.7rem] text-white/35">{mahasiswa.nim} · {mahasiswa.prodi}</p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {[
            { icon: Clock, label: "Sesi", value: mahasiswa.sesiWisuda ?? "—" },
            { icon: CalendarDays, label: "Tanggal", value: formatTanggal(undangan.tanggalWisuda) },
            { icon: MapPin, label: "Gedung", value: undangan.tempatWisuda },
            { icon: DoorOpen, label: "Gate Masuk", value: gate },
            { icon: Clock, label: "Waktu", value: waktu },
            { icon: Users, label: "Kuota Tamu", value: `${undangan.kuotaTamu} orang` },
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

      {/* Gate instruction */}
      <div className="mx-4 mb-5 rounded-2xl border border-blue-500/15 bg-blue-500/[0.07] px-4 py-3">
        <div className="flex items-start gap-2.5">
          <Info className="size-4 text-blue-400/60 shrink-0 mt-0.5" />
          <div>
            <p className="text-[0.7rem] font-bold text-blue-400/80">Instruksi Gate Masuk</p>
            <p className="text-[0.65rem] text-white/30 mt-0.5 leading-relaxed">
              Hadir 30 menit sebelum acara dimulai. Masuk melalui <strong className="text-white/50">{gate}</strong>.
              Tunjukkan QR Code ini kepada petugas scan di pintu masuk.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
    </div>
  );
}

// --- Empty State --------------------------------------------------------------

function NoTicket() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-white/[0.07] bg-white/[0.03] py-16 px-6 text-center"
    >
      <div className="flex size-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] mb-4">
        <QrCode className="size-8 text-white/15" />
      </div>
      <p className="text-sm font-bold text-white/40 mb-1">Undangan Belum Tersedia</p>
      <p className="text-xs text-white/20 leading-relaxed max-w-xs">
        Ajukan permintaan tamu di menu <strong className="text-white/35">Tamu</strong> dan tunggu persetujuan admin untuk mendapatkan E-Ticket.
      </p>
    </motion.div>
  );
}

// --- Page ---------------------------------------------------------------------

export default function TiketPage() {
  const [mahasiswa, setMahasiswa] = useState<MahasiswaData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchWithAuth("/api/portal/me")
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
          setMahasiswa(result.data);
          // Generate QR dari token REAL di database
          const qrToken = result.data.undangan?.qrToken;
          if (qrToken) {
            QRCode.toDataURL(qrToken, {
              width: 300,
              margin: 2,
              errorCorrectionLevel: "H",
              color: { dark: "#1e293b", light: "#ffffff" },
            })
              .then(setQrDataUrl)
              .catch(() => {});
          }
        }
      })
      .catch(() => toast.error("Gagal memuat E-Ticket"))
      .finally(() => setIsLoading(false));
  }, []);

  const undangan = mahasiswa?.undangan ?? null;

  function handleCopy() {
    if (!undangan) return;
    navigator.clipboard.writeText(undangan.kode).then(() => {
      setCopied(true);
      toast.success("Kode undangan disalin");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleShare() {
    if (!mahasiswa || !undangan) return;
    const { waktu, gate } = getSesiInfo(mahasiswa.sesiWisuda);
    const text = `🎓 Undangan Wisuda Digital\n👤 ${mahasiswa.nama}\n🎫 Kode: ${undangan.kode}\n📅 ${formatTanggal(undangan.tanggalWisuda)}\n🕐 ${mahasiswa.sesiWisuda ?? "—"} (${waktu})\n📍 ${undangan.tempatWisuda}`;
    if (navigator.share) {
      navigator.share({ title: "Undangan Wisuda", text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  }

  async function handleDownload() {
    if (!qrDataUrl || !mahasiswa || !undangan) return;
    setIsDownloading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { waktu, gate } = getSesiInfo(mahasiswa.sesiWisuda);
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
      pdf.text(mahasiswa.nama, 42.5, 68, { align: "center" });

      pdf.setFontSize(7);
      pdf.setTextColor(147, 197, 253);
      pdf.text(mahasiswa.nim, 42.5, 73, { align: "center" });

      const rows = [
        ["Sesi", mahasiswa.sesiWisuda ?? "—"],
        ["Tanggal", formatTanggal(undangan.tanggalWisuda)],
        ["Waktu", waktu],
        ["Gedung", undangan.tempatWisuda],
        ["Gate", gate],
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
      pdf.text(undangan.kode, 42.5, 143, { align: "center" });

      pdf.save(`e-ticket-${undangan.kode}.pdf`);
      toast.success("E-Ticket berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh E-Ticket");
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 rounded-2xl bg-white/[0.03] animate-pulse" />
        <div className="h-[500px] rounded-3xl bg-white/[0.03] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PortalPageHeader
        icon={Ticket}
        iconClassName="text-violet-400"
        title="E-Ticket"
        subtitle="Undangan digital wisuda Anda — siap discan di gate"
      />

      {/* Ticket atau empty state */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        {mahasiswa && undangan ? (
          <TicketCard mahasiswa={mahasiswa} undangan={undangan} qrDataUrl={qrDataUrl} />
        ) : (
          <NoTicket />
        )}
      </motion.div>

      {/* Actions — hanya tampil jika ada undangan */}
      {undangan && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
        >
          {[
            { icon: isDownloading ? Loader2 : Download, label: isDownloading ? "Mengunduh..." : "Download", onClick: handleDownload, variant: "primary", disabled: isDownloading, spin: isDownloading },
            { icon: Share2, label: "Bagikan", onClick: handleShare, variant: "default", disabled: false, spin: false },
            { icon: copied ? Check : Copy, label: copied ? "Tersalin!" : "Salin Kode", onClick: handleCopy, variant: copied ? "success" : "default", disabled: false, spin: false },
          ].map(({ icon: Icon, label, onClick, variant, disabled, spin }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              disabled={disabled}
              className={`flex min-h-[52px] flex-col items-center justify-center gap-1.5 rounded-2xl border py-3.5 text-[0.75rem] font-semibold transition-all touch-manipulation active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-0 ${
                variant === "primary" ? "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/15"
                : variant === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-white/[0.08] bg-white/[0.04] text-white/40 hover:bg-white/[0.07] hover:text-white/60"
              }`}
            >
              <Icon className={`size-5 ${spin ? "animate-spin" : ""}`} />
              {label}
            </button>
          ))}
        </motion.div>
      )}

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
