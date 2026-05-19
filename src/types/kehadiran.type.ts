export type StatusKehadiran = "HADIR" | "TIDAK_HADIR" | "TERLAMBAT";

export interface Kehadiran {
  id: string;
  undanganId: string;
  undangan?: import("./undangan.type").Undangan;
  mahasiswaId: string;
  mahasiswa?: import("./mahasiswa.type").Mahasiswa;
  petugasId: string;
  statusKehadiran: StatusKehadiran;
  waktuScan: Date;
  catatan?: string;
  createdAt: Date;
}

export interface ScanQrDto {
  qrToken: string;
  petugasId: string;
}

export interface ScanResult {
  success: boolean;
  message: string;
  kehadiran?: Kehadiran;
  mahasiswa?: import("./mahasiswa.type").Mahasiswa;
}

export interface KehadiranFilter {
  statusKehadiran?: StatusKehadiran;
  tanggalWisuda?: Date;
  fakultas?: string;
  search?: string;
}

export interface KehadiranStats {
  total: number;
  hadir: number;
  tidakHadir: number;
  terlambat: number;
  persentaseKehadiran: number;
}

export interface KehadiranPagination {
  data: Kehadiran[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
