// --- Undangan Feature Types ---------------------------------------------------

export type InvitationStatus =
  | "belum_generate"
  | "qr_aktif"
  | "sudah_download"
  | "sudah_hadir"
  | "expired"
  | "invalid";

export type AttendanceStatus = "belum_hadir" | "hadir" | "terlambat" | "tidak_hadir";

export interface ScanHistory {
  id: string;
  timestamp: string;
  gate: string;
  type: "masuk" | "keluar";
  petugasName: string;
}

export interface Invitation {
  id: string;
  kode: string;
  qrToken: string;
  qrImageUrl: string;
  status: InvitationStatus;
  attendance: AttendanceStatus;

  // Mahasiswa
  mahasiswaId: string;
  mahasiswaNama: string;
  nim: string;
  fakultas: string;
  prodi: string;
  foto?: string;

  // Event
  sesi: string;
  tanggalWisuda: string;
  waktuMulai: string;
  waktuSelesai: string;
  gedung: string;
  ruangan: string;
  nomorKursi: string;

  // Guest
  kuotaTamu: number;
  tamuHadir: number;

  // Meta
  generatedAt?: string;
  downloadedAt?: string;
  firstScanAt?: string;
  lastScanAt?: string;
  scanCount: number;
  scanHistory: ScanHistory[];
  gate?: string;
}

export interface InvitationStats {
  total: number;
  qrAktif: number;
  belumGenerate: number;
  sudahDownload: number;
  sudahHadir: number;
  totalKuotaTamu: number;
}

export interface GenerateOptions {
  mahasiswaIds: string[];
  tanggalWisuda: string;
  waktuMulai: string;
  waktuSelesai: string;
  gedung: string;
  ruangan: string;
  kuotaTamu: number;
  sesi: string;
}
