"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { X, Upload, FileSpreadsheet, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import {
  LiquidGlassCard,
  glassBtnPrimary,
  glassBtnGhost,
} from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const REQUIRED_COLUMNS = ["Nama", "Jabatan"] as const;

interface ExcelRow {
  Nama: string;
  Jabatan: string;
  NIDN?: string | number;
  Email?: string;
  "No WhatsApp"?: string | number;
  [key: string]: unknown;
}

interface ImportResult {
  created: number;
  skipped: number;
  skippedLogs?: string[];
  validationErrors?: string[];
}

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ["Nama", "Jabatan", "NIDN", "Email", "No WhatsApp"],
    ["Prof. Dr. Ir. H. Abdurrahman, M.Pd.", "Rektor UBBG", "0011223344", "rektor@ubbg.ac.id", "628112233445"],
    ["Dr. Cut Dahlia, M.Si.", "Dekan FKIP", "0022334455", "dekan.fkip@ubbg.ac.id", "628223344556"],
  ]);

  ws["!cols"] = [
    { wch: 35 }, { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 16 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template Dosen");
  XLSX.writeFile(wb, "Template_Import_Dosen.xlsx");
}

export function ImportUndanganDosenModal({
  open,
  onClose,
  onSuccess,
}: ImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [skippedLogs, setSkippedLogs] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  if (!open) return null;

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";
    setIsImporting(true);
    setSkippedLogs([]);
    setValidationErrors([]);
    const toastId = toast.loading("Membaca file Excel…");

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error("File Excel tidak memiliki sheet");

      const worksheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
        defval: "",
        raw: false,
      });

      if (rawRows.length === 0) {
        throw new Error("File Excel kosong atau tidak memiliki data");
      }

      // Validasi kolom wajib
      const headers = Object.keys(rawRows[0]);
      const missingCols = REQUIRED_COLUMNS.filter(
        (col) => !headers.some((h) => h.trim().toLowerCase() === col.toLowerCase())
      );
      if (missingCols.length > 0) {
        throw new Error(
          `Kolom wajib tidak ditemukan: ${missingCols.join(", ")}. Pastikan header Excel sesuai template.`
        );
      }

      // Normalisasi
      const payload = rawRows.map((row) => {
        const normalized: Record<string, string> = {};
        for (const [k, v] of Object.entries(row)) {
          normalized[k.trim().toLowerCase()] = String(v ?? "").trim();
        }

        return {
          nama: normalized["nama"] ?? "",
          jabatan: normalized["jabatan"] ?? "",
          nidn: normalized["nidn"] ?? "",
          email: normalized["email"] ?? "",
          noWa: normalized["no whatsapp"] ?? normalized["nowa"] ?? normalized["no. whatsapp"] ?? "",
        };
      }).filter((r) => r.nama && r.jabatan);

      if (payload.length === 0) {
        throw new Error("Tidak ada baris data valid setelah parsing (Nama & Jabatan wajib diisi)");
      }

      toast.loading(`Mengimport ${payload.length} data ke database…`, { id: toastId });

      const res = await api.post<{ data: ImportResult; message: string }>(
        "/api/undangan-dosen/import",
        payload
      );

      const result = res.data.data;

      const parts: string[] = [];
      if (result.created > 0) parts.push(`${result.created} ditambahkan`);
      if (result.skipped > 0) parts.push(`${result.skipped} dilewati/gagal`);

      toast.success(`Import selesai! ${parts.join(", ")}.`, {
        id: toastId,
        duration: 5000,
      });

      if (result.skippedLogs && result.skippedLogs.length > 0) {
        setSkippedLogs(result.skippedLogs);
      }
      if (result.validationErrors && result.validationErrors.length > 0) {
        setValidationErrors(result.validationErrors);
      }

      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mengimport file";
      toast.error(message, { id: toastId, duration: 6000 });
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <LiquidGlassCard hover={false} className="relative z-10 w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/[0.06] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
              <Upload className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Import Undangan Dosen
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-white/35 font-medium mt-0.5">
                Unggah berkas Excel untuk generate undangan secara massal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:text-white/40 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Instructions */}
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-3.5 space-y-2.5 text-xs text-slate-600 dark:text-white/50 leading-relaxed">
            <p>1. Silakan unduh template resmi di bawah ini agar format data sesuai.</p>
            <p>2. Kolom **Nama** dan **Jabatan** wajib diisi. Kolom NIDN, Email, dan No WhatsApp bersifat opsional.</p>
            <p>3. Format nomor WhatsApp sebaiknya menggunakan kode negara (contoh: **62812345678**).</p>
            
            <button
              type="button"
              onClick={downloadTemplate}
              className={cn(glassBtnGhost, "h-8 px-3 text-[10px] font-bold flex items-center gap-1.5 mt-2 bg-white/5")}
            >
              <FileSpreadsheet className="size-3.5" /> Unduh Template Excel
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Upload Area */}
          <div
            onClick={!isImporting ? handleImportClick : undefined}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all",
              isImporting
                ? "border-blue-500/20 bg-blue-500/5 cursor-not-allowed"
                : "border-slate-300 dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5"
            )}
          >
            {isImporting ? (
              <>
                <Loader2 className="size-8 text-blue-500 animate-spin mb-3" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Mengimpor Berkas...</h4>
                <p className="text-[10px] text-slate-400 dark:text-white/30 mt-1">Sistem sedang memvalidasi dan memproses data</p>
              </>
            ) : (
              <>
                <Upload className="size-8 text-slate-400 dark:text-white/30 mb-3" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Pilih File Excel</h4>
                <p className="text-[10px] text-slate-400 dark:text-white/30 mt-1">Format file harus berupa .xlsx atau .xls</p>
              </>
            )}
          </div>

          {/* Error Summary */}
          {(skippedLogs.length > 0 || validationErrors.length > 0) && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertCircle className="size-3.5" /> Rincian Masalah
              </h4>
              <div className="max-h-40 overflow-y-auto text-[10px] space-y-1 font-mono text-red-700 dark:text-rose-200/90 scrollbar-thin scrollbar-thumb-white/10 pr-2">
                {validationErrors.map((err, idx) => (
                  <div key={`val-${idx}`} className="border-b border-red-500/10 pb-0.5 last:border-0">{err}</div>
                ))}
                {skippedLogs.map((log, idx) => (
                  <div key={`skip-${idx}`} className="border-b border-red-500/10 pb-0.5 last:border-0">{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </LiquidGlassCard>
    </div>
  );
}
