"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassChip, glassBtnGhost, glassBtnPrimary } from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";
import { X, Download, Share2, Copy, Printer, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { useUndanganStore } from "../store";
import { StatusBadge, AttendanceBadge } from "./status-badge";
import { InvitationCardPrint } from "./invitation-card-print";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/50 py-2.5 last:border-0 dark:border-white/[0.06]">
      <span className="shrink-0 text-[0.72rem] font-medium text-slate-500 dark:text-white/35">{label}</span>
      <span className="text-right text-[0.78rem] font-medium text-slate-800 dark:text-white/80">{value}</span>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  loading = false,
  success = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: "default" | "primary" | "danger";
  loading?: boolean;
  success?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-[0.75rem] font-semibold disabled:opacity-50",
        variant === "primary" ? glassBtnPrimary : glassBtnGhost,
      )}
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : success ? (
        <Check className="size-3.5 text-emerald-500 dark:text-emerald-400" />
      ) : (
        <Icon className="size-3.5" />
      )}
      {label}
    </button>
  );
}

export function InvitationPreviewModal() {
  const { isPreviewOpen, selectedInvitation, closePreview, markDownloaded } = useUndanganStore();
  const printRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const inv = selectedInvitation;

  useEffect(() => {
    if (!inv) return;
    QRCode.toDataURL(inv.qrToken, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#1e293b", light: "#ffffff" },
    }).then(setQrDataUrl).catch(() => {});
  }, [inv]);

  const handleDownloadPDF = useCallback(async () => {
    if (!printRef.current || !inv) return;
    setIsExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(printRef.current, {
        useCORS: true,
        background: "#080f1e",
        logging: false,
        width: printRef.current.scrollWidth,
        height: printRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`undangan-${inv.kode}.pdf`);

      markDownloaded(inv.id);
      toast.success("PDF berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh PDF");
    } finally {
      setIsExporting(false);
    }
  }, [inv, markDownloaded]);

  const handleCopyLink = useCallback(() => {
    if (!inv) return;
    const link = `${window.location.origin}/verify/${inv.qrToken}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast.success("Link disalin");
      setTimeout(() => setCopied(false), 2000);
    });
  }, [inv]);

  const handleShare = useCallback(() => {
    if (!inv) return;
    const link = `${window.location.origin}/verify/${inv.qrToken}`;
    const text = `Undangan Wisuda Digital\n${inv.mahasiswaNama} (${inv.nim})\n${inv.sesi} - ${inv.gedung}\nKursi: ${inv.nomorKursi}\n\n${link}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  }, [inv]);

  if (!inv) return null;

  return (
    <AnimatePresence>
      {isPreviewOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-slate-900/45 dark:bg-black/60"
            onClick={closePreview}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/90 bg-gradient-to-br from-white/95 via-white/88 to-white/80 shadow-2xl backdrop-blur-xl dark:border-white/15 dark:from-[#0f172a]/98 dark:via-[#0f172a]/95 dark:to-[#0f172a]/90"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/60 bg-white/50 px-6 py-4 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0f172a]/80">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Preview Undangan</h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-white/40">{inv.kode}</p>
                </div>
                <button
                  type="button"
                  onClick={closePreview}
                  className="flex size-8 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 cursor-pointer dark:text-white/30 dark:hover:bg-white/[0.08] dark:hover:text-white/60"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[1fr_280px]">
                {/* Left — Invitation card preview */}
                <div className="space-y-4">
                  {/* Status row */}
                  <div className="flex items-center gap-2">
                    <StatusBadge status={inv.status} size="md" />
                    <AttendanceBadge status={inv.attendance} size="md" />
                  </div>

                  {/* Printable card */}
                  <div className="overflow-hidden rounded-xl" style={{ transform: "scale(1)", transformOrigin: "top left" }}>
                    <div className="overflow-x-auto">
                      <div style={{ minWidth: 794 }}>
                        <InvitationCardPrint
                          ref={printRef}
                          invitation={inv}
                          qrDataUrl={qrDataUrl}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right — Details + Actions */}
                <div className="space-y-4">
                  {/* QR Code */}
                  <GlassChip className="flex flex-col items-center gap-3 p-5">
                    <div className="rounded-2xl bg-white p-3 shadow-lg">
                      {qrDataUrl ? (
                        <img src={qrDataUrl} alt="QR Code" width={140} height={140} />
                      ) : (
                        <div className="size-[140px] animate-pulse rounded-lg bg-slate-100" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/35">Token Kehadiran</p>
                      <p className="mt-0.5 break-all font-mono text-[0.65rem] text-slate-600 dark:text-white/45">{inv.qrToken}</p>
                    </div>
                  </GlassChip>

                  <GlassChip className="px-4 py-2">
                    <InfoRow label="Nama" value={inv.mahasiswaNama} />
                    <InfoRow label="NIM" value={inv.nim} />
                    <InfoRow label="Fakultas" value={inv.fakultas} />
                    <InfoRow label="Sesi" value={inv.sesi} />
                    <InfoRow label="Gedung" value={inv.gedung} />
                    <InfoRow label="Kursi" value={inv.nomorKursi} />
                    <InfoRow label="Kuota Tamu" value={`${inv.kuotaTamu} orang`} />
                    <InfoRow
                      label="Tanggal"
                      value={new Date(inv.tanggalWisuda).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    />
                  </GlassChip>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <ActionButton
                      icon={Download}
                      label="Download PDF"
                      onClick={handleDownloadPDF}
                      variant="primary"
                      loading={isExporting}
                    />
                    <ActionButton
                      icon={Share2}
                      label="WhatsApp"
                      onClick={handleShare}
                    />
                    <ActionButton
                      icon={Copy}
                      label={copied ? "Tersalin!" : "Copy Link"}
                      onClick={handleCopyLink}
                      success={copied}
                    />
                    <ActionButton
                      icon={Printer}
                      label="Print"
                      onClick={() => window.print()}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
