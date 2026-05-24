"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Mail, Building2, BookOpen, Hash,
  QrCode, KeyRound, Ticket,
  Trash2, Loader2, CheckCircle2, XCircle, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useWisudawan } from "@/hooks/use-wisudawan";
import type { WisudawanRow } from "@/services/wisudawan.service";

// --- Props -------------------------------------------------------------------

interface DrawerProps {
  student: WisudawanRow | null;
  onClose: () => void;
  onDeleteClick: (s: WisudawanRow) => void;
  onResetClick: (s: WisudawanRow) => void;
}

// --- Status config -----------------------------------------------------------

const statusCfg: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  AKTIF: { label: "Aktif", dot: "bg-blue-400", text: "text-blue-300", bg: "bg-blue-500/10" },
  LULUS: { label: "Terverifikasi", dot: "bg-emerald-400", text: "text-emerald-300", bg: "bg-emerald-500/10" },
  CUTI: { label: "Cuti", dot: "bg-yellow-400", text: "text-yellow-300", bg: "bg-yellow-500/10" },
  DROPOUT: { label: "Ditolak", dot: "bg-red-400", text: "text-red-300", bg: "bg-red-500/10" },
};

// --- Info row ----------------------------------------------------------------

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0" }}>
      <Icon style={{ width: 14, height: 14, color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.2)", margin: 0 }}>{label}</p>
        <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.6)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
      </div>
    </div>
  );
}

function StatusRow({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.25)" }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: active ? "rgba(52,211,153,0.8)" : "rgba(255,255,255,0.25)" }}>{value}</span>
    </div>
  );
}

// --- Main drawer -------------------------------------------------------------

