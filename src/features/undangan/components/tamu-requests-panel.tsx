"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { glassBtnGhost, glassBtnPrimary, glassBtnDanger } from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";

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

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("wisuda-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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
  const initials = req.nama
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amber-400/35 bg-amber-500/10 p-3.5 backdrop-blur-md dark:border-amber-500/20 dark:bg-amber-500/8">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/15 text-[11px] font-bold text-amber-800 dark:text-amber-300">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-white/85">
          {req.nama}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-white/40">
          {req.nim} · Minta +{req.requestedTamu} tamu
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          disabled={rejecting || approving}
          onClick={async () => {
            setRejecting(true);
            try {
              await onReject(req.id);
            } finally {
              setRejecting(false);
            }
          }}
          className={cn(glassBtnDanger, "h-8 px-2.5")}
        >
          {rejecting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <XCircle className="size-3.5" />
          )}
        </button>
        <button
          type="button"
          disabled={approving || rejecting}
          onClick={async () => {
            setApproving(true);
            try {
              await onApprove(req.id);
            } finally {
              setApproving(false);
            }
          }}
          className={cn(glassBtnPrimary, "h-8 px-2.5")}
        >
          {approving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="size-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

export function TamuRequestsPanel({
  onRefreshUndangan,
}: {
  onRefreshUndangan?: () => void;
}) {
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

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

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
    <LiquidGlassCard
      noEntrance
      hover={false}
      className="overflow-hidden border-amber-400/30 p-0 dark:border-amber-500/20"
    >
      <button
        type="button"
        onClick={() => setIsCollapsed((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-amber-500/10 dark:hover:bg-white/[0.03]"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500/15">
            <Clock className="size-4 text-amber-700 dark:text-amber-300" />
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-white/85">
            Request Tamu Pending
          </span>
          {!isLoading && requests.length > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
              {requests.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fetchRequests();
            }}
            className={cn(glassBtnGhost, "size-8 p-0 justify-center")}
          >
            <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
          </button>
          {isCollapsed ? (
            <ChevronDown className="size-4 text-slate-400" />
          ) : (
            <ChevronUp className="size-4 text-slate-400" />
          )}
        </div>
      </button>

      {!isCollapsed && (
        <div className="space-y-2.5 border-t border-amber-400/25 px-4 py-3 dark:border-amber-500/15">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="size-5 animate-spin text-amber-600 dark:text-amber-400" />
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
