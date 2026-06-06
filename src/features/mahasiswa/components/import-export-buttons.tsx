"use client";

import { useRef, useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Upload, Download, Loader2, FileSpreadsheet, AlertCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import axios from "axios";
import { cn } from "@/lib/utils";
import { glassBtnGhost, LiquidGlassCard } from "@/components/ui/liquid-glass";

// --- Types --------------------------------------------------------------------

/** Kolom wajib yang harus ada di file Excel */
const REQUIRED_COLUMNS = ["No", "NIM", "Nama", "Fakultas", "Prodi", "Angkatan"] as const;
type RequiredColumn = (typeof REQUIRED_COLUMNS)[number];

interface ExcelRow {
  No:       string | number;
  NIM:      string | number;
  Nama:     string;
  Email?:   string;
  Fakultas: string;
  Prodi:    string;
  Angkatan: string | number;
  "Tahun Lulus"?: string | number;
  "IPK"?:         string | number;
  "Tanggal Lulus"?: string;
  [key: string]: unknown;
}

interface ImportResult {
  created:          number;
  updated?:         number;
  skipped:          number;
  skippedDuplicate: number;
  skippedError:     number;
  skippedLogs?:     string[];
  validationErrors?: string[];
}

interface ImportExportButtonsProps {
  onImportSuccess?: () => void;
}

// --- Template download helper -------------------------------------------------

function downloadTemplate(isCumlaude = false) {
  const ws = XLSX.utils.aoa_to_sheet([
    ["No", "NIM", "Nama", "Email", "Fakultas", "Prodi", "Angkatan", "Tahun Lulus", "IPK", "Tanggal Lulus"],
    [1, "23210001", isCumlaude ? "Contoh Mahasiswa Cumlaude" : "Contoh Mahasiswa", "contoh@email.com", "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)", "S1 Pendidikan Matematika", 2023, 2027, 3.85, "2027-06-07"],
  ]);

  // Set lebar kolom
  ws["!cols"] = [
    { wch: 6 }, { wch: 14 }, { wch: 30 }, { wch: 30 },
    { wch: 28 }, { wch: 24 }, { wch: 10 }, { wch: 12 }, { wch: 8 }, { wch: 15 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, isCumlaude ? "Template Cumlaude" : "Template");
  XLSX.writeFile(wb, isCumlaude ? "Template_Import_Wisudawan_Cumlaude.xlsx" : "Template_Import_Wisudawan.xlsx");
}

// --- Problems Dialog Component ------------------------------------------------

function ProblemsDialog({
  open,
  problems,
  onClose,
  onClear,
}: {
  open: boolean;
  problems: string[];
  onClose: () => void;
  onClear: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />
      <LiquidGlassCard hover={false} className="relative z-10 w-full max-w-lg p-6">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
          <AlertTriangle className="size-5 text-red-500 dark:text-red-400" />
        </div>

        <h2 className="text-base font-bold text-slate-900 dark:text-white/90">
          Detail Masalah Impor Excel
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-white/45">
          Berikut adalah rincian data yang dilewati atau gagal diimpor pada proses impor terakhir:
        </p>

        <div className="mt-4 max-h-52 overflow-y-auto space-y-2 pr-1 font-mono text-[10.5px] leading-relaxed text-slate-700 dark:text-rose-200/90 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
          {problems.map((prob, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl border border-red-500/10 bg-red-500/5 flex items-start gap-2"
            >
              <span className="text-red-600 dark:text-red-400/70 font-bold select-none">{idx + 1}.</span>
              <span className="break-all">{prob}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClear}
            className={cn(glassBtnGhost, "h-10 flex-1 justify-center text-xs font-semibold")}
          >
            Bersihkan Pengingat
          </button>
          <button
            type="button"
            onClick={onClose}
            className={cn(glassBtnGhost, "h-10 flex-1 justify-center text-xs font-semibold border-red-400/35 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/18")}
          >
            Tutup
          </button>
        </div>
      </LiquidGlassCard>
    </div>
  );
}

// --- Main Component -----------------------------------------------------------

export function ImportExportButtons({ onImportSuccess }: ImportExportButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importMode, setImportMode] = useState<"regular" | "cumlaude">("regular");

  const [problems, setProblems] = useState<string[]>([]);
  const [showProblemsDialog, setShowProblemsDialog] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("import_skipped_logs");
      if (stored) {
        setProblems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load import logs", e);
    }
  }, []);

  const saveProblems = (logs: string[]) => {
    setProblems(logs);
    try {
      if (logs.length > 0) {
        localStorage.setItem("import_skipped_logs", JSON.stringify(logs));
      } else {
        localStorage.removeItem("import_skipped_logs");
      }
    } catch (e) {
      console.error("Failed to save import logs", e);
    }
  };

  // -- IMPORT ------------------------------------------------------------------

  function handleImportClick() {
    setImportMode("regular");
    fileInputRef.current?.click();
  }

  function handleImportCumlaudeClick() {
    setImportMode("cumlaude");
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input agar file yang sama bisa dipilih ulang
    e.target.value = "";

    setIsImporting(true);
    const toastId = toast.loading("Membaca file Excel…");

    try {
      // 1. Baca file dengan FileReader
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error("File Excel tidak memiliki sheet");

      const worksheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
        defval: "",
        raw: false, // semua nilai sebagai string dulu
      });

      if (rawRows.length === 0) {
        throw new Error("File Excel kosong atau tidak memiliki data");
      }

      // 2. Validasi kolom
      const headers = Object.keys(rawRows[0]);
      const missingCols = REQUIRED_COLUMNS.filter(
        (col) => !headers.some((h) => h.trim().toLowerCase() === col.toLowerCase())
      );
      if (missingCols.length > 0) {
        throw new Error(
          `Kolom wajib tidak ditemukan: ${missingCols.join(", ")}. ` +
          `Pastikan header Excel sesuai template.`
        );
      }

      // 3. Normalisasi key (case-insensitive) dan map ke payload
      const payload = rawRows.map((row) => {
        // Buat map lowercase untuk lookup fleksibel
        const normalized: Record<string, string> = {};
        for (const [k, v] of Object.entries(row)) {
          normalized[k.trim().toLowerCase()] = String(v ?? "").trim();
        }

        return {
          nomorUrut: normalized["no"] ? parseInt(normalized["no"], 10) : null,
          nim:      normalized["nim"]      ?? "",
          nama:     normalized["nama"]     ?? "",
          email:    normalized["email"]    ?? "",
          fakultas: normalized["fakultas"] ?? "",
          prodi:    normalized["prodi"]    ?? "",
          angkatan: parseInt(normalized["angkatan"] ?? "0", 10),
          tahunLulus: normalized["tahun lulus"] && !isNaN(parseInt(normalized["tahun lulus"], 10))
            ? parseInt(normalized["tahun lulus"], 10)
            : null,
          ipk: normalized["ipk"] && !isNaN(parseFloat(normalized["ipk"].replace(",", ".")))
            ? parseFloat(normalized["ipk"].replace(",", "."))
            : null,
          tanggalLulus: normalized["tanggal lulus"] || null,
        };
      }).filter((r) => r.nim && r.nama); // buang baris kosong

      if (payload.length === 0) {
        throw new Error("Tidak ada baris data valid setelah parsing");
      }

      toast.loading(`Mengimport ${payload.length} data ke database…`, { id: toastId });

      // 4. Kirim ke API
      const res = await api.post<{ data: ImportResult; message: string }>(
        `/api/mahasiswa/import${importMode === "cumlaude" ? "?cumlaude=true" : ""}`,
        payload
      );

      const result = res.data.data;

      // 5. Tampilkan hasil
      const parts: string[] = [];
      if (result.created > 0)          parts.push(`${result.created} ditambahkan`);
      if (result.updated && result.updated > 0) parts.push(`${result.updated} diupdate`);
      if (result.skippedDuplicate > 0) parts.push(`${result.skippedDuplicate} duplikat dilewati`);
      if (result.skippedError > 0)     parts.push(`${result.skippedError} gagal`);

      toast.success(`Import selesai! ${parts.join(", ")}.`, {
        id: toastId,
        duration: 5000,
      });

      // Gabungkan logs gagal insert dan logs error validasi
      const allProblems = [
        ...(result.skippedLogs ?? []),
        ...(result.validationErrors ?? []),
      ];
      saveProblems(allProblems);

      if (result.skippedLogs && result.skippedLogs.length > 0) {
        toast.error(`${result.skippedLogs.length} baris dilewati/gagal`, {
          description: (
            <div className="max-h-40 overflow-y-auto text-xs space-y-1 mt-1.5 pr-2 font-mono scrollbar-thin scrollbar-thumb-white/10 text-rose-200">
              {result.skippedLogs.map((log, index) => (
                <div key={index} className="border-b border-white/5 pb-1 last:border-0">{log}</div>
              ))}
            </div>
          ),
          duration: 10000,
        });
      }

      if (result.validationErrors && result.validationErrors.length > 0) {
        toast.warning(`${result.validationErrors.length} baris memiliki error validasi`, {
          description:
            result.validationErrors.slice(0, 3).join("\n") +
            (result.validationErrors.length > 3
              ? `\n…dan ${result.validationErrors.length - 3} lainnya`
              : ""),
          duration: 8000,
        });
      }

      onImportSuccess?.();
    } catch (err) {
      let validationErrors: string[] = [];
      let errMsg = "Gagal mengimport file";

      if (axios.isAxiosError(err) && err.response?.data) {
        const resData = err.response.data as { message?: string; errors?: { errors?: string[] } };
        errMsg = resData.message || errMsg;
        if (resData.errors?.errors && Array.isArray(resData.errors.errors)) {
          validationErrors = resData.errors.errors;
        }
      } else if (err instanceof Error) {
        errMsg = err.message;
      }

      if (validationErrors.length > 0) {
        saveProblems(validationErrors);
      } else {
        saveProblems([]);
      }

      toast.error(errMsg, { id: toastId, duration: 6000 });
    } finally {
      setIsImporting(false);
    }
  }

  // -- EXPORT ------------------------------------------------------------------

  async function handleExport() {
    if (isExporting) return;
    setIsExporting(true);
    const toastId = toast.loading("Mengambil data dari database…");

    try {
      // 1. Fetch data dari API
      const res = await api.get<{ data: Record<string, unknown>[] }>(
        "/api/mahasiswa/export"
      );
      const rows = res.data.data;

      if (!rows || rows.length === 0) {
        toast.info("Tidak ada data untuk diekspor", { id: toastId });
        return;
      }

      toast.loading(`Membuat file Excel untuk ${rows.length} data…`, { id: toastId });

      // 2. Buat worksheet dari JSON
      const ws = XLSX.utils.json_to_sheet(rows);

      // Set lebar kolom otomatis berdasarkan header
      const headers = Object.keys(rows[0]);
      ws["!cols"] = headers.map((h) => ({
        wch: Math.max(h.length + 2, 14),
      }));

      // 3. Buat workbook dan append sheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Wisudawan");

      // 4. Trigger download
      const year = new Date().getFullYear();
      XLSX.writeFile(wb, `Data_Wisudawan_${year}.xlsx`);

      toast.success(`${rows.length} data berhasil diekspor`, {
        id: toastId,
        duration: 4000,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mengekspor data";
      toast.error(message, { id: toastId, duration: 6000 });
    } finally {
      setIsExporting(false);
    }
  }

  // -- Render -------------------------------------------------------------------

  const btnGhost = cn(
    glassBtnGhost,
    "h-9 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
  );

  const handleClearProblems = () => {
    saveProblems([]);
    setShowProblemsDialog(false);
    toast.success("Pengingat masalah dibersihkan");
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id="import-excel-file-input"
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Pilih file Excel untuk diimport"
      />

      {/* Masalah button */}
      {problems.length > 0 && (
        <button
          type="button"
          onClick={() => setShowProblemsDialog(true)}
          className="h-9 px-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 dark:border-red-500/30 dark:bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 animate-pulse"
          title={`Ada ${problems.length} masalah dari impor terakhir`}
        >
          <AlertCircle className="size-3.5" />
          <span>Masalah ({problems.length})</span>
        </button>
      )}

      {/* Import button */}
      <button
        type="button"
        onClick={handleImportClick}
        disabled={isImporting || isExporting}
        className={btnGhost}
        title="Import data dari file Excel (.xlsx)"
      >
        {isImporting && importMode === "regular" ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Upload className="size-3" />
        )}
        <span className="hidden sm:inline">
          {isImporting && importMode === "regular" ? "Mengimport…" : "Import Excel"}
        </span>
      </button>

      {/* Template download button */}
      <button
        type="button"
        onClick={() => downloadTemplate(false)}
        disabled={isImporting || isExporting}
        className={btnGhost}
        title="Download template Excel untuk import"
      >
        <FileSpreadsheet className="size-3" />
        <span className="hidden sm:inline">Template</span>
      </button>

      {/* Import Cumlaude button */}
      <button
        type="button"
        onClick={handleImportCumlaudeClick}
        disabled={isImporting || isExporting}
        className={cn(
          btnGhost,
          "border-amber-400/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:border-amber-500/30 dark:bg-amber-500/10 hover:bg-amber-500/20"
        )}
        title="Import data wisudawan Cumlaude dari file Excel (.xlsx)"
      >
        {isImporting && importMode === "cumlaude" ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Upload className="size-3 text-amber-500" />
        )}
        <span className="hidden sm:inline">
          {isImporting && importMode === "cumlaude" ? "Mengimport…" : "Import Cumlaude"}
        </span>
      </button>

      {/* Template Cumlaude download button */}
      <button
        type="button"
        onClick={() => downloadTemplate(true)}
        disabled={isImporting || isExporting}
        className={cn(
          btnGhost,
          "border-amber-400/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:border-amber-500/30 dark:bg-amber-500/10 hover:bg-amber-500/20"
        )}
        title="Download template Excel untuk import wisudawan Cumlaude"
      >
        <FileSpreadsheet className="size-3 text-amber-500" />
        <span className="hidden sm:inline">Template Cumlaude</span>
      </button>

      {/* Export button */}
      <button
        type="button"
        onClick={handleExport}
        disabled={isImporting || isExporting}
        className={btnGhost}
        title="Export semua data ke file Excel"
      >
        {isExporting ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Download className="size-3" />
        )}
        <span className="hidden sm:inline">
          {isExporting ? "Mengekspor…" : "Export Excel"}
        </span>
      </button>

      {/* Dialog Detail Masalah */}
      <ProblemsDialog
        open={showProblemsDialog}
        problems={problems}
        onClose={() => setShowProblemsDialog(false)}
        onClear={handleClearProblems}
      />
    </>
  );
}
