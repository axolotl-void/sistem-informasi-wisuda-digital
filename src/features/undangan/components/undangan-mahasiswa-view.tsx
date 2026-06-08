"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/axios";
import { Download, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/format";
import { API_ROUTES } from "@/utils/constants";
import type { Undangan } from "@/types/undangan.type";

interface UndanganMahasiswaViewProps {
  mahasiswaId: string;
}

export function UndanganMahasiswaView({ mahasiswaId }: UndanganMahasiswaViewProps) {
  const [undangan, setUndangan] = useState<Undangan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUndangan = async () => {
      try {
        const res = await api.get(API_ROUTES.UNDANGAN.BASE, {
          params: { mahasiswaId },
        });
        setUndangan(res.data.data?.data?.[0] ?? null);
      } catch {
        // handle silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchUndangan();
  }, [mahasiswaId]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!undangan) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-gray-400">Undangan wisuda belum tersedia.</p>
          <p className="text-sm text-gray-400 mt-1">
            Silakan hubungi admin fakultas Anda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Undangan Wisuda Anda</CardTitle>
          <Badge>{undangan.statusUndangan}</Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          {undangan.qrImageUrl && (
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                <Image
                  src={undangan.qrImageUrl}
                  alt="QR Code Undangan"
                  width={200}
                  height={200}
                  className="block"
                />
              </div>
              <p className="text-xs text-gray-400 font-mono">{undangan.kode}</p>
            </div>
          )}

          {/* Detail */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Tanggal Wisuda</p>
              <p className="font-medium">{formatDate(undangan.tanggalWisuda)}</p>
            </div>
            <div>
              <p className="text-gray-500">Tempat</p>
              <p className="font-medium">{undangan.tempatWisuda}</p>
            </div>
            <div>
              <p className="text-gray-500">Kuota Tamu</p>
              <p className="font-medium">{undangan.kuotaTamu} orang</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Simpan QR
            </Button>
            <Button className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
