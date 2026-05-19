export type StatusUndangan = "AKTIF" | "DIGUNAKAN" | "KADALUARSA" | "DIBATALKAN";

export interface Undangan {
  id: string;
  kode: string;
  mahasiswaId: string;
  mahasiswa?: import("./mahasiswa.type").Mahasiswa;
  qrToken: string;
  qrImageUrl?: string;
  statusUndangan: StatusUndangan;
  tanggalWisuda: Date;
  tempatWisuda: string;
  kuotaTamu: number;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUndanganDto {
  mahasiswaId: string;
  tanggalWisuda: Date;
  tempatWisuda: string;
  kuotaTamu: number;
}

export interface UpdateUndanganDto extends Partial<CreateUndanganDto> {
  statusUndangan?: StatusUndangan;
}

export interface UndanganFilter {
  statusUndangan?: StatusUndangan;
  tanggalWisuda?: Date;
  mahasiswaId?: string;
  search?: string;
}

export interface UndanganPagination {
  data: Undangan[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
