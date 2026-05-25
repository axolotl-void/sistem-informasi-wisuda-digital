"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

type QrBoxFn = (
  viewfinderWidth: number,
  viewfinderHeight: number,
) => { width: number; height: number };

/**
 * Opsional: qrbox kecil memicu overlay hitam (#qr-shaded-region) dari library.
 * Default: tidak set qrbox → scan seluruh frame, tanpa garis hitam, jarak jauh OK.
 */
export const DEFAULT_SCAN_QRBOX_RATIO = 0.92;

export function defaultScanQrbox(
  viewfinderWidth: number,
  viewfinderHeight: number,
): { width: number; height: number } {
  return {
    width: Math.floor(viewfinderWidth * DEFAULT_SCAN_QRBOX_RATIO),
    height: Math.floor(viewfinderHeight * DEFAULT_SCAN_QRBOX_RATIO),
  };
}

interface UseQrScannerOptions {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
  /** Frame per detik — lebih tinggi = deteksi lebih responsif */
  fps?: number;
  qrbox?: number | QrBoxFn;
}

export function useQrScanner({
  onScan,
  onError,
  fps = 18,
  qrbox,
}: UseQrScannerOptions) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const isMountedRef = useRef(true);
  const isStartingRef = useRef(false);
  const activeStreamsRef = useRef<MediaStream[]>([]);
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

  // Helper to stop all captured streams
  const stopActiveStreams = useCallback(() => {
    activeStreamsRef.current.forEach((stream) => {
      try {
        if (stream && typeof stream.getTracks === "function") {
          stream.getTracks().forEach((track) => {
            console.log("[QR Scanner] Stopping captured track:", track.label, track.kind);
            track.stop();
          });
        }
      } catch (e) {
        console.warn("[QR Scanner] Error stopping captured stream track:", e);
      }
    });
    activeStreamsRef.current = [];
  }, []);

  // Helper to find and stop tracks on all video elements in DOM
  const stopAllVideoTracks = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const videoElements = document.querySelectorAll("video");
        videoElements.forEach((video) => {
          const stream = video.srcObject as MediaStream;
          if (stream && typeof stream.getTracks === "function") {
            stream.getTracks().forEach((track) => {
              console.log("[QR Scanner] Stopping video element track:", track.label, track.kind);
              track.stop();
            });
            video.srcObject = null;
          }
        });
      } catch (e) {
        console.warn("[QR Scanner] Error stopping video element tracks:", e);
      }
    }
  }, []);

  const startScanning = useCallback(async () => {
    if (scannerRef.current || isStartingRef.current) return;
    isStartingRef.current = true;

    // Clean up any existing active streams/tracks before starting a new one
    stopActiveStreams();
    stopAllVideoTracks();

    let originalGetUserMedia: any = null;
    let patched = false;

    // Temporarily patch getUserMedia to capture the MediaStream instance
    if (typeof window !== "undefined" && navigator.mediaDevices) {
      try {
        const mediaDevices = navigator.mediaDevices as any;
        if (mediaDevices.getUserMedia) {
          originalGetUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
          mediaDevices.getUserMedia = async (constraints: any) => {
            const stream = await originalGetUserMedia(constraints);
            activeStreamsRef.current.push(stream);
            return stream;
          };
          patched = true;
        }
      } catch (e) {
        console.warn("[QR Scanner] Failed to patch getUserMedia:", e);
      }
    }

    try {
      const scanner = new Html5Qrcode(containerId, {
        verbose: false,
        useBarCodeDetectorIfSupported: true,
      });
      scannerRef.current = scanner;

      const scanConfig: {
        fps: number;
        disableFlip: boolean;
        videoConstraints: MediaTrackConstraints;
        qrbox?: number | { width: number; height: number } | QrBoxFn;
      } = {
        fps,
        disableFlip: false,
        videoConstraints: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      // Hanya kirim qrbox jika diminta eksplisit — kalau tidak, library scan full frame tanpa overlay hitam
      if (qrbox !== undefined) {
        scanConfig.qrbox =
          typeof qrbox === "number"
            ? { width: qrbox, height: qrbox }
            : qrbox;
      }

      await scanner.start(
        { facingMode: "environment" },
        scanConfig,
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
          (scanner as any).clear?.();
        } catch (clearErr) {
          console.warn("[QR Scanner] Error clearing on rapid unmount:", clearErr);
        }
        stopActiveStreams();
        stopAllVideoTracks();
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
      // If start failed, clean up any stream that might have been partially opened
      stopActiveStreams();
      stopAllVideoTracks();
    } finally {
      // Restore getUserMedia
      if (patched && originalGetUserMedia && typeof window !== "undefined" && navigator.mediaDevices) {
        try {
          (navigator.mediaDevices as any).getUserMedia = originalGetUserMedia;
        } catch (e) {
          console.warn("[QR Scanner] Failed to restore getUserMedia:", e);
        }
      }
      isStartingRef.current = false;
    }
  }, [fps, qrbox, stopActiveStreams, stopAllVideoTracks]);

  const stopScanning = useCallback(async () => {
    const scanner = scannerRef.current;
    
    try {
      if (scanner) {
        const isRunning = scanner.isScanning || 
                          scanner.getState() === Html5QrcodeScannerState.SCANNING || 
                          scanner.getState() === Html5QrcodeScannerState.PAUSED;
        if (isRunning) {
          await scanner.stop();
        }
      }
    } catch (err) {
      console.warn("[QR Scanner] Error stopping scanner:", err);
    } finally {
      // ALWAYS stop all captured streams and video element tracks
      stopActiveStreams();
      stopAllVideoTracks();

      try {
        if (scanner) {
          (scanner as any).clear?.();
        }
      } catch (err) {
        console.warn("[QR Scanner] Error clearing scanner:", err);
      }

      scannerRef.current = null;
      setIsScanning(false);
    }
  }, [stopActiveStreams, stopAllVideoTracks]);

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
                  try { (scanner as any).clear?.(); } catch {}
                })
                .catch((err) => {
                  console.warn("[QR Scanner] Failed to stop on unmount:", err);
                  try { (scanner as any).clear?.(); } catch {}
                });
            } else {
              try { (scanner as any).clear?.(); } catch {}
            }
          } catch (err) {
            console.warn("[QR Scanner] Error during unmount cleanup:", err);
          }
          scannerRef.current = null;
        }

        // ALWAYS stop all captured streams and video element tracks on unmount
        stopActiveStreams();
        stopAllVideoTracks();
      }, 50);
    };
  }, [stopActiveStreams, stopAllVideoTracks]);

  return {
    containerId,
    isScanning,
    hasPermission,
    startScanning,
    stopScanning,
  };
}
