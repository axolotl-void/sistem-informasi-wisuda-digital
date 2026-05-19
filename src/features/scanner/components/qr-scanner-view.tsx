"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Camera, CameraOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQrScanner } from "@/hooks/use-qr-scanner";
import { useScannerStore } from "@/store/scanner.store";
import { API_ROUTES } from "@/utils/constants";

export function QrScannerView() {
  const { setStatus, setScanResult } = useScannerStore();

  const handleScan = useCallback(
    async (decodedText: string) => {
      setStatus("scanning");
      try {
        const res = await axios.post(API_ROUTES.KEHADIRAN.SCAN, {
          qrToken: decodedText,
        });
        setScanResult(res.data.data);
        if (res.data.data.success) {
          toast.success(res.data.data.message);
        } else {
          toast.error(res.data.data.message);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Gagal memproses scan";
        setScanResult({ success: false, message });
        toast.error(message);
      }
    },
    [setStatus, setScanResult]
  );

  const { containerId, isScanning, hasPermission, startScanning, stopScanning } =
    useQrScanner({
      onScan: handleScan,
      onError: (err) => console.warn("[QR Scanner]", err),
    });

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Kamera Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scanner container */}
        <div
          id={containerId}
          className="w-full aspect-square rounded-lg overflow-hidden bg-gray-900"
        />

        {hasPermission === false && (
          <p className="text-red-400 text-sm text-center">
            Akses kamera ditolak. Izinkan akses kamera di pengaturan browser.
          </p>
        )}

        <Button
          onClick={isScanning ? stopScanning : startScanning}
          className="w-full"
          variant={isScanning ? "destructive" : "default"}
        >
          {isScanning ? (
            <>
              <CameraOff className="h-4 w-4 mr-2" />
              Stop Scanner
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Mulai Scanner
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
