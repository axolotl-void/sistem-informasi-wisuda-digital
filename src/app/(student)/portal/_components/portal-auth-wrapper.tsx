"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "./portal-shell";
import { Loader2 } from "lucide-react";
import { readAuthStorage } from "@/store/auth.store";

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

export function PortalAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mahasiswa, setMahasiswa] = useState<MahasiswaUser | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "redirect">("loading");

  useEffect(() => {
    let cancelled = false;

    function fetchMe(authToken: string) {
      fetch("/api/portal/me", {
        headers: { Authorization: `Bearer ${authToken}` },
        credentials: "include",
      })
        .then(async (r) => {
          if (cancelled) return;
          if (!r.ok) {
            localStorage.removeItem("wisuda-auth");
            router.replace("/login");
            return;
          }
          const result = await r.json();
          if (result.data) {
            const d = result.data;
            setMahasiswa({
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
            });
            setStatus("ready");
          } else {
            router.replace("/login");
          }
        })
        .catch(() => {
          if (!cancelled) router.replace("/login");
        });
    }

    async function init() {
      let token: string | null = null;
      let role: string | null = null;
      for (let i = 0; i < 12; i++) {
        const stored = readAuthStorage();
        token = stored.token;
        role = stored.role;
        if (token) break;
        await new Promise((r) => setTimeout(r, 50));
      }

      if (cancelled) return;
      if (!token) {
        router.replace("/login");
        return;
      }

      if (role && role !== "MAHASISWA") {
        if (role === "SUPER_ADMIN" || role === "ADMIN_FAKULTAS") router.replace("/dashboard");
        else if (role === "PETUGAS_SCAN") router.replace("/scan");
        else router.replace("/login");
        return;
      }

      fetchMe(token);
    }

    function handleFotoUpdate() {
      const { token } = readAuthStorage();
      if (token) fetchMe(token);
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
      <div className="min-h-screen bg-[#060d1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-blue-400 animate-spin" />
          <p className="text-sm text-white/30">Memuat portal...</p>
        </div>
      </div>
    );
  }

  return <PortalShell user={mahasiswa}>{children}</PortalShell>;
}
