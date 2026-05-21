import type { Invitation, InvitationStats } from "./types";

const faculties = [
  "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)",
  "Fakultas Sains, Teknologi, dan Ilmu Kesehatan (FSTIK)",
];

const prodis = [
  "S1 Pendidikan Bahasa dan Sastra Aceh",
  "S1 Pendidikan Bahasa Indonesia",
  "S1 Pendidikan Bahasa Inggris",
  "S1 Pendidikan Matematika",
  "S1 Pendidikan Jasmani",
  "S1 Pendidikan Guru Sekolah Dasar (PGSD)",
  "S1 Ilmu Komputer",
  "S1 Keperawatan",
  "S1 Kebidanan"
];

const statuses = [
  "belum_generate",
  "qr_aktif",
  "qr_aktif",
  "qr_aktif",
  "sudah_download",
  "sudah_download",
  "sudah_hadir",
  "sudah_hadir",
  "sudah_hadir",
  "expired",
] as const;

const attendances = [
  "belum_hadir",
  "belum_hadir",
  "hadir",
  "hadir",
  "hadir",
  "terlambat",
  "tidak_hadir",
] as const;

const firstNames = ["Ahmad", "Siti", "Budi", "Rina", "Dimas", "Putri", "Rizky", "Ayu", "Fajar", "Dewi", "Hendra", "Maya", "Reza", "Nadia", "Bagas"];
const lastNames = ["Pratama", "Sari", "Hidayat", "Lestari", "Ramadhan", "Utami", "Nugroho", "Wati", "Santoso", "Kurniawan"];
const sesis = ["Sesi Pagi", "Sesi Siang", "Sesi Sore"];
const gedungs = ["Auditorium Utama", "Gedung Serbaguna", "Aula Besar"];
const gates = ["Gate 1", "Gate 2", "Gate 3", "Gate 4"];

function pad(n: number) { return String(n).padStart(4, "0"); }

export function generateMockInvitations(count = 48): Invitation[] {
  return Array.from({ length: count }, (_, i) => {
    const status = statuses[i % statuses.length];
    const attendance = attendances[i % attendances.length];
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const fak = faculties[i % faculties.length];
    const prodi = prodis[i % prodis.length];
    const sesi = sesis[i % sesis.length];
    const gedung = gedungs[i % gedungs.length];
    const row = String.fromCharCode(65 + (i % 8));
    const col = (i % 25) + 1;
    const kuota = [2, 3, 4][i % 3];
    const hadir = status === "sudah_hadir" ? Math.floor(Math.random() * kuota) + 1 : 0;

    const scanHistory = status === "sudah_hadir" ? [
      {
        id: `sh-${i}-1`,
        timestamp: `2026-05-19T0${8 + (i % 3)}:${pad(i % 60)}:00`,
        gate: gates[i % 4],
        type: "masuk" as const,
        petugasName: "Petugas Gate",
      },
    ] : [];

    return {
      id: `inv-${pad(i + 1)}`,
      kode: `WIS-2026-${pad(i + 1)}`,
      qrToken: `QR-${pad(i + 1)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      qrImageUrl: "",
      status,
      attendance,
      mahasiswaId: `mhs-${pad(i + 1)}`,
      mahasiswaNama: `${firstName} ${lastName}`,
      nim: `2022${pad(i + 1)}`,
      fakultas: fak,
      prodi,
      sesi,
      tanggalWisuda: "2026-05-19",
      waktuMulai: sesi === "Sesi Pagi" ? "08:00" : sesi === "Sesi Siang" ? "13:00" : "16:00",
      waktuSelesai: sesi === "Sesi Pagi" ? "12:00" : sesi === "Sesi Siang" ? "16:00" : "19:00",
      gedung,
      ruangan: `Ruang ${row}`,
      nomorKursi: `${row}-${col}`,
      kuotaTamu: kuota,
      tamuHadir: hadir,
      generatedAt: status !== "belum_generate" ? "2026-05-10T09:00:00" : undefined,
      downloadedAt: ["sudah_download", "sudah_hadir"].includes(status) ? "2026-05-15T14:30:00" : undefined,
      firstScanAt: status === "sudah_hadir" ? `2026-05-19T0${8 + (i % 3)}:${pad(i % 60)}:00` : undefined,
      lastScanAt: status === "sudah_hadir" ? `2026-05-19T0${8 + (i % 3)}:${pad(i % 60)}:00` : undefined,
      scanCount: status === "sudah_hadir" ? 1 : 0,
      scanHistory,
      gate: status === "sudah_hadir" ? gates[i % 4] : undefined,
    };
  });
}

export function computeStats(invitations: Invitation[]): InvitationStats {
  return {
    total: invitations.length,
    qrAktif: invitations.filter((i) => i.status === "qr_aktif").length,
    belumGenerate: invitations.filter((i) => i.status === "belum_generate").length,
    sudahDownload: invitations.filter((i) => i.status === "sudah_download").length,
    sudahHadir: invitations.filter((i) => i.status === "sudah_hadir").length,
    totalKuotaTamu: invitations.reduce((acc, i) => acc + i.kuotaTamu, 0),
  };
}
