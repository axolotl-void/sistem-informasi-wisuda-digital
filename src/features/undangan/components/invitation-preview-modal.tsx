"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Copy, RefreshCw, Printer, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { useUndanganStore } from "../store";
import { QrLarge } from "./qr-cell";
import { StatusBadge, AttendanceBadge } from "./status-badge";
import { InvitationCardPrint } from "./invitation-card-print";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[0.72rem] font-medium text-white/30 shrink-0">{label}</span>
      <span className="text-[0.78rem] font-medium text-white/70 text-right">{value}</span>
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
  const styles = {
    default: "border-white/[0.08] bg-white/[0.04] text-white/60 hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white/80",
    primary: "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/15",
    danger: "border-red-500/20 bg-red-500/8 text-red-400/70 hover:border-red-500/30 hover:bg-red-500/12",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-[0.75rem] font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer ${styles[variant]}`}
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : success ? (
        <Check className="size-3.5 text-emerald-400" />
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
  }, [inv?.qrToken]);

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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={closePreview}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#080f1e] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#080f1e]/95 px-6 py-4 backdrop-blur-xl">
                <div>
                  <h2 className="text-base font-semibold text-white/90">Preview Undangan</h2>
                  <p className="text-xs text-white/30 mt-0.5">{inv.kode}</p>
                </div>
                <button
                  type="button"
                  onClick={closePreview}
                  className="flex size-8 items-center justify-center rounded-xl text-white/30 transition-colors hover:bg-white/[0.08] hover:text-white/60 cursor-pointer"
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

                  {/* Printable card — hidden off-screen for capture */}
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
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
                    <QrLarge token={inv.qrToken} size={160} />
                    <div className="text-center">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/25">Token</p>
                      <p className="mt-0.5 font-mono text-[0.7rem] text-white/50">{inv.qrToken}</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-2">
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
                  </div>

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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
