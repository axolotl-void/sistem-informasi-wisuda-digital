import QRCode from "qrcode";
import { QR_CONFIG } from "./constants";

export interface QrGenerateOptions {
  width?: number;
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generate QR code sebagai Data URL (base64)
 */
export async function generateQrDataUrl(
  data: string,
  options?: QrGenerateOptions
): Promise<string> {
  return QRCode.toDataURL(data, {
    width: options?.width ?? QR_CONFIG.WIDTH,
    margin: options?.margin ?? QR_CONFIG.MARGIN,
    errorCorrectionLevel: options?.errorCorrectionLevel ?? QR_CONFIG.ERROR_CORRECTION,
    color: {
      dark: options?.color?.dark ?? "#000000",
      light: options?.color?.light ?? "#ffffff",
    },
  });
}

/**
 * Generate QR code sebagai SVG string
 */
export async function generateQrSvg(
  data: string,
  options?: QrGenerateOptions
): Promise<string> {
  return QRCode.toString(data, {
    type: "svg",
    width: options?.width ?? QR_CONFIG.WIDTH,
    margin: options?.margin ?? QR_CONFIG.MARGIN,
    errorCorrectionLevel: options?.errorCorrectionLevel ?? QR_CONFIG.ERROR_CORRECTION,
  });
}

/**
 * Generate QR code sebagai Buffer (untuk PDF/file)
 */
export async function generateQrBuffer(
  data: string,
  options?: QrGenerateOptions
): Promise<Buffer> {
  return QRCode.toBuffer(data, {
    width: options?.width ?? QR_CONFIG.WIDTH,
    margin: options?.margin ?? QR_CONFIG.MARGIN,
    errorCorrectionLevel: options?.errorCorrectionLevel ?? QR_CONFIG.ERROR_CORRECTION,
  });
}

/**
 * Generate token unik untuk QR undangan
 */
export function generateQrToken(mahasiswaId: string, undanganId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `WIS-${mahasiswaId.slice(0, 8)}-${undanganId.slice(0, 8)}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Validasi format QR token
 */
export function isValidQrToken(token: string): boolean {
  return /^WIS-[A-Z0-9]{8}-[A-Z0-9]{8}-[A-Z0-9]+-[A-Z0-9]+$/.test(token);
}
