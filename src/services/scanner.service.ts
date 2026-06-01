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
