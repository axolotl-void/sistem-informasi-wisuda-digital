"use client";

import { CheckCircle2, XCircle, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useScannerStore } from "@/store/scanner.store";
import { formatDateTime } from "@/utils/format";

export function ScanResultPanel() {
  const { lastResult, status, totalScanned, scanHistory } = useScannerStore();

  return (
    <div className="space-y-4">
      {/* Current result */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-base">Hasil Scan</CardTitle>
        </CardHeader>
        <CardContent>
          {status === "idle" && (
            <div className="text-center py-8 text-gray-400">
              <Clock className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Menunggu scan...</p>
            </div>
          )}

          {status === "success" && lastResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Berhasil</span>
              </div>
              <p className="text-white text-sm">{lastResult.message}</p>
              {lastResult.mahasiswa && (
                <div className="bg-gray-700 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <User className="h-4 w-4" />
                    <span className="font-medium text-white">
                      {lastResult.mahasiswa.nama}
                    </span>
                  </div>
                  <p className="text-gray-400 pl-6">{lastResult.mahasiswa.nim}</p>
                  <p className="text-gray-400 pl-6">{lastResult.mahasiswa.fakultas}</p>
                </div>
              )}
            </div>
          )}

          {status === "error" && lastResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Gagal</span>
              </div>
              <p className="text-gray-300 text-sm">{lastResult.message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Counter */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-white">{totalScanned}</p>
            <p className="text-gray-400 text-sm mt-1">Total scan berhasil</p>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {scanHistory.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Riwayat Scan</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {scanHistory.slice(0, 10).map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs">
                  {item.success ? (
                    <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-400 shrink-0" />
                  )}
                  <span className="text-gray-300 truncate">
                    {item.mahasiswa?.nama ?? item.message}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
