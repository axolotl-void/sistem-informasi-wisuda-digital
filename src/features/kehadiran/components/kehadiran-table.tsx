"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePagination } from "@/hooks/use-pagination";
import { API_ROUTES } from "@/utils/constants";
import { formatDateTime } from "@/utils/format";
import type { Kehadiran, KehadiranPagination } from "@/types/kehadiran.type";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  HADIR: "default",
  TERLAMBAT: "secondary",
  TIDAK_HADIR: "destructive",
};

export function KehadiranTable() {
  const [data, setData] = useState<KehadiranPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { page, limit } = usePagination();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API_ROUTES.KEHADIRAN.BASE, {
        params: { page, limit },
      });
      setData(res.data.data);
    } catch {
      toast.error("Gagal memuat data kehadiran");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>NIM</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Fakultas</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Waktu Scan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                Belum ada data kehadiran
              </TableCell>
            </TableRow>
          ) : (
            data?.data.map((k: Kehadiran) => (
              <TableRow key={k.id} className="hover:bg-gray-50">
                <TableCell className="font-mono text-sm">
                  {k.mahasiswa?.nim ?? "-"}
                </TableCell>
                <TableCell className="font-medium">
                  {k.mahasiswa?.nama ?? "-"}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {k.mahasiswa?.fakultas ?? "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[k.statusKehadiran] ?? "outline"}>
                    {k.statusKehadiran}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatDateTime(k.waktuScan)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
