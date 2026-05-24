"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Clock, CheckCircle2, XCircle,
  Loader2, RefreshCw, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TamuRequest {
  id: string;
  nim: string;
  nama: string;
  email: string;
  fakultas: string;
  prodi: string;
  sesiWisuda: string | null;
  foto: string | null;
  requestedTamu: number;
  statusPengajuan: "PENDING";
  undangan: { id: string; kode: string; statusUndangan: string } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("wisuda-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    return parsed?.state?.token ?? null;
  } catch { return null; }
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Row component ────────────────────────────────────────────────────────────

function RequestRow({
  req,
  onApprove,
  onReject,
}: {
  req: TamuRequest;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const initials = req.nama.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  async function handleApprove() {
    setApproving(true);
    try { await onApprove(req.id); }
    finally { setApproving(false); }
  }

  async function handleReject() {
    setRejecting(true);
    try { await onReject(req.id); }
    finally { setRejecting(false); }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-500/15 dark:bg-amber-500/[0.04] p-3.5"
    >
      {/* Avatar */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 border border-indigo-200 dark:from-indigo-500/20 dark:to-blue-500/20 dark:border-indigo-500/15 overflow-hidden">
        {req.foto ? (
          <img src={req.foto} alt={req.nama} className="size-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">{initials}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-white/80 truncate">{req.nama}</p>
        <p className="text-[0.65rem] text-gray-400 dark:text-white/30 truncate">{req.nim} · {req.sesiWisuda ?? "Sesi belum ditentukan"}</p>
      </div>

      {/* Jumlah tamu badge */}
      <div className="flex items-center gap-1.5 rounded-lg bg-amber-100 border border-amber-300 dark:bg-amber-500/10 dark:border-amber-500/20 px-2.5 py-1.5 shrink-0">
        <Users className="size-3 text-amber-600 dark:text-amber-400/70" />
        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{req.requestedTamu}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* ACC */}
        <button
          type="button"
          onClick={handleApprove}
          disabled={approving || rejecting}
          title="Setujui & Generate Undangan"
          className="flex items-center gap-1.5 h-8 px-3 rounded-xl border border-emerald-300 bg-emerald-50 text-[0.72rem] font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 dark:hover:border-emerald-500/50"
        >
          {approving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="size-3.5" />
          )}
          {approving ? "..." : "ACC"}
        </button>

        {/* Tolak */}
        <button
          type="button"
          onClick={handleReject}
          disabled={approving || rejecting}
          title="Tolak pengajuan"
          className="flex size-8 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 dark:border-red-500/20 dark:bg-red-500/[0.06] dark:text-red-400/60 dark:hover:bg-red-500/15 dark:hover:text-red-400"
        >
          {rejecting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <XCircle className="size-3.5" />
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function TamuRequestsPanel({ onRefreshUndangan }: { onRefreshUndangan?: () => void }) {
  const [requests, setRequests] = useState<TamuRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/tamu-requests", {
        headers: authHeaders(),
        credentials: "include",
      });
      const result = await res.json();
      if (result.data) setRequests(result.data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  async function handleApprove(mahasiswaId: string) {
    try {
      const res = await fetch(`/api/admin/tamu-requests/${mahasiswaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
        body: JSON.stringify({
          action: "approve",
          tanggalWisuda: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          tempatWisuda: "Auditorium Utama",
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal menyetujui");

      toast.success(result.message ?? "Pengajuan disetujui & undangan digenerate");
      setRequests((prev) => prev.filter((r) => r.id !== mahasiswaId));
      onRefreshUndangan?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyetujui pengajuan");
    }
  }

  async function handleReject(mahasiswaId: string) {
    try {
      const res = await fetch(`/api/admin/tamu-requests/${mahasiswaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
        body: JSON.stringify({ action: "reject" }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal menolak");

      toast.success("Pengajuan tamu ditolak");
      setRequests((prev) => prev.filter((r) => r.id !== mahasiswaId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menolak pengajuan");
    }
  }

  if (!isLoading && requests.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-amber-200 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/[0.04] overflow-hidden"
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-100/50 dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/15">
            <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-800 dark:text-white/80">Request Tamu Pending</span>
            {!isLoading && requests.length > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-amber-500 text-[0.6rem] font-black text-white">
                {requests.length}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); fetchRequests(); }}
            className="flex size-6 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:text-white/25 dark:hover:text-white/50 transition-colors"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          {isCollapsed ? (
            <ChevronDown className="size-4 text-gray-400 dark:text-white/30" />
          ) : (
            <ChevronUp className="size-4 text-gray-400 dark:text-white/30" />
          )}
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2.5 border-t border-amber-200 dark:border-amber-500/10 pt-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="size-5 text-amber-500 dark:text-amber-400/50 animate-spin" />
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {requests.map((req) => (
                    <RequestRow
                      key={req.id}
                      req={req}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
