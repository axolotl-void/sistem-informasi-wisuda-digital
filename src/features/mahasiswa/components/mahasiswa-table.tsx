"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePagination } from "@/hooks/use-pagination";
import { API_ROUTES } from "@/utils/constants";
import { formatDate } from "@/utils/format";
import type { Mahasiswa, MahasiswaPagination } from "@/types/mahasiswa.type";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  AKTIF: "default",
  LULUS: "secondary",
  CUTI: "outline",
  DROPOUT: "destructive",
};

export function MahasiswaTable() {
  const [data, setData] = useState<MahasiswaPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { page, limit } = usePagination();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API_ROUTES.MAHASISWA.BASE, {
        params: { page, limit },
      });
      setData(res.data.data);
    } catch {
      toast.error("Gagal memuat data mahasiswa");
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
            <TableHead>Prodi</TableHead>
            <TableHead>Angkatan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                Tidak ada data mahasiswa
              </TableCell>
            </TableRow>
          ) : (
            data?.data.map((m: Mahasiswa) => (
              <TableRow key={m.id} className="hover:bg-gray-50">
                <TableCell className="font-mono text-sm">{m.nim}</TableCell>
                <TableCell className="font-medium">{m.nama}</TableCell>
                <TableCell className="text-sm text-gray-600">{m.fakultas}</TableCell>
                <TableCell className="text-sm text-gray-600">{m.prodi}</TableCell>
                <TableCell>{m.angkatan}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[m.status] ?? "outline"}>
                    {m.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" aria-label="Edit mahasiswa">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      aria-label="Hapus mahasiswa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
