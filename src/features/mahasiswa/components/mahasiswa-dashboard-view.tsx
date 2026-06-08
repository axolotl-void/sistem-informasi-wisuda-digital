"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/format";
import { API_ROUTES } from "@/utils/constants";
import type { Mahasiswa } from "@/types/mahasiswa.type";
import type { Undangan } from "@/types/undangan.type";

interface MahasiswaDashboardViewProps {
  mahasiswaId: string;
}

export function MahasiswaDashboardView({ mahasiswaId }: MahasiswaDashboardViewProps) {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa | null>(null);
  const [undangan, setUndangan] = useState<Undangan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, uRes] = await Promise.all([
          api.get(`${API_ROUTES.MAHASISWA.BASE}/${mahasiswaId}`),
          api.get(API_ROUTES.UNDANGAN.BASE, {
            params: { mahasiswaId },
          }),
        ]);
        setMahasiswa(mRes.data.data);
        setUndangan(uRes.data.data?.data?.[0] ?? null);
      } catch {
        // handle silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [mahasiswaId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Mahasiswa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Mahasiswa</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">NIM</p>
            <p className="font-medium">{mahasiswa?.nim ?? "-"}</p>
          </div>
          <div>
            <p className="text-gray-500">Nama</p>
            <p className="font-medium">{mahasiswa?.nama ?? "-"}</p>
          </div>
          <div>
            <p className="text-gray-500">Fakultas</p>
            <p className="font-medium">{mahasiswa?.fakultas ?? "-"}</p>
          </div>
          <div>
            <p className="text-gray-500">Program Studi</p>
            <p className="font-medium">{mahasiswa?.prodi ?? "-"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Status Undangan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status Undangan Wisuda</CardTitle>
        </CardHeader>
        <CardContent>
          {undangan ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status</span>
                <Badge>{undangan.statusUndangan}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Tanggal Wisuda</span>
                <span className="font-medium">{formatDate(undangan.tanggalWisuda)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Tempat</span>
                <span className="font-medium">{undangan.tempatWisuda}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              Undangan belum tersedia
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
