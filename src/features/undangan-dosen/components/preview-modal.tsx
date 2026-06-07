"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { X, Copy, MessageSquare, ExternalLink, Calendar, MapPin, Award } from "lucide-react";
import { toast } from "sonner";
import {
  LiquidGlassCard,
  glassBtnPrimary,
  glassBtnGhost,
} from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";

interface PreviewModalProps {
  item: any | null;
  open: boolean;
  onClose: () => void;
}

export function PreviewUndanganDosenModal({
  item,
  open,
  onClose,
}: PreviewModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (item && item.qrToken) {
      QRCode.toDataURL(item.qrToken, {
        width: 280,
        margin: 1,
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("Gagal generate QR Code preview", err));
    }
  }, [item]);

  if (!open || !item) return null;

  // Build public URL
  const publicUrl = `${window.location.origin}/undangan/dosen/${item.qrToken}`;

  const messageText = `Yth. Bapak/Ibu *${item.nama}*,

Dengan hormat, kami mengundang Anda untuk menghadiri Sidang Senat Terbuka Wisuda UBBG Periode 2026/2027.

Berikut adalah tautan undangan digital resmi Anda yang dilengkapi QR Code kehadiran:
${publicUrl}

Mohon tunjukkan QR Code tersebut kepada petugas di pintu masuk (gate) saat tiba di lokasi.

Terima kasih,
*Panitia Wisuda UBBG*`;

  const waHref = item.noWa
    ? `https://api.whatsapp.com/send?phone=${item.noWa.replace(/\D/g, "")}&text=${encodeURIComponent(messageText)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Tautan undangan disalin ke clipboard");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md">
        {/* Header toolbar */}
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-white border border-white/10 hover:bg-white/20 transition-all cursor-pointer shadow-lg"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Card Canvas - Simulating mobile view */}
        <div className="overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#070D19]/90 shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center relative max-h-[85vh] overflow-y-auto">
          {/* Card Border Highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

          {/* Logo / Header */}
          <div className="flex flex-col items-center gap-1 mb-5">
            <div className="size-11 rounded-xl bg-white/[0.08] border border-white/10 p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/logo-wusuda-2.png" alt="Logo UBBG" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-[11px] font-extrabold tracking-[0.15em] uppercase text-blue-400">MILAD & WISUDA</h1>
              <p className="text-[8.5px] font-medium tracking-[0.2em] uppercase text-white/50">UNIVERSITAS BINA BANGSA GETSEMPENA</p>
            </div>
          </div>

          <div className="w-full h-px bg-white/[0.06] mb-5" />

          {/* Recipient Details */}
          <div className="space-y-1.5 mb-5 w-full">
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400/80 flex items-center justify-center gap-1">
              <Award className="size-2.5" /> Kepada Yth. Bapak/Ibu:
            </span>
            <h2 className="text-base font-black text-white leading-snug tracking-tight truncate px-1">
              {item.nama}
            </h2>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-[10px] font-semibold text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {item.jabatan}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="relative mb-5 p-3 rounded-2xl bg-white border border-white/10 shadow-lg">
            {qrCodeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrCodeUrl}
                alt="QR Code Undangan Dosen"
                className="size-[180px] object-contain"
              />
            ) : (
              <div className="size-[180px] flex items-center justify-center text-slate-300 font-mono text-xs">
                Generating QR...
              </div>
            )}
            <div className="mt-1 text-[9px] font-black tracking-widest text-slate-500 font-mono">
              {item.kode}
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-2 text-left text-white/95 text-[10px] mb-5">
            <div className="p-2.5 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-0.5">
              <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-blue-400/80">
                <Calendar className="size-2.5" /> Tanggal
              </div>
              <p className="font-extrabold">Sabtu, 20 Juni 2026</p>
              <p className="text-white/40">08.00 WIB</p>
            </div>
            <div className="p-2.5 rounded-xl border border-white/[0.04] bg-white/[0.01] space-y-0.5">
              <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-blue-400/80">
                <MapPin className="size-2.5" /> Tempat
              </div>
              <p className="font-extrabold">Auditorium Utama</p>
              <p className="text-white/40">Kampus UBBG</p>
            </div>
          </div>

          <div className="w-full h-px bg-white/[0.06] mb-5" />

          {/* Admin Share Controls */}
          <div className="w-full space-y-3">
            {/* Direct Link Input */}
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 h-9 text-[10px] font-mono text-white/70 select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                title="Salin Tautan"
              >
                <Copy className="size-3.5" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  glassBtnPrimary,
                  "h-10 flex-1 justify-center text-xs font-bold flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 border border-emerald-400/30 text-white shadow-lg shadow-emerald-500/10 hover:brightness-105"
                )}
              >
                <MessageSquare className="size-4" /> Kirim WhatsApp
              </a>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  glassBtnGhost,
                  "h-10 px-3 justify-center text-xs font-bold border border-white/10 text-white rounded-xl bg-white/5"
                )}
                title="Buka Halaman Undangan"
              >
                <ExternalLink className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
