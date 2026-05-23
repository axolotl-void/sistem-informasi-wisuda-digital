"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Sparkles } from "lucide-react";
import { useUndanganStore } from "@/features/undangan/store";
import { InvitationStatsCards } from "@/features/undangan/components/stats-cards";
import { InvitationToolbar } from "@/features/undangan/components/toolbar";
import { InvitationTable } from "@/features/undangan/components/invitation-table";
import { InvitationPreviewModal } from "@/features/undangan/components/invitation-preview-modal";
import { QRDrawer } from "@/features/undangan/components/qr-drawer";
import { GenerateInvitationModal } from "@/features/undangan/components/generate-modal";
import { MassGenerateModal } from "@/features/undangan/components/mass-generate-modal";
import { TamuRequestsPanel } from "@/features/undangan/components/tamu-requests-panel";

export default function UndanganPage() {
  const { init, stats } = useUndanganStore();

  useEffect(() => {
    init();
  }, [init]);
  return (
    <>
      {/* Ambient background glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 10%, rgba(59,130,246,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(99,102,241,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 space-y-6">
        {/* ── Page Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-start justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
              <Mail className="size-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white/90">
                Undangan Digital
              </h1>
              <p className="mt-0.5 text-sm text-white/30">
                Generate dan kelola undangan wisuda digital
              </p>
            </div>
          </div>

          {/* Live indicator */}
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 sm:flex">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[0.72rem] font-semibold text-emerald-400">
              {stats.total} Total
            </span>
          </div>
        </motion.div>

        {/* ── Stats ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
        >
          <InvitationStatsCards stats={stats} />
        </motion.div>

        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          <InvitationToolbar />
        </motion.div>

        {/* ── Request Tamu Panel ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
        >
          <TamuRequestsPanel onRefreshUndangan={() => init()} />
        </motion.div>

        {/* ── Table ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        >
          <InvitationTable />
        </motion.div>
      </div>

      {/* ── Modals & Drawers ────────────────────────────────────────── */}
      <InvitationPreviewModal />
      <QRDrawer />
      <GenerateInvitationModal />
      <MassGenerateModal />
    </>
  );
}
