"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Clock, CheckCircle2, XCircle,
  Loader2, RefreshCw, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { LiquidGlassCard, GlassChip } from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";

// --- Types --------------------------------------------------------------------

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

// --- Helpers ------------------------------------------------------------------

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

// --- Row component ------------------------------------------------------------

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
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-3.5",
        "border-amber-400/35 bg-amber-500/10",
        "dark:border-amber-500/20 dark:bg-amber-500/[0.06]",
      )}
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
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-white/80">{req.nama}</p>
        <p className="truncate text-[0.65rem] text-slate-500 dark:text-white/30">
          {req.nim} · {req.sesiWisuda ?? "Sesi belum ditentukan"}
        </p>
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
    </div>
  );
}

// --- Main Panel ---------------------------------------------------------------

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
    <LiquidGlassCard noEntrance hover={false} className="overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setIsCollapsed((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-white/30 dark:hover:bg-white/[0.03]"
      >
        <div className="flex items-center gap-2.5">
          <GlassChip className="flex size-8 items-center justify-center p-0">
            <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
          </GlassChip>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800 dark:text-white/80">
              Request Tamu Pending
            </span>
            {!isLoading && requests.length > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/20 text-[0.6rem] font-black text-amber-800 dark:text-amber-300">
                {requests.length}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fetchRequests();
            }}
            className="flex size-6 items-center justify-center rounded-lg text-slate-400 transition-colors hover:text-slate-600 dark:text-white/25 dark:hover:text-white/50"
          >
            <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
          </button>
          {isCollapsed ? (
            <ChevronDown className="size-4 text-slate-400 dark:text-white/30" />
          ) : (
            <ChevronUp className="size-4 text-slate-400 dark:text-white/30" />
          )}
        </div>
      </button>

      {!isCollapsed && (
        <div className="space-y-2.5 border-t border-white/60 px-4 pb-4 pt-3 dark:border-white/[0.08]">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="size-5 animate-spin text-amber-500 dark:text-amber-400/50" />
            </div>
          ) : (
            requests.map((req) => (
              <RequestRow
                key={req.id}
                req={req}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </div>
      )}
    </LiquidGlassCard>
  );
}
