import prisma from "@/lib/prisma";
import { emitScanResult, emitStatsUpdate } from "@/lib/socket";
import { KehadiranService } from "./kehadiran.service";
import type { ScanQrDto, ScanResult } from "@/types/kehadiran.type";

export class ScannerService {
  /**
   * Proses scan QR code
   */
  static async processQrScan(dto: ScanQrDto): Promise<ScanResult> {
    const { qrToken, petugasId, gate } = dto;

    // Cari undangan berdasarkan QR token
    const undangan = await prisma.undangan.findFirst({
      where: { qrToken },
      include: { mahasiswa: true },
    });

    if (!undangan) {
      // Cari di undangan dosen
      const undanganDosen = await prisma.undanganDosen.findFirst({
        where: { qrToken },
      });

      if (undanganDosen) {
        if (undanganDosen.statusHadir) {
          const result: ScanResult = {
            success: false,
            message: "Undangan dosen sudah digunakan sebelumnya",
            mahasiswa: {
              nama: undanganDosen.nama,
              nim: undanganDosen.kode,
              fakultas: undanganDosen.jabatan,
              prodi: "Dosen / Civitas",
            } as any,
          };
          emitScanResult(result);
          return result;
        }

        // Catat kehadiran dosen
        await prisma.undanganDosen.update({
          where: { id: undanganDosen.id },
          data: {
            statusHadir: true,
            waktuScan: new Date(),
            petugasId,
          },
        });

        const result: ScanResult = {
          success: true,
          message: `Selamat datang, ${undanganDosen.nama}!`,
          mahasiswa: {
            nama: undanganDosen.nama,
            nim: undanganDosen.kode,
            fakultas: undanganDosen.jabatan,
            prodi: "Dosen / Civitas",
            status: "LULUS",
          } as any,
        };

        emitScanResult(result);

        const stats = await KehadiranService.getStats();
        emitStatsUpdate(stats as unknown as Record<string, unknown>);

        return result;
      }

      // Cari di undangan tamu
      const undanganTamu = await prisma.undanganTamu.findFirst({
        where: { qrToken },
        include: { mahasiswa: true },
      });

      if (undanganTamu) {
        if (undanganTamu.statusHadir) {
          const result: ScanResult = {
            success: false,
            message: `Undangan tamu "${undanganTamu.namaTamu}" sudah digunakan sebelumnya`,
            mahasiswa: {
              nama: `Tamu: ${undanganTamu.namaTamu}`,
              nim: undanganTamu.kode,
              fakultas: `Tamu dari ${undanganTamu.mahasiswa.nama}`,
              prodi: undanganTamu.hubungan || "Tamu",
            } as any,
          };
          emitScanResult(result);
          return result;
        }

        if (undanganTamu.statusUndangan === "DIBATALKAN") {
          const result: ScanResult = {
            success: false,
            message: "Undangan tamu telah dibatalkan",
          };
          emitScanResult(result);
          return result;
        }

        // Catat kehadiran tamu
        await prisma.undanganTamu.update({
          where: { id: undanganTamu.id },
          data: {
            statusHadir: true,
            statusUndangan: "DIGUNAKAN",
            waktuScan: new Date(),
            gate,
            petugasId,
          },
        });

        const result: ScanResult = {
          success: true,
          message: `Selamat datang, ${undanganTamu.namaTamu}! (Tamu dari ${undanganTamu.mahasiswa.nama})`,
          mahasiswa: {
            nama: `Tamu: ${undanganTamu.namaTamu}`,
            nim: undanganTamu.kode,
            fakultas: `Tamu dari ${undanganTamu.mahasiswa.nama}`,
            prodi: undanganTamu.hubungan || "Tamu",
            status: "LULUS",
          } as any,
        };

        emitScanResult(result);

        const stats = await KehadiranService.getStats();
        emitStatsUpdate(stats as unknown as Record<string, unknown>);

        return result;
      }

      const result: ScanResult = {
        success: false,
        message: "QR Code tidak valid atau tidak ditemukan",
      };
      emitScanResult(result);
      return result;
    }

    if (undangan.statusUndangan === "KADALUARSA") {
      const result: ScanResult = {
        success: false,
        message: "Undangan sudah kadaluarsa",
      };
      emitScanResult(result);
      return result;
    }

    if (undangan.statusUndangan === "DIBATALKAN") {
      const result: ScanResult = {
        success: false,
        message: "Undangan telah dibatalkan",
      };
      emitScanResult(result);
      return result;
    }

    // Cek apakah sudah pernah scan
    const existingKehadiran = await prisma.kehadiran.findFirst({
      where: { undanganId: undangan.id },
    });

    if (existingKehadiran) {
      const result: ScanResult = {
        success: false,
        message: "Undangan sudah digunakan sebelumnya",
        mahasiswa: undangan.mahasiswa as never,
      };
      emitScanResult(result);
      return result;
    }

    // Catat kehadiran
    const kehadiran = await KehadiranService.create({
      undanganId: undangan.id,
      mahasiswaId: undangan.mahasiswaId,
      petugasId,
      statusKehadiran: "HADIR",
      waktuScan: new Date(),
      gate,
    });

    // Update status undangan
    await prisma.undangan.update({
      where: { id: undangan.id },
      data: { statusUndangan: "DIGUNAKAN" },
    });

    // Emit realtime update
    const result: ScanResult = {
      success: true,
      message: `Selamat datang, ${undangan.mahasiswa.nama}!`,
      kehadiran: kehadiran as never,
      mahasiswa: undangan.mahasiswa as never,
    };

    emitScanResult(result);

    // Update stats
    const stats = await KehadiranService.getStats();
    emitStatsUpdate(stats as unknown as Record<string, unknown>);

    return result;
  }

  /**
   * Validasi QR token tanpa mencatat kehadiran (preview)
   */
  static async validateQrToken(qrToken: string): Promise<{
    valid: boolean;
    message: string;
    undangan?: Record<string, unknown>;
  }> {
    const undangan = await prisma.undangan.findFirst({
      where: { qrToken },
      include: { mahasiswa: true },
    });

    if (!undangan) {
      return { valid: false, message: "QR Code tidak valid" };
    }

    if (undangan.statusUndangan !== "AKTIF") {
      return {
        valid: false,
        message: `Status undangan: ${undangan.statusUndangan}`,
        undangan: undangan as unknown as Record<string, unknown>,
      };
    }

    return {
      valid: true,
      message: "QR Code valid",
      undangan: undangan as unknown as Record<string, unknown>,
    };
  }
}
