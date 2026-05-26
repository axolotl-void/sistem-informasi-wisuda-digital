export interface DashboardOverview {
  totalUndangan: number;
  totalMahasiswa: number;
  undanganTerkirimPersen: number;
  totalKehadiran: number;
  belumHadir: number;
  persentaseKehadiran: number;
  scanHariIni: number;
  gateAktif: number;
  gateTotal: number;
  kursiTerisi: number;
  kapasitasKursi: number;
  tamuVipTotal: number;
  tamuVipHadir: number;
  lokasiUtama: string;
}

export interface DashboardActivityItem {
  id: string;
  time: string;
  name: string;
  seat: string;
  gate: string;
  status: "success" | "failed" | "pending";
}
