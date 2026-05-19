"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList, Search, Download, RefreshCw,
  CheckCircle2, XCircle, Clock, TrendingUp, ChevronDown,
} from "lucide-react";
import { useSocket } from "@/hooks/use-socket";
import { useDashboardStore } from "@/store/dashboard.store";

// ─── Types ────────────────────────────────────────────────────────────────────

type AttendanceStatus = "HADIR" | "TIDAK_HADIR" | "TERLAMBAT";

interface KehadiranRecord {
  id: string;
  nim: string;
  nama: string;
  fakultas: string;
  prodi: string;
  nomorKursi: string;
  gate: string;
  status: AttendanceStatus;
  waktuScan: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const NAMES = ["Ahmad Pratama", "Siti Lestari", "Budi Hidayat", "Rina Wati", "Dimas Nugroho", "Putri Sari", "Rizky Ramadhan", "Ayu Utami", "Fajar Santoso", "Dewi Kurniawan"];
const FACULTIES = ["Fakultas Teknik", "Fakultas Ekonomi", "Fakultas Hukum", "Fakultas MIPA"];
const STATUSES: AttendanceStatus[] = ["HADIR", "HADIR", "HADIR", "TERLAMBAT", "TIDAK_HADIR"];
const GATES = ["Gate 1", "Gate 2", "Gate 3", "Gate 4"];

function generateKehadiran(count = 80): KehadiranRecord[] {
  return Array.from({ length: count }, (_, i) => {
    const status = STATUSES[i % STATUSES.length];
    const h = String(8 + Math.floor(i / 20)).padStart(2, "0");
    const m = String((i * 7) % 60).padStart(2, "0");
    return {
      id: `kh-${String(i + 1).padStart(4, "0")}`,
      nim: `2022${String(i + 1).padStart(4, "0")}`,
      nama: NAMES[i % NAMES.length],
      fakultas: FACULTIES[i % FACULTIES.length],
      prodi: "Teknik Informatika",
      nomorKursi: `${String.fromCharCode(65 + (i % 8))}-${(i % 25) + 1}`,
      gate: status === "TIDAK_HADIR" ? "—" : GATES[i % 4],
      status,
      waktuScan: status === "TIDAK_HADIR" ? "—" : `${h}:${m}`,
    };
  });
}

// ─── Status config ────────────────────────────────────────────────────────────

const statusCfg: Record<AttendanceStatus, { label: string; pill: string; dot: string; icon: React.ElementType }> = {
  HADIR:       { label: "Hadir",       pill: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20", dot: "bg-emerald-400", icon: CheckCircle2 },
  TERLAMBAT:   { label: "Terlambat",   pill: "bg-orange-500/10 text-orange-400 ring-orange-500/20",   dot: "bg-orange-400", icon: Clock },
  TIDAK_HADIR: { label: "Tidak Hadir", pill: "bg-red-500/10 text-red-400 ring-red-500/20",            dot: "bg-red-400",    icon: XCircle },
};

function StatusPill({ status }: { status: AttendanceStatus }) {
  const cfg = statusCfg[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.68rem] font-medium ring-1 ${cfg.pill}`}>
      <Icon className="size-3" />
      {cfg.label}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, color, delay,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition-all hover:-translate-y-0.5 hover:border-white/[0.1]"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-white/25">{label}</p>
          <p className={`mt-1 text-2xl font-bold tabular-nums ${color}`}>{value}</p>
          {sub && <p className="mt-0.5 text-[0.68rem] text-white/25">{sub}</p>}
        </div>
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${color.replace("text-", "bg-").replace("400", "500/10")}`}>
          <Icon className={`size-4 ${color}`} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KehadiranPage() {
  const [all] = useState<KehadiranRecord[]>(() => generateKehadiran(80));
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useDashboardStore((s) => ({ isConnected: false }));

  useSocket("admin");
  useEffect(() => { setMounted(true); }, []);

  const filtered = all.filter((k) => {
    const q = search.toLowerCase();
    const matchQ = !q || k.nama.toLowerCase().includes(q) || k.nim.includes(q);
    const matchS = filterStatus === "all" || k.status === filterStatus;
    return matchQ && matchS;
  });

  const hadir = all.filter((k) => k.status === "HADIR").length;
  const terlambat = all.filter((k) => k.status === "TERLAMBAT").length;
  const tidakHadir = all.filter((k) => k.status === "TIDAK_HADIR").length;
  const pct = Math.round(((hadir + terlambat) / all.length) * 100);

  const handleExport = () => {
    const rows = [
      ["NIM", "Nama", "Fakultas", "Kursi", "Gate", "Status", "Waktu Scan"],
      ...all.map((k) => [k.nim, k.nama, k.fakultas, k.nomorKursi, k.gate, k.status, k.waktuScan]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kehadiran-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 z-0"
        style={{ background: "radial-gradient(ellipse 70% 40% at 80% 10%, rgba(16,185,129,0.04) 0%, transparent 60%)" }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
            <ClipboardList className="size-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white/90">Monitoring Kehadiran</h1>
            <p className="mt-0.5 text-sm text-white/30">Pantau kehadiran wisudawan secara realtime</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live badge */}
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 sm:flex">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[0.72rem] font-semibold text-emerald-400">Live</span>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-[0.78rem] font-medium text-white/50 transition-all hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-white/70 cursor-pointer"
          >
            <Download className="size-3.5" /> Export CSV
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Undangan" value={all.length} icon={ClipboardList} color="text-white/70" delay={0} />
        <StatCard label="Hadir" value={hadir} sub={`${pct}% kehadiran`} icon={CheckCircle2} color="text-emerald-400" delay={0.06} />
        <StatCard label="Terlambat" value={terlambat} icon={Clock} color="text-orange-400" delay={0.12} />
        <StatCard label="Tidak Hadir" value={tidakHadir} icon={XCircle} color="text-red-400" delay={0.18} />
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="relative z-10 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[0.72rem] font-semibold uppercase tracking-wider text-white/25">Tingkat Kehadiran</p>
          <p className="text-sm font-bold text-white/70">{pct}%</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"
          />
        </div>
        <div className="mt-3 flex gap-4">
          {[
            { label: "Hadir", pct: Math.round((hadir / all.length) * 100), color: "bg-emerald-400" },
            { label: "Terlambat", pct: Math.round((terlambat / all.length) * 100), color: "bg-orange-400" },
            { label: "Tidak Hadir", pct: Math.round((tidakHadir / all.length) * 100), color: "bg-red-400" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${item.color}`} />
              <span className="text-[0.68rem] text-white/30">{item.label} {item.pct}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative z-10 flex flex-wrap items-center gap-2"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            placeholder="Cari nama atau NIM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-56 rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-3 text-[0.78rem] text-white/70 placeholder-white/20 outline-none transition-all hover:border-white/[0.12] focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 appearance-none rounded-xl border border-white/[0.08] bg-white/[0.04] pl-3 pr-8 text-[0.78rem] font-medium text-white/60 outline-none transition-all hover:border-white/[0.12] focus:border-blue-500/40 cursor-pointer"
          >
            <option value="all" className="bg-[#0F172A]">Semua Status</option>
            <option value="HADIR" className="bg-[#0F172A]">Hadir</option>
            <option value="TERLAMBAT" className="bg-[#0F172A]">Terlambat</option>
            <option value="TIDAK_HADIR" className="bg-[#0F172A]">Tidak Hadir</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-white/30" />
        </div>
        <span className="ml-auto text-[0.72rem] text-white/25">{filtered.length} record</span>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="relative z-10 rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {["NIM", "Nama", "Fakultas", "Kursi", "Gate", "Status", "Waktu Scan"].map((h) => (
                  <th key={h} className="py-3 pl-4 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-white/20">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!mounted ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-3 pl-4">
                        <div className="h-2.5 w-20 rounded-full bg-white/[0.04] animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <ClipboardList className="mx-auto size-8 text-white/10 mb-3" />
                    <p className="text-sm text-white/25">Tidak ada data kehadiran</p>
                  </td>
                </tr>
              ) : (
                filtered.map((k, i) => (
                  <motion.tr
                    key={k.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.015, 0.3) }}
                    className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.025]"
                  >
                    <td className="py-3 pl-4 pr-3">
                      <span className="font-mono text-[0.72rem] font-medium text-white/40">{k.nim}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-[0.82rem] font-semibold text-white/80">{k.nama}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-[0.75rem] text-white/45">{k.fakultas}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-md bg-white/[0.05] px-2 py-0.5 font-mono text-[0.7rem] text-white/45">
                        {k.nomorKursi}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-[0.72rem] text-white/35">{k.gate}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusPill status={k.status} />
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-mono text-[0.72rem] tabular-nums text-white/35">{k.waktuScan}</span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="border-t border-white/[0.04] px-4 py-3">
            <p className="text-[0.7rem] text-white/20">
              Menampilkan {filtered.length} dari {all.length} record
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
