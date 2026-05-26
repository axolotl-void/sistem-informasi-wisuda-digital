import prisma from "@/lib/prisma";
import { KehadiranService } from "@/services/kehadiran.service";
import type { BlokKursiConfig } from "@/app/api/pengaturan/blok-kursi/route";
import type { DashboardActivityItem, DashboardOverview } from "@/types/dashboard.type";

const DEFAULT_BLOK: BlokKursiConfig = {
  kuning: 39,
  biru: 52,
  ungu: 52,
  hijau: 39,
  kuotaPendamping: 2,
};

const DEFAULT_GATE_TOTAL = 4;
const VIP_SEAT_COUNT = 20;

async function getBlokKapasitas(): Promise<number> {
  const record = await prisma.konfigurasiSistem.findUnique({
    where: { key: "blok_kursi" },
  });
  if (!record) {
    return (
      DEFAULT_BLOK.kuning +
      DEFAULT_BLOK.biru +
      DEFAULT_BLOK.ungu +
      DEFAULT_BLOK.hijau
    );
  }
  try {
    const cfg = JSON.parse(record.value) as BlokKursiConfig;
    return (cfg.kuning ?? 0) + (cfg.biru ?? 0) + (cfg.ungu ?? 0) + (cfg.hijau ?? 0);
  } catch {
    return 182;
  }
}

function nimToSeatLabel(nim: string, index: number): string {
  const row = String.fromCharCode(65 + Math.floor(index / 10));
  const num = (index % 10) + 1;
  return `${row}-${num}`;
}

function mapKehadiranStatus(
  status: string,
): DashboardActivityItem["status"] {
  if (status === "HADIR" || status === "TERLAMBAT") return "success";
  if (status === "TIDAK_HADIR") return "pending";
  return "failed";
}

export class DashboardService {
  static async getOverview(): Promise<DashboardOverview> {
    const kehadiranStats = await KehadiranService.getStats();
    const kapasitasKursi = await getBlokKapasitas();

    const [
      totalMahasiswa,
      totalUndangan,
      scanHariIni,
      petugasAktif,
      lokasiRow,
      vipInvitations,
    ] = await Promise.all([
      prisma.mahasiswa.count({ where: { status: { in: ["AKTIF", "LULUS"] } } }),
      prisma.undangan.count({
        where: { statusUndangan: { in: ["AKTIF", "DIGUNAKAN"] } },
      }),
      prisma.kehadiran.count({
        where: {
          waktuScan: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.kehadiran.findMany({
        distinct: ["petugasId"],
        select: { petugasId: true },
      }),
      prisma.undangan.findFirst({
        where: { statusUndangan: { in: ["AKTIF", "DIGUNAKAN"] } },
        select: { tempatWisuda: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.undangan.findMany({
        where: { statusUndangan: { in: ["AKTIF", "DIGUNAKAN"] } },
        include: { kehadiran: true, mahasiswa: { select: { nim: true } } },
        orderBy: { mahasiswa: { nim: "asc" } },
        take: VIP_SEAT_COUNT,
      }),
    ]);

    const totalKehadiran = kehadiranStats.hadir + kehadiranStats.terlambat;
    const undanganTerkirimPersen =
      totalMahasiswa > 0
        ? Math.round((totalUndangan / totalMahasiswa) * 1000) / 10
        : 0;

    const tamuVipHadir = vipInvitations.filter(
      (inv) =>
        inv.kehadiran?.statusKehadiran === "HADIR" ||
        inv.kehadiran?.statusKehadiran === "TERLAMBAT",
    ).length;

    const gateAktif = Math.min(
      DEFAULT_GATE_TOTAL,
      Math.max(1, petugasAktif.length || (totalKehadiran > 0 ? 1 : 0)),
    );

    return {
      totalUndangan,
      totalMahasiswa,
      undanganTerkirimPersen,
      totalKehadiran,
      belumHadir: kehadiranStats.tidakHadir,
      persentaseKehadiran: Math.round(kehadiranStats.persentaseKehadiran * 1000) / 10,
      scanHariIni,
      gateAktif: totalKehadiran > 0 ? gateAktif : 0,
      gateTotal: DEFAULT_GATE_TOTAL,
      kursiTerisi: totalKehadiran,
      kapasitasKursi,
      tamuVipTotal: vipInvitations.length,
      tamuVipHadir,
      lokasiUtama: lokasiRow?.tempatWisuda ?? "Auditorium Utama",
    };
  }

  static async getRecentActivity(limit = 10): Promise<DashboardActivityItem[]> {
    const [kehadiranList, nimIndexMap] = await Promise.all([
      prisma.kehadiran.findMany({
        take: limit,
        orderBy: { waktuScan: "desc" },
        include: {
          mahasiswa: { select: { nama: true, nim: true } },
        },
      }),
      DashboardService.buildSeatIndexMap(),
    ]);

    const petugasIds = [...new Set(kehadiranList.map((k) => k.petugasId))];
    const petugasUsers =
      petugasIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: petugasIds } },
            select: { id: true, name: true },
          })
        : [];
    const petugasMap = new Map(petugasUsers.map((u) => [u.id, u.name]));

    return kehadiranList.map((k) => {
      const seatIndex = nimIndexMap.get(k.mahasiswa.nim) ?? 0;
      const waktu = k.waktuScan.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      return {
        id: k.id,
        time: waktu,
        name: k.mahasiswa.nama,
        seat: nimToSeatLabel(k.mahasiswa.nim, seatIndex),
        gate: petugasMap.get(k.petugasId) ?? "Scanner Gate",
        status: mapKehadiranStatus(k.statusKehadiran),
      };
    });
  }

  private static async buildSeatIndexMap(): Promise<Map<string, number>> {
    const invitations = await prisma.undangan.findMany({
      where: { statusUndangan: { in: ["AKTIF", "DIGUNAKAN"] } },
      include: { mahasiswa: { select: { nim: true } } },
      orderBy: { mahasiswa: { nim: "asc" } },
    });

    const map = new Map<string, number>();
    invitations.forEach((inv, index) => {
      if (inv.mahasiswa?.nim) map.set(inv.mahasiswa.nim, index);
    });
    return map;
  }
}
