"use client";

import { QrCode, Share2, Edit2, Trash2, Upload, FileSpreadsheet, MailPlus, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import {
  LiquidGlassCard,
  glassBtnPrimary,
  glassBtnGhost,
  GlassChip,
} from "@/components/ui/liquid-glass";

interface LecturerInvitation {
  id: string;
  kode: string;
  nidn: string | null;
  nama: string;
  jabatan: string;
  email: string | null;
  noWa: string | null;
  qrToken: string;
  statusHadir: boolean;
  waktuScan: string | null;
}

interface TableProps {
  data: LecturerInvitation[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (p: number) => void;
  onPreviewClick: (item: LecturerInvitation) => void;
  onShareClick: (item: LecturerInvitation) => void;
  onEditClick: (item: LecturerInvitation) => void;
  onDeleteClick: (item: LecturerInvitation) => void;
  onImportClick: () => void;
}

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ["Nama", "Jabatan", "NIDN", "Email", "No WhatsApp"],
    ["Prof. Dr. Ir. H. Abdurrahman, M.Pd.", "Rektor UBBG", "0011223344", "rektor@ubbg.ac.id", "628112233445"],
    ["Dr. Cut Dahlia, M.Si.", "Dekan FKIP", "0022334455", "dekan.fkip@ubbg.ac.id", "628223344556"],
  ]);
  ws["!cols"] = [{ wch: 35 }, { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 16 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template Dosen");
  XLSX.writeFile(wb, "Template_Import_Dosen.xlsx");
}

const STEPS = [
  { icon: FileSpreadsheet, label: "Unduh Template", desc: "Download template Excel resmi" },
  { icon: Upload, label: "Import Data", desc: "Unggah file Excel yang sudah diisi" },
  { icon: MailPlus, label: "Sebar Undangan", desc: "Bagikan QR Code via WhatsApp" },
];

function EmptyState({ onImportClick }: { onImportClick: () => void }) {
  return (
    <LiquidGlassCard hover={false} className="relative overflow-hidden p-0">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 size-64 rounded-full bg-blue-500/[0.06] blur-3xl dark:bg-blue-500/[0.08]" />
        <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-indigo-500/[0.05] blur-3xl dark:bg-indigo-500/[0.07]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 rounded-full bg-purple-500/[0.03] blur-3xl dark:bg-purple-500/[0.04]" />

        {/* Floating QR grid pattern */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.04]">
          <div className="grid grid-cols-8 gap-6 rotate-12 scale-125">
            {Array.from({ length: 24 }).map((_, i) => (
              <QrCode key={i} className="size-8 text-blue-500" />
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-6 py-14 sm:py-20">
        {/* Animated icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 blur-xl animate-pulse" />
          <div className="relative flex size-20 items-center justify-center rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 shadow-[0_8px_32px_rgba(59,130,246,0.15)] backdrop-blur-sm dark:border-blue-400/15 dark:shadow-[0_8px_32px_rgba(59,130,246,0.12)]">
            <MailPlus className="size-9 text-blue-500 dark:text-blue-400" />
          </div>
          {/* Sparkle accents */}
          <Sparkles className="absolute -top-2 -right-2 size-5 text-amber-400/70 animate-bounce" style={{ animationDuration: "2.5s" }} />
          <Sparkles className="absolute -bottom-1 -left-3 size-4 text-blue-400/50 animate-bounce" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-white/90">
          Belum ada undangan dosen
        </h3>
        <p className="mt-2 max-w-sm text-center text-[13px] leading-relaxed text-slate-500 dark:text-white/40">
          Mulai dengan mengunduh template Excel, isi data dosen, lalu import file untuk membuat undangan digital secara otomatis.
        </p>

        {/* Step guide */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/60 bg-white/70 px-3.5 py-2.5 shadow-sm backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-500/15">
                  <step.icon className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 dark:text-white/80 leading-tight">{step.label}</p>
                  <p className="text-[9px] text-slate-400 dark:text-white/30 font-medium">{step.desc}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <ArrowRight className="hidden size-4 text-slate-300 dark:text-white/15 sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onImportClick}
            className={cn(glassBtnPrimary, "h-10 gap-2 px-5 text-[12px] font-bold shadow-[0_4px_20px_rgba(59,130,246,0.25)] hover:shadow-[0_6px_28px_rgba(59,130,246,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]")}
          >
            <Upload className="size-4" /> Import Excel
          </button>
          <button
            type="button"
            onClick={downloadTemplate}
            className={cn(glassBtnGhost, "h-10 gap-2 px-5 text-[12px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all")}
          >
            <FileSpreadsheet className="size-4" /> Unduh Template
          </button>
        </div>
      </div>
    </LiquidGlassCard>
  );
}

export function UndanganDosenTable({
  data,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  onPreviewClick,
  onShareClick,
  onEditClick,
  onDeleteClick,
  onImportClick,
}: TableProps) {
  const totalPages = Math.ceil(total / limit) || 1;

  if (data.length === 0 && !isLoading) {
    return <EmptyState onImportClick={onImportClick} />;
  }

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-gray-200/60 bg-white/60 shadow-[0_8px_32px_rgba(59,130,246,0.04)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.02]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200/60 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.01]">
              <th className="px-5 py-4 font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider w-[60px]">No</th>
              <th className="px-5 py-4 font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider">Nama & Jabatan</th>
              <th className="px-5 py-4 font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider w-[120px]">NIDN/NIP</th>
              <th className="px-5 py-4 font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider w-[140px]">Kode Undangan</th>
              <th className="px-5 py-4 font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider w-[120px]">Status</th>
              <th className="px-5 py-4 font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider w-[160px]">Waktu Scan</th>
              <th className="px-5 py-4 font-bold text-slate-400 dark:text-white/30 text-center uppercase tracking-wider w-[180px]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04] font-medium text-slate-700 dark:text-white/70">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-400 dark:text-white/20">
                  Memuat data undangan dosen...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-400 dark:text-white/20">
                  Tidak ada data undangan dosen.
                </td>
              </tr>
            ) : (
              data.map((item, idx) => {
                const number = (page - 1) * limit + idx + 1;
                return (
                  <tr
                    key={item.id}
                    onClick={() => onPreviewClick(item)}
                    className="hover:bg-slate-50/30 dark:hover:bg-white/[0.01] transition-all cursor-pointer"
                  >
                    <td className="px-5 py-4 text-slate-400 dark:text-white/20 font-bold">{number}</td>
                    <td className="px-5 py-4">
                      <div>
                        <div className="font-extrabold text-[13px] text-slate-900 dark:text-white leading-tight">
                          {item.nama}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-white/35 mt-1 font-semibold">
                          {item.jabatan}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-600 dark:text-white/50">{item.nidn || "-"}</td>
                    <td className="px-5 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">{item.kode}</td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border",
                          item.statusHadir
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-500/10 border-slate-500/15 text-slate-500 dark:text-white/30"
                        )}
                      >
                        <span className={cn("size-1.5 rounded-full", item.statusHadir ? "bg-emerald-500" : "bg-slate-400")} />
                        {item.statusHadir ? "Hadir" : "Belum Hadir"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[11px] text-slate-500 dark:text-white/40">
                      {item.waktuScan ? new Date(item.waktuScan).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB" : "-"}
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {/* WhatsApp Share */}
                        <button
                          type="button"
                          onClick={() => onShareClick(item)}
                          className="flex size-7.5 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/10 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400 dark:hover:bg-emerald-500/12 transition-all cursor-pointer"
                          title="Bagikan Tautan via WhatsApp"
                        >
                          <Share2 className="size-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => onEditClick(item)}
                          className="flex size-7.5 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white transition-all cursor-pointer"
                          title="Ubah Data"
                        >
                          <Edit2 className="size-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onDeleteClick(item)}
                          className="flex size-7.5 items-center justify-center rounded-lg border border-red-400/30 bg-red-500/5 text-red-600 hover:bg-red-500/10 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-400 dark:hover:bg-red-500/12 transition-all cursor-pointer"
                          title="Hapus Undangan"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200/60 dark:border-white/[0.06] px-5 py-4">
          <div className="text-slate-500 dark:text-white/30 text-[11px] font-semibold">
            Menampilkan <span className="font-extrabold text-slate-800 dark:text-white">{data.length}</span> dari <span className="font-extrabold text-slate-800 dark:text-white">{total}</span> undangan
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 text-slate-500 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-[11px] font-bold cursor-pointer"
            >
              Sebelumnya
            </button>
            <span className="px-3 text-[11px] text-slate-600 dark:text-white/50 font-bold">
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 text-slate-500 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-[11px] font-bold cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
