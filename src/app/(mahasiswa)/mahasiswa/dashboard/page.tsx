"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  GraduationCap, QrCode, Calendar, MapPin,
  Users, CheckCircle2, Clock, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { API_ROUTES, ROUTES } from "@/utils/constants";
import { formatDate } from "@/utils/format";
import type { Mahasiswa } from "@/types/mahasiswa.type";
import type { Undangan } from "@/types/undangan.type";

// ─── Info card ────────────────────────────────────────────────────────────────

function InfoCard({
  label, value, icon: Icon, delay,
}: {
  label: string; value: string; icon: React.ElementType; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
          <Icon className="size-4 text-blue-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/25">{label}</p>
          <p className="text-sm font-semibold text-white/70 truncate mt-0.5">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MahasiswaDashboardPage() {
  const { user } = useAuth();
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa | null>(null);
  const [undangan, setUndangan] = useState<Undangan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetch = async () => {
      try {
        const [mRes, uRes] = await Promise.all([
          axios.get(`${API_ROUTES.MAHASISWA.BASE}/${user.id}`),
          axios.get(API_ROUTES.UNDANGAN.BASE, { params: { mahasiswaId: user.id } }),
        ]);
        setMahasiswa(mRes.data.data);
        setUndangan(uRes.data.data?.data?.[0] ?? null);
      } catch { /* silent */ }
      finally { setIsLoading(false); }
    };
    fetch();
  }, [user?.id]);

  const statusUndangan = undangan?.statusUndangan;
  const statusCfg = {
    AKTIF:     { label: "QR Aktif",        color: "text-blue-400",    bg: "bg-blue-500/10",    dot: "bg-blue-400 animate-pulse" },
    DIGUNAKAN: { label: "Sudah Digunakan", color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
    KADALUARSA:{ label: "Kadaluarsa",      color: "text-orange-400",  bg: "bg-orange-500/10",  dot: "bg-orange-400" },
    DIBATALKAN:{ label: "Dibatalkan",      color: "text-red-400",     bg: "bg-red-500/10",     dot: "bg-red-400" },
  };
  const cfg = statusUndangan ? statusCfg[statusUndangan] : null;

  return (
    <div className="space-y-6">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 60%)" }}
      />

      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
            <GraduationCap className="size-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white/90">
              Selamat Datang{mahasiswa ? `, ${mahasiswa.nama.split(" ")[0]}` : ""}
            </h1>
            <p className="text-sm text-white/30 mt-0.5">Portal Wisuda Digital</p>
          </div>
        </div>
      </motion.div>

      {/* Mahasiswa info */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : mahasiswa ? (
        <div className="relative z-10 grid grid-cols-2 gap-3">
          <InfoCard label="NIM" value={mahasiswa.nim} icon={GraduationCap} delay={0.05} />
          <InfoCard label="Fakultas" value={mahasiswa.fakultas} icon={MapPin} delay={0.1} />
          <InfoCard label="Program Studi" value={mahasiswa.prodi} icon={GraduationCap} delay={0.15} />
          <InfoCard label="Angkatan" value={String(mahasiswa.angkatan)} icon={Calendar} delay={0.2} />
        </div>
      ) : null}

      {/* Undangan status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="relative z-10 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white/70">Status Undangan Wisuda</p>
          {cfg && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${cfg.bg} ${cfg.color} ring-current/20`}>
              <span className={`size-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-3 rounded-full bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        ) : undangan ? (
          <div className="space-y-3">
            {[
              { icon: Calendar, label: "Tanggal", value: formatDate(undangan.tanggalWisuda) },
              { icon: MapPin, label: "Tempat", value: undangan.tempatWisuda },
              { icon: Users, label: "Kuota Tamu", value: `${undangan.kuotaTamu} orang` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div className="flex items-center gap-2">
                  <Icon className="size-3.5 text-white/25" />
                  <span className="text-xs text-white/35">{label}</span>
                </div>
                <span className="text-xs font-medium text-white/60">{value}</span>
              </div>
            ))}

            <Link
              href={ROUTES.MAHASISWA.UNDANGAN}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 py-2.5 text-xs font-semibold text-blue-400 transition-all hover:border-blue-500/50 hover:bg-blue-500/15"
            >
              <QrCode className="size-3.5" />
              Lihat QR Undangan
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <Clock className="size-8 text-white/10 mb-2" />
            <p className="text-sm text-white/30">Undangan belum tersedia</p>
            <p className="text-xs text-white/20 mt-1">Hubungi admin fakultas Anda</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
