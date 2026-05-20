"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import type { WisudawanRow, WisudawanPagination, WisudawanFilter } from "@/services/wisudawan.service";

const BASE = "/api/wisudawan";

export function useWisudawan() {
  const [data, setData] = useState<WisudawanRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAll = useCallback(
    async (filter: WisudawanFilter = {}, page = 1, limit = 10) => {
      setIsLoading(true);
      try {
        const res = await api.get<{ data: WisudawanPagination }>(BASE, {
          params: { ...filter, page, limit },
        });
        setData(res.data.data.data);
        setTotal(res.data.data.total);
        setTotalPages(res.data.data.totalPages);
      } catch {
        toast.error("Gagal memuat data wisudawan");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const create = useCallback(async (input: Record<string, unknown>) => {
    const res = await api.post(BASE, input);
    toast.success("Akun wisudawan berhasil dibuat");
    return res.data.data as WisudawanRow;
  }, []);

  const update = useCallback(async (id: string, input: Record<string, unknown>) => {
    const res = await api.patch(`${BASE}/${id}`, input);
    toast.success("Data berhasil diperbarui");
    const updated = res.data.data as WisudawanRow;
    // Perbarui data lokal agar tabel langsung reflect perubahan
    setData((prev) => prev.map((s) => s.id === id ? { ...s, ...updated } : s));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await api.delete(`${BASE}/${id}`);
    toast.success("Akun berhasil dihapus");
    setData((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const resetPassword = useCallback(async (id: string, autoGenerate = true) => {
    const res = await api.post(`${BASE}/${id}/reset-password`, { autoGenerate });
    toast.success("Password berhasil direset");
    return res.data.data as { newPassword: string };
  }, []);

  const verify = useCallback(
    async (id: string, action: "approve" | "reject" | "revision") => {
      const res = await api.post(`${BASE}/${id}/verify`, { action });
      const label = action === "approve" ? "disetujui" : action === "reject" ? "ditolak" : "diminta revisi";
      toast.success(`Akun berhasil ${label}`);
      setData((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: action === "approve" ? "LULUS" : action === "reject" ? "DROPOUT" : "AKTIF" }
            : s
        )
      );
      return res.data.data;
    },
    []
  );

  const generateInvitation = useCallback(async (id: string) => {
    const res = await api.post(`${BASE}/${id}/generate-invitation`);
    toast.success("Undangan berhasil digenerate");
    setData((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, hasUndangan: true, undanganKode: res.data.data.kode, undanganStatus: "AKTIF" }
          : s
      )
    );
    return res.data.data as { kode: string; qrToken: string };
  }, []);

  return {
    data,
    total,
    totalPages,
    isLoading,
    fetchAll,
    create,
    update,
    remove,
    resetPassword,
    verify,
    generateInvitation,
  };
}
