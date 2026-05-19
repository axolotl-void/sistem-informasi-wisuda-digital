"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Eye, QrCode, MoreHorizontal, RefreshCw, Download, Share2, Mail } from "lucide-react";
import { useUndanganStore, useFilteredInvitations } from "../store";
import { StatusBadge, AttendanceBadge } from "./status-badge";
import { QrCell } from "./qr-cell";
import { EmptyState } from "./empty-state";
import { LoadingSkeleton } from "./loading-skeleton";
import type { Invitation } from "../types";

function ActionMenu({ inv }: { inv: Invitation }) {
  const { openPreview, openDrawer, generateInvitation } = useUndanganStore();

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
      <button
        type="button"
        onClick={() => openPreview(inv)}
        className="flex size-7 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.08] hover:text-white/70 cursor-pointer"
        title="Preview Undangan"
      >
        <Eye className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => openDrawer(inv)}
        className="flex size-7 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.08] hover:text-white/70 cursor-pointer"
        title="Detail QR"
      >
        <QrCode className="size-3.5" />
      </button>
      {inv.status === "belum_generate" && (
        <button
          type="button"
          onClick={() => generateInvitation(inv.id)}
          className="flex size-7 items-center justify-center rounded-lg text-blue-400/50 transition-colors hover:bg-blue-500/10 hover:text-blue-400 cursor-pointer"
          title="Generate QR"
        >
          <RefreshCw className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function TableRow({ inv, index }: { inv: Invitation; index: number }) {
  const { openPreview, openDrawer } = useUndanganStore();

  return (
    <motion.tr
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      className="group border-b border-white/[0.04] transition-colors duration-150 hover:bg-white/[0.025]"
    >
      {/* QR Preview */}
      <td className="py-3 pl-4 pr-3">
        <div onClick={() => openDrawer(inv)} className="cursor-pointer">
          {inv.status !== "belum_generate" ? (
            <QrCell token={inv.qrToken} size={36} />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-md border border-dashed border-white/[0.08]">
              <QrCode className="size-4 text-white/15" />
            </div>
          )}
        </div>
      </td>

      {/* Kode */}
      <td className="py-3 pr-4">
        <span className="font-mono text-[0.72rem] font-medium text-white/50">
          {inv.kode}
        </span>
      </td>

      {/* Mahasiswa */}
      <td className="py-3 pr-4">
        <div>
          <p className="text-[0.82rem] font-semibold text-white/80 leading-tight">
            {inv.mahasiswaNama}
          </p>
          <p className="text-[0.68rem] font-medium text-white/30 mt-0.5">{inv.nim}</p>
        </div>
      </td>

      {/* Fakultas */}
      <td className="hidden py-3 pr-4 lg:table-cell">
        <div>
          <p className="text-[0.75rem] font-medium text-white/50 leading-tight">{inv.fakultas}</p>
          <p className="text-[0.65rem] text-white/25 mt-0.5">{inv.prodi}</p>
        </div>
      </td>

      {/* Sesi */}
      <td className="hidden py-3 pr-4 md:table-cell">
        <span className="text-[0.72rem] font-medium text-white/40">{inv.sesi}</span>
      </td>

      {/* Kursi */}
      <td className="hidden py-3 pr-4 xl:table-cell">
        <span className="rounded-md bg-white/[0.05] px-2 py-0.5 font-mono text-[0.7rem] font-medium text-white/50">
          {inv.nomorKursi}
        </span>
      </td>

      {/* Kuota Tamu */}
      <td className="hidden py-3 pr-4 xl:table-cell">
        <div className="flex items-center gap-1.5">
          <span className="text-[0.75rem] font-semibold text-white/60">{inv.tamuHadir}</span>
          <span className="text-[0.65rem] text-white/20">/</span>
          <span className="text-[0.72rem] text-white/35">{inv.kuotaTamu}</span>
        </div>
      </td>

      {/* Status QR */}
      <td className="py-3 pr-4">
        <StatusBadge status={inv.status} />
      </td>

      {/* Attendance */}
      <td className="hidden py-3 pr-4 sm:table-cell">
        <AttendanceBadge status={inv.attendance} />
      </td>

      {/* Actions */}
      <td className="py-3 pr-4">
        <ActionMenu inv={inv} />
      </td>
    </motion.tr>
  );
}

export function InvitationTable() {
  const { isLoading } = useUndanganStore();
  const filtered = useFilteredInvitations();

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      {/* Sticky header */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              {[
                { label: "QR", cls: "pl-4 pr-3 w-12" },
                { label: "Kode", cls: "pr-4" },
                { label: "Mahasiswa", cls: "pr-4" },
                { label: "Fakultas", cls: "pr-4 hidden lg:table-cell" },
                { label: "Sesi", cls: "pr-4 hidden md:table-cell" },
                { label: "Kursi", cls: "pr-4 hidden xl:table-cell" },
                { label: "Tamu", cls: "pr-4 hidden xl:table-cell" },
                { label: "Status QR", cls: "pr-4" },
                { label: "Kehadiran", cls: "pr-4 hidden sm:table-cell" },
                { label: "", cls: "pr-4 w-24" },
              ].map((h) => (
                <th
                  key={h.label}
                  className={`py-3 text-left text-[0.65rem] font-semibold uppercase tracking-wider text-white/20 ${h.cls}`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                filtered.map((inv, i) => (
                  <TableRow key={inv.id} inv={inv} index={i} />
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="border-t border-white/[0.04] px-4 py-3">
          <p className="text-[0.7rem] font-medium text-white/20">
            Menampilkan {filtered.length} undangan
          </p>
        </div>
      )}
    </div>
  );
}
