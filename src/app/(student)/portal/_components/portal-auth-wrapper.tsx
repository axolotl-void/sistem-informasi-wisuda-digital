"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "./portal-shell";
import { Loader2 } from "lucide-react";
import {
  readAuthStorage,
  syncAuthFromSession,
  fetchWithAuth,
  clearClientAuth,
} from "@/lib/client-auth";

interface MahasiswaUser {
  id: string;
  nama: string;
  nim: string;
  fakultas: string;
  prodi: string;
  sesiWisuda: string | null;
  foto: string | null;
  avatar: string;
}

function mapMahasiswa(d: {
  id: string;
  nama: string;
  nim: string;
  fakultas: string;
  prodi: string;
  sesiWisuda?: string | null;
  foto?: string | null;
}): MahasiswaUser {
  return {
    id: d.id,
    nama: d.nama,
    nim: d.nim,
    fakultas: d.fakultas,
    prodi: d.prodi,
    sesiWisuda: d.sesiWisuda ?? null,
    foto: d.foto ?? null,
    avatar: d.nama
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function PortalAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mahasiswa, setMahasiswa] = useState<MahasiswaUser | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "redirect">("loading");
  const redirectingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    function goLogin() {
      if (redirectingRef.current || cancelled) return;
      redirectingRef.current = true;
      clearClientAuth();
      setStatus("redirect");
      router.replace("/login");
    }

    async function resolveAuth(): Promise<boolean> {
      let token: string | null = null;
      let role: string | null = null;

      for (let i = 0; i < 40; i++) {
        const stored = readAuthStorage();
        token = stored.token;
        role = stored.role;
        if (token) break;
        await delay(50);
      }

      if (!token) {
        await syncAuthFromSession();
        token = readAuthStorage().token;
        role = readAuthStorage().role;
      }

      if (cancelled) return false;

      if (role && role !== "MAHASISWA") {
        redirectingRef.current = true;
        setStatus("redirect");
        if (role === "SUPER_ADMIN" || role === "ADMIN_FAKULTAS") {
          router.replace("/dashboard");
        } else if (role === "PETUGAS_SCAN") {
          router.replace("/scan");
        } else {
          router.replace("/login");
        }
        return false;
      }

      for (let attempt = 0; attempt < 3; attempt++) {
        if (cancelled) return false;

        const r = await fetchWithAuth("/api/portal/me");
        if (r.ok) {
          const result = await r.json();
          if (result.data) {
            if (!token) await syncAuthFromSession();
            setMahasiswa(mapMahasiswa(result.data));
            setStatus("ready");
            return true;
          }
        }

        if (attempt < 2) {
          await syncAuthFromSession();
          token = readAuthStorage().token;
          await delay(120 * (attempt + 1));
        }
      }

      return false;
    }

    async function init() {
      const ok = await resolveAuth();
      if (!ok && !cancelled) goLogin();
    }

    function handleFotoUpdate() {
      void resolveAuth();
    }

    void init();
    window.addEventListener("storage", handleFotoUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleFotoUpdate);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading" || !mahasiswa) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060d1a]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-blue-400" />
          <p className="text-sm text-white/30">Memuat portal...</p>
        </div>
      </div>
    );
  }

  return <PortalShell user={mahasiswa}>{children}</PortalShell>;
}