export function StudentDrawer({ student, onClose, onDeleteClick, onResetClick }: DrawerProps) {
  const { verify, generateInvitation } = useWisudawan();
  const [verifying, setVerifying] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  async function handleVerify(action: "approve" | "reject" | "revision") {
    if (!student) return;
    setVerifying(action);
    try {
      await verify(student.id, action);
    } catch {
      toast.error("Gagal memverifikasi");
    } finally {
      setVerifying(null);
    }
  }

  async function handleGenerate() {
    if (!student) return;
    setGenerating(true);
    try {
      await generateInvitation(student.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal generate undangan");
    } finally {
      setGenerating(false);
    }
  }

  const sc = student ? (statusCfg[student.status] ?? statusCfg.AKTIF) : statusCfg.AKTIF;

  return (
    <AnimatePresence>
      {student && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
              backgroundColor: "rgba(0,0,0,0.5)",
              cursor: "pointer",
            }}
          />

          {/* Panel */}
          <motion.aside
            key="drawer-panel"
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 32, stiffness: 350 }}
            style={{
              position: "fixed",
              right: 0,
              top: 0,
              bottom: 0,
              zIndex: 50,
              width: "100%",
              maxWidth: 380,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#0A1120",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "-20px 0 60px rgba(0,0,0,0.4)",
            }}
          >
            {/* -- Header ------------------------------------------- */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>
                Detail Wisudawan
              </span>
              <button
                type="button"
                onClick={onClose}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* -- Scrollable content ------------------------------- */}
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Profile */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.08))",
                    fontSize: 14, fontWeight: 700, color: "rgb(96,165,250)",
                    border: "1px solid rgba(59,130,246,0.15)",
                  }}>
                    {student.nama.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: "white", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {student.nama}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{student.nim}</span>
                      <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-px text-[9px] font-bold tracking-wide", sc.bg, sc.text)}>
                        <span className={cn("size-1 rounded-full", sc.dot)} />
                        {sc.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact & Academic */}
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.15)", marginBottom: 8 }}>
                    Kontak & Akademik
                  </p>
                  <div style={{
                    borderRadius: 10, padding: "4px 14px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <InfoRow icon={Mail} label="Email" value={student.email} />
                    <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />
                    <InfoRow icon={Building2} label="Fakultas" value={student.fakultas} />
                    <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />
                    <InfoRow icon={BookOpen} label="Program Studi" value={student.prodi} />
                    <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />
                    <InfoRow icon={Hash} label="Angkatan" value={String(student.angkatan)} />
                  </div>
                </div>

                {/* Invitation & Attendance */}
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.15)", marginBottom: 8 }}>
                    Undangan & Kehadiran
                  </p>
                  <div style={{
                    borderRadius: 10, padding: "8px 14px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <StatusRow label="Undangan" value={student.hasUndangan ? (student.undanganKode ?? "Ada") : "Belum"} active={student.hasUndangan} />
                    <StatusRow label="Status" value={student.undanganStatus ?? "—"} active={!!student.undanganStatus} />
                    <StatusRow label="Kehadiran" value={student.kehadiranStatus ?? "Belum Hadir"} active={!!student.kehadiranStatus} />
                  </div>
                </div>

                {/* Verification — only for AKTIF */}
                {student.status === "AKTIF" && (
                  <div>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.15)", marginBottom: 8 }}>
                      Verifikasi Profil
                    </p>
                    <div style={{ display: "flex", gap: 6 }}>
                      {([
                        { action: "approve" as const, icon: CheckCircle2, label: "Setujui", bg: "rgba(16,185,129,0.08)", color: "rgba(52,211,153,0.8)", border: "rgba(16,185,129,0.12)" },
                        { action: "revision" as const, icon: RotateCcw, label: "Revisi", bg: "rgba(234,179,8,0.08)", color: "rgba(250,204,21,0.8)", border: "rgba(234,179,8,0.12)" },
                        { action: "reject" as const, icon: XCircle, label: "Tolak", bg: "rgba(239,68,68,0.08)", color: "rgba(248,113,113,0.8)", border: "rgba(239,68,68,0.12)" },
                      ]).map((btn) => (
                        <button
                          key={btn.action}
                          type="button"
                          onClick={() => handleVerify(btn.action)}
                          disabled={!!verifying}
                          style={{
                            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                            borderRadius: 8, padding: "8px 0",
                            fontSize: 10, fontWeight: 600,
                            background: btn.bg, color: btn.color,
                            border: `1px solid ${btn.border}`,
                            cursor: verifying ? "not-allowed" : "pointer",
                            opacity: verifying ? 0.4 : 1,
                            transition: "all 0.15s",
                          }}
                        >
                          {verifying === btn.action ? <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> : <btn.icon style={{ width: 12, height: 12 }} />}
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* -- Footer actions ------------------------------------ */}
            <div style={{
              padding: 14,
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <button type="button" onClick={handleGenerate} disabled={generating || student.hasUndangan}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    borderRadius: 8, padding: "8px 0",
                    fontSize: 10, fontWeight: 600,
                    background: student.hasUndangan ? "rgba(255,255,255,0.03)" : "rgba(16,185,129,0.1)",
                    color: student.hasUndangan ? "rgba(255,255,255,0.15)" : "rgba(52,211,153,0.8)",
                    border: student.hasUndangan ? "none" : "1px solid rgba(16,185,129,0.12)",
                    cursor: student.hasUndangan ? "not-allowed" : "pointer",
                  }}>
                  {generating ? <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> : <Ticket style={{ width: 12, height: 12 }} />}
                  Undangan
                </button>
                <button type="button" onClick={() => onResetClick(student)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    borderRadius: 8, padding: "8px 0",
                    fontSize: 10, fontWeight: 600,
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                  }}>
                  <KeyRound style={{ width: 12, height: 12 }} /> Password
                </button>
                <button type="button"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    borderRadius: 8, padding: "8px 0",
                    fontSize: 10, fontWeight: 600,
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    cursor: "pointer",
                  }}>
                  <QrCode style={{ width: 12, height: 12 }} /> QR Code
                </button>
                <button type="button" onClick={() => onDeleteClick(student)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    borderRadius: 8, padding: "8px 0",
                    fontSize: 10, fontWeight: 600,
                    background: "rgba(239,68,68,0.06)",
                    color: "rgba(248,113,113,0.7)",
                    border: "1px solid rgba(239,68,68,0.1)",
                    cursor: "pointer",
                  }}>
                  <Trash2 style={{ width: 12, height: 12 }} /> Hapus
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
