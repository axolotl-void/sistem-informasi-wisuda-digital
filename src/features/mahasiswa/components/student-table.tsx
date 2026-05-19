"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { WisudawanRow } from "@/services/wisudawan.service";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";

// ─── Status badge ────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  AKTIF: { label: "Aktif", dot: "bg-blue-400", text: "text-blue-300/90", bg: "bg-blue-500/10" },
  LULUS: { label: "Terverifikasi", dot: "bg-emerald-400", text: "text-emerald-300/90", bg: "bg-emerald-500/10" },
  CUTI: { label: "Cuti", dot: "bg-yellow-400", text: "text-yellow-300/90", bg: "bg-yellow-500/10" },
  DROPOUT: { label: "Ditolak", dot: "bg-red-400", text: "text-red-300/90", bg: "bg-red-500/10" },
};

function StatusPill({ status }: { status: string }) {
  const c = statusConfig[status] ?? statusConfig.AKTIF;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide", c.bg, c.text)}
      style={{ border: "none" }}
    >
      <span className={cn("size-1 rounded-full", c.dot)} style={{ border: "none" }} />
      {c.label}
    </span>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div style={{
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(255,255,255,0.02)",
      overflow: "hidden",
      padding: 16,
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(255,255,255,0.04)" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ height: 10, width: 128, borderRadius: 4, background: "rgba(255,255,255,0.04)" }} />
              <div style={{ height: 8, width: 80, borderRadius: 4, background: "rgba(255,255,255,0.03)" }} />
            </div>
            <div style={{ height: 20, width: 64, borderRadius: 6, background: "rgba(255,255,255,0.04)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)",
      padding: "64px 0", textAlign: "center",
    }}>
      <div style={{ marginBottom: 12, width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 24 }}>🎓</span>
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>Belum ada data wisudawan</p>
      <p style={{ marginTop: 4, fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.2)" }}>Import data mahasiswa untuk memulai</p>
      <button type="button" style={{
        marginTop: 16, display: "flex", alignItems: "center", gap: 6,
        borderRadius: 8, background: "rgba(37,99,235,0.9)", padding: "8px 14px",
        fontSize: 11, fontWeight: 600, color: "white", cursor: "pointer", border: "none",
      }}>
        <Upload style={{ width: 12, height: 12 }} /> Import Excel
      </button>
    </div>
  );
}

// ─── Main table ──────────────────────────────────────────────────────────────

interface StudentTableProps {
  data: WisudawanRow[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onSelect: (student: WisudawanRow) => void;
}

export function StudentTable({
  data,
  isLoading,
  page,
  totalPages,
  total,
  onPageChange,
  onSelect,
}: StudentTableProps) {
  if (isLoading) return <TableSkeleton />;
  if (data.length === 0 && !isLoading) return <EmptyState />;

  const headers = ["Nama", "NIM", "Fakultas", "Prodi", "Status", "Undangan", "Kehadiran"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      style={{
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top reflection */}
      <div style={{
        position: "absolute", inset: "0 0 auto 0", height: 1,
        background: "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)",
      }} />

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse", borderSpacing: 0 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {headers.map((h) => (
                <th key={h} style={{
                  padding: "10px 16px", textAlign: "left",
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                  color: "rgba(255,255,255,0.2)", border: "none",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((s, i) => (
              <motion.tr
                key={s.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: i * 0.015 }}
                onClick={() => onSelect(s)}
                style={{
                  cursor: "pointer",
                  borderBottom: i < data.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <td style={{ padding: "10px 16px", border: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(59,130,246,0.08)", fontSize: 10, fontWeight: 700,
                      color: "rgb(96,165,250)", flexShrink: 0, border: "none",
                    }}>
                      {s.nama.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.75)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.nama}
                      </p>
                      <p style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.2)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "10px 16px", border: "none" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{s.nim}</span>
                </td>
                <td style={{ padding: "10px 16px", border: "none" }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.3)" }}>{s.fakultas}</span>
                </td>
                <td style={{ padding: "10px 16px", border: "none" }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.3)" }}>{s.prodi}</span>
                </td>
                <td style={{ padding: "10px 16px", border: "none" }}>
                  <StatusPill status={s.status} />
                </td>
                <td style={{ padding: "10px 16px", border: "none" }}>
                  {s.hasUndangan ? (
                    <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 600, color: "rgba(52,211,153,0.8)" }}>
                      {s.undanganKode}
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.12)" }}>—</span>
                  )}
                </td>
                <td style={{ padding: "10px 16px", border: "none" }}>
                  {s.kehadiranStatus ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: "rgba(74,222,128,0.8)" }}>
                      <span className="animate-pulse" style={{ width: 4, height: 4, borderRadius: "50%", background: "rgb(74,222,128)", border: "none" }} /> Hadir
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.12)" }}>—</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "8px 16px",
      }}>
        <p style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.2)", margin: 0 }}>
          {data.length} dari {total}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1}
            style={{
              display: "flex", width: 24, height: 24, alignItems: "center", justifyContent: "center",
              borderRadius: 6, color: "rgba(255,255,255,0.25)", cursor: page <= 1 ? "not-allowed" : "pointer",
              background: "transparent", border: "none", opacity: page <= 1 ? 0.2 : 1,
            }}>
            <ChevronLeft style={{ width: 14, height: 14 }} />
          </button>
          <span style={{ padding: "0 6px", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>
            {page}/{totalPages || 1}
          </span>
          <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
            style={{
              display: "flex", width: 24, height: 24, alignItems: "center", justifyContent: "center",
              borderRadius: 6, color: "rgba(255,255,255,0.25)", cursor: page >= totalPages ? "not-allowed" : "pointer",
              background: "transparent", border: "none", opacity: page >= totalPages ? 0.2 : 1,
            }}>
            <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
