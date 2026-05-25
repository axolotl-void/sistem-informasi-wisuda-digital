"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Upload, Download, Loader2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { glassBtnGhost } from "@/components/ui/liquid-glass";

// --- Types --------------------------------------------------------------------

/** Kolom wajib yang harus ada di file Excel */
const REQUIRED_COLUMNS = ["NIM", "Nama", "Email", "Fakultas", "Prodi", "Angkatan"] as const;
type RequiredColumn = (typeof REQUIRED_COLUMNS)[number];

interface ExcelRow {
  NIM:      string | number;
  Nama:     string;
  Email:    string;
  Fakultas: string;
  Prodi:    string;
  Angkatan: string | number;
  [key: string]: unknown;
}

interface ImportResult {
  created:          number;
  skipped:          number;
  skippedDuplicate: number;
  skippedError:     number;
  validationErrors?: string[];
}

interface ImportExportButtonsProps {
  onImportSuccess?: () => void;
}

// --- Template download helper -------------------------------------------------

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ["NIM", "Nama", "Email", "Fakultas", "Prodi", "Angkatan"],
    ["23210001", "Contoh Mahasiswa", "contoh@email.com", "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)", "S1 Pendidikan Matematika", 2023],
  ]);

  // Set lebar kolom
  ws["!cols"] = [
    { wch: 14 }, { wch: 30 }, { wch: 30 },
    { wch: 28 }, { wch: 24 }, { wch: 10 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, "Template_Import_Wisudawan.xlsx");
}

// --- Main Component -----------------------------------------------------------

export function ImportExportButtons({ onImportSuccess }: ImportExportButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // -- IMPORT ------------------------------------------------------------------

  function handleImportClick() {
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
          nim:      normalized["nim"]      ?? "",
          nama:     normalized["nama"]     ?? "",
          email:    normalized["email"]    ?? "",
          fakultas: normalized["fakultas"] ?? "",
          prodi:    normalized["prodi"]    ?? "",
          angkatan: parseInt(normalized["angkatan"] ?? "0", 10),
        };
      }).filter((r) => r.nim && r.nama); // buang baris kosong

      if (payload.length === 0) {
        throw new Error("Tidak ada baris data valid setelah parsing");
      }

      toast.loading(`Mengimport ${payload.length} data ke database…`, { id: toastId });

      // 4. Kirim ke API
      const res = await api.post<{ data: ImportResult; message: string }>(
        "/api/mahasiswa/import",
        payload
      );

      const result = res.data.data;

      // 5. Tampilkan hasil
      const parts: string[] = [];
      if (result.created > 0)          parts.push(`${result.created} ditambahkan`);
      if (result.skippedDuplicate > 0) parts.push(`${result.skippedDuplicate} duplikat dilewati`);
      if (result.skippedError > 0)     parts.push(`${result.skippedError} gagal`);

      toast.success(`Import selesai! ${parts.join(", ")}.`, {
        id: toastId,
        duration: 5000,
      });

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
      const message = err instanceof Error ? err.message : "Gagal mengimport file";
      toast.error(message, { id: toastId, duration: 6000 });
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

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Pilih file Excel untuk diimport"
      />

      {/* Import button */}
      <button
        type="button"
        onClick={handleImportClick}
        disabled={isImporting || isExporting}
        className={btnGhost}
        title="Import data dari file Excel (.xlsx)"
      >
        {isImporting ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Upload className="size-3" />
        )}
        <span className="hidden sm:inline">
          {isImporting ? "Mengimport…" : "Import Excel"}
        </span>
      </button>

      {/* Template download button */}
      <button
        type="button"
        onClick={downloadTemplate}
        disabled={isImporting || isExporting}
        className={btnGhost}
        title="Download template Excel untuk import"
      >
        <FileSpreadsheet className="size-3" />
        <span className="hidden sm:inline">Template</span>
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
    </>
  );
}
