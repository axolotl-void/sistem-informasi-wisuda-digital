import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { generateQrDataUrl } from "@/utils/qr";
import { Calendar, MapPin, Clock, Award } from "lucide-react";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function DosenInvitationPage({ params }: PageProps) {
  const { token } = await params;

  const dosen = await prisma.undanganDosen.findUnique({
    where: { qrToken: token },
  });

  if (!dosen) {
    notFound();
  }

  // Generate QR Code data URL (base64)
  const qrCodeUrl = await generateQrDataUrl(dosen.qrToken, {
    width: 300,
    margin: 1,
    color: {
      dark: "#0F172A", // Dark blue slate color
      light: "#FFFFFF",
    },
  });

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#070D19] flex flex-col items-center justify-center p-4 sm:p-6 text-white selection:bg-blue-500/30">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] rounded-full bg-blue-500/10 blur-[80px] sm:blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/3 -z-10 w-[250px] h-[250px] rounded-full bg-violet-500/10 blur-[90px]" />

      <div className="w-full max-w-md relative">
        {/* Top Mini Banner */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 rounded-full border border-blue-400/30 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
          Undangan Resmi
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.03] shadow-2xl backdrop-blur-xl p-6 sm:p-8 flex flex-col items-center text-center relative mt-4">
          {/* Card Border Highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

          {/* Logo / Header */}
          <div className="flex flex-col items-center gap-1.5 mb-6">
            <div className="size-14 rounded-2xl bg-white/[0.08] border border-white/10 p-2.5 flex items-center justify-center shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/logo-wusuda-2.png" alt="Logo UBBG" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-[0.15em] uppercase text-blue-400">MILAD & WISUDA</h1>
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/50">UNIVERSITAS BINA BANGSA GETSEMPENA</p>
            </div>
          </div>

          <div className="w-full h-px bg-white/[0.06] mb-6" />

          {/* Recipient Details */}
          <div className="space-y-1.5 mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400/80 flex items-center justify-center gap-1">
              <Award className="size-3" /> Kepada Yth. Bapak/Ibu:
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white leading-snug tracking-tight px-2">
              {dosen.nama}
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.02] text-xs font-semibold text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {dosen.jabatan}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="relative mb-6 p-4 rounded-3xl bg-white border border-white/10 shadow-xl shadow-black/30">
            <div className="relative overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt="QR Code Undangan Dosen"
                className="size-[200px] sm:size-[240px] object-contain"
              />
            </div>
            <div className="mt-2 text-[10px] font-black tracking-widest text-slate-500 font-mono select-all">
              {dosen.kode}
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-white/45 max-w-[280px] mb-6 font-medium">
            Silakan tunjukkan QR Code di atas kepada petugas pintu masuk (gate) saat memasuki ruangan acara.
          </p>

          <div className="w-full h-px bg-white/[0.06] mb-6" />

          {/* Event Details */}
          <div className="w-full grid grid-cols-2 gap-3 text-left">
            <div className="p-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.01] space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-400/80">
                <Calendar className="size-3" /> Tanggal
              </div>
              <p className="text-xs font-extrabold text-white/90 leading-tight">Sabtu, 20 Juni 2026</p>
              <p className="text-[10px] font-semibold text-white/40 leading-none">08.00 WIB</p>
            </div>
            <div className="p-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.01] space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-400/80">
                <MapPin className="size-3" /> Tempat
              </div>
              <p className="text-xs font-extrabold text-white/90 leading-tight">Auditorium Utama</p>
              <p className="text-[10px] font-semibold text-white/40 leading-none">Kampus UBBG</p>
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <p className="text-center text-[10px] font-medium text-white/20 mt-6 tracking-wide">
          Sistem Informasi Wisuda Digital © 2026 UBBG
        </p>
      </div>
    </div>
  );
}
