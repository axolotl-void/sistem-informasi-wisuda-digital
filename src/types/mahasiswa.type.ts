export type StatusMahasiswa = "AKTIF" | "LULUS" | "CUTI" | "DROPOUT";

export interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
  email: string;
  fakultas: string;
  prodi: string;
  angkatan: number;
  status: StatusMahasiswa;
  foto?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMahasiswaDto {
  nim: string;
  nama: string;
  email: string;
  fakultas: string;
  prodi: string;
  angkatan: number;
  userId: string;
}

export interface UpdateMahasiswaDto extends Partial<CreateMahasiswaDto> {
  status?: StatusMahasiswa;
  foto?: string;
}

export interface MahasiswaFilter {
  fakultas?: string;
  prodi?: string;
  angkatan?: number;
  status?: StatusMahasiswa;
  search?: string;
}

export interface MahasiswaPagination {
  data: Mahasiswa[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
