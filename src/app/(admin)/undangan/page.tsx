"use client";

import { useEffect } from "react";
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
      <div className="dashboard-mesh relative -m-4 min-h-full overflow-hidden rounded-none p-4 sm:-m-6 sm:rounded-3xl sm:p-6">
        <div className="relative z-10 space-y-5">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/90 bg-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_16px_rgba(59,130,246,0.1)] dark:border-white/10 dark:bg-white/[0.08]">
                <Mail className="size-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <div className="mb-1.5 inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-blue-800 dark:border-white/10 dark:bg-white/[0.08] dark:text-white/50">
                  <Sparkles className="size-3 text-blue-600 dark:text-blue-400" />
                  Kelola undangan
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                    <span className="bg-gradient-to-br from-slate-900 via-blue-900 to-violet-800 bg-clip-text text-transparent dark:hidden">
                      Undangan Digital
                    </span>
                    <span className="hidden dark:inline">Undangan Digital</span>
                  </h1>

                </div>
                <p className="mt-0.5 text-sm font-medium text-slate-600 dark:text-white/40">
                  Generate dan kelola undangan wisuda digital
                </p>
              </div>
            </div>
          </header>

          <InvitationStatsCards stats={stats} />
          <InvitationToolbar />
          <TamuRequestsPanel onRefreshUndangan={() => init()} />
          <InvitationTable />
        </div>
      </div>

      <InvitationPreviewModal />
      <QRDrawer />
      <GenerateInvitationModal />
      <MassGenerateModal />
    </>
  );
}
