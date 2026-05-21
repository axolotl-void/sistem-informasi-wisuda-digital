"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

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
  const isMountedRef = useRef(true);
  const containerId = "qr-scanner-container";

  // Use refs for callbacks to avoid recreating startScanning when callbacks change
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const startScanning = useCallback(async () => {
    if (scannerRef.current) return;

    try {
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps, qrbox: { width: qrbox, height: qrbox } },
        (decodedText) => {
          onScanRef.current(decodedText);
        },
        (errorMessage) => {
          // Ignore frequent "not found" errors
          if (!errorMessage.includes("No MultiFormat Readers")) {
            onErrorRef.current?.(errorMessage);
          }
        }
      );

      // Check if the component is still mounted.
      // If it was unmounted while the camera was starting (React Strict Mode double-mounting),
      // stop it immediately to prevent camera leaks.
      if (!isMountedRef.current) {
        try {
          const isRunning = scanner.isScanning || 
                            scanner.getState() === Html5QrcodeScannerState.SCANNING || 
                            scanner.getState() === Html5QrcodeScannerState.PAUSED;
          if (isRunning) {
            await scanner.stop();
          }
        } catch (stopErr) {
          console.warn("[QR Scanner] Error stopping on rapid unmount:", stopErr);
        }
        try {
          scanner.clear();
        } catch (clearErr) {
          console.warn("[QR Scanner] Error clearing on rapid unmount:", clearErr);
        }
        if (scannerRef.current === scanner) {
          scannerRef.current = null;
        }
        return;
      }

      setIsScanning(true);
      setHasPermission(true);
    } catch (err) {
      setHasPermission(false);
      onErrorRef.current?.(err instanceof Error ? err.message : "Gagal mengakses kamera");
      scannerRef.current = null;
    }
  }, [fps, qrbox]);

  const stopScanning = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) {
      setIsScanning(false);
      return;
    }

    try {
      const isRunning = scanner.isScanning || 
                        scanner.getState() === Html5QrcodeScannerState.SCANNING || 
                        scanner.getState() === Html5QrcodeScannerState.PAUSED;
      if (isRunning) {
        await scanner.stop();
      }
    } catch (err) {
      console.warn("[QR Scanner] Error stopping scanner:", err);
    }

    try {
      scanner.clear();
    } catch (err) {
      console.warn("[QR Scanner] Error clearing scanner:", err);
    }

    scannerRef.current = null;
    setIsScanning(false);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      
      // Safe cleanup on unmount with a small timeout to let any active transitions settle
      setTimeout(() => {
        if (scannerRef.current) {
          const scanner = scannerRef.current;
          try {
            const isRunning = scanner.isScanning || 
                              scanner.getState() === Html5QrcodeScannerState.SCANNING || 
                              scanner.getState() === Html5QrcodeScannerState.PAUSED;
            if (isRunning) {
              scanner.stop()
                .then(() => {
                  try { scanner.clear(); } catch {}
                })
                .catch((err) => {
                  console.warn("[QR Scanner] Failed to stop on unmount:", err);
                  try { scanner.clear(); } catch {}
                });
            } else {
              try { scanner.clear(); } catch {}
            }
          } catch (err) {
            console.warn("[QR Scanner] Error during unmount cleanup:", err);
          }
          scannerRef.current = null;
        }
      }, 50);
    };
  }, []);

  return {
    containerId,
    isScanning,
    hasPermission,
    startScanning,
    stopScanning,
  };
}
