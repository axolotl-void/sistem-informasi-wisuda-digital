"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface UseQrScannerOptions {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
  fps?: number;
  qrbox?: number;
}

export function useQrScanner({
  onScan,
  onError,
  fps = 10,
  qrbox = 250,
}: UseQrScannerOptions) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const containerId = "qr-scanner-container";

  const startScanning = useCallback(async () => {
    if (isScanning) return;

    try {
      scannerRef.current = new Html5Qrcode(containerId);

      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps, qrbox: { width: qrbox, height: qrbox } },
        (decodedText) => {
          onScan(decodedText);
        },
        (errorMessage) => {
          // Ignore frequent "not found" errors
          if (!errorMessage.includes("No MultiFormat Readers")) {
            onError?.(errorMessage);
          }
        }
      );

      setIsScanning(true);
      setHasPermission(true);
    } catch (err) {
      setHasPermission(false);
      onError?.(err instanceof Error ? err.message : "Gagal mengakses kamera");
    }
  }, [isScanning, fps, qrbox, onScan, onError]);

  const stopScanning = useCallback(async () => {
    if (!scannerRef.current || !isScanning) return;
    try {
      await scannerRef.current.stop();
      scannerRef.current.clear();
    } catch {
      // ignore
    }
    setIsScanning(false);
  }, [isScanning]);

  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isScanning]);

  return {
    containerId,
    isScanning,
    hasPermission,
    startScanning,
    stopScanning,
  };
}
