"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortalShell } from "./portal-shell";
import { Loader2 } from "lucide-react";

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
    // Baca langsung dari localStorage — tidak bergantung pada Zustand hydration timing
    let token: string | null = null;
    let role: string | null = null;

    try {
      const raw = localStorage.getItem("wisuda-auth");
      if (raw) {
        const parsed = JSON.parse(raw) as {
          state?: { token?: string; user?: { role?: string } };
        };
        token = parsed?.state?.token ?? null;
        role = parsed?.state?.user?.role ?? null;
      }
    } catch {
      // localStorage tidak tersedia
    }

    if (!token) { router.replace("/login"); return; }

    if (role && role !== "MAHASISWA") {
      if (role === "SUPER_ADMIN" || role === "ADMIN_FAKULTAS") router.replace("/dashboard");
      else if (role === "PETUGAS_SCAN") router.replace("/scan");
      else router.replace("/login");
      return;
    }

    function fetchMe() {
      fetch("/api/portal/me", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
        .then(async (r) => {
          if (!r.ok) { localStorage.removeItem("wisuda-auth"); router.replace("/login"); return; }
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
              avatar: d.nama.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
            });
            setStatus("ready");
          } else {
            router.replace("/login");
          }
        })
        .catch(() => router.replace("/login"));
    }

    fetchMe();

    // Listen untuk update foto dari halaman profil
    function handleFotoUpdate() { fetchMe(); }
    window.addEventListener("storage", handleFotoUpdate);
    return () => window.removeEventListener("storage", handleFotoUpdate);
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
