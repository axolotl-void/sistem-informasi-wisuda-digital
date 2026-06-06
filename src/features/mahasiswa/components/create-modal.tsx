"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWisudawan } from "@/hooks/use-wisudawan";
import { api } from "@/lib/axios";
import { FAKULTAS_LIST } from "@/utils/constants";

const majors: Record<string, string[]> = {
  "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)": [
    "S1 Pendidikan Bahasa dan Sastra Aceh",
    "S1 Pendidikan Bahasa Indonesia",
    "S1 Pendidikan Bahasa Inggris",
    "S1 Pendidikan Matematika",
    "S1 Pendidikan Jasmani",
    "S1 Pendidikan Guru Sekolah Dasar (PGSD)",
    "S1 Pendidikan Guru Pendidikan Anak Usia Dini (PG PAUD)",
    "S1 Pendidikan Ilmu Pengetahuan Alam (Pendidikan IPA)",
    "S1 Pendidikan Seni Pertunjukan",
    "S2 Penjaminan Mutu Pendidikan",
    "S2 Pendidikan Dasar",
    "Pendidikan Profesi Guru (PPG)"
  ],
  "Fakultas Sains, Teknologi, dan Ilmu Kesehatan (FSTIK)": [
    "S1 Ilmu Komputer",
    "S1 Keperawatan",
    "S1 Kebidanan"
  ],
};

interface Props {
  open: boolean;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  height: 36, width: "100%", borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.06)",
  background: "rgba(255,255,255,0.03)",
  padding: "0 12px", fontSize: 13, fontWeight: 500,
  color: "white", outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 700,
  letterSpacing: "0.12em", textTransform: "uppercase" as const,
  color: "rgba(255,255,255,0.25)", marginBottom: 6,
};

export function CreateAccountModal({ open, onClose }: Props) {
  const { create } = useWisudawan();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    nama: "", nim: "", email: "", password: "", fakultas: "", prodi: "", angkatan: new Date().getFullYear(),
  });

  function set(key: string, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await create(form);
      setForm({ nama: "", nim: "", email: "", password: "", fakultas: "", prodi: "", angkatan: new Date().getFullYear() });
      onClose();
    } catch (err) {
      const axiosErr = err as { response?: { data?: { errors?: { fieldErrors?: Record<string, string[]> } } } };
      if (axiosErr?.response?.data?.errors?.fieldErrors) {
        const fe = axiosErr.response.data.errors.fieldErrors;
        const mapped: Record<string, string> = {};
        for (const [k, v] of Object.entries(fe)) mapped[k] = v[0];
        setErrors(mapped);
      } else {
        toast.error(err instanceof Error ? err.message : "Gagal membuat akun");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="create-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16, background: "rgba(0,0,0,0.5)",
          }}
        >
          <motion.div
            key="create-modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative", width: "100%", maxWidth: 448,
              borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)",
              background: "#0C1525", padding: 20,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
            }}
          >
            {/* Top reflection */}
            <div style={{
              position: "absolute", inset: "0 0 auto 0", height: 1,
              background: "linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)",
              borderRadius: "16px 16px 0 0",
            }} />

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: "white", margin: 0 }}>
                Tambah Akun Wisudawan
              </h3>
              <button type="button" onClick={onClose} style={{
                display: "flex", width: 24, height: 24, alignItems: "center", justifyContent: "center",
                borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.3)", cursor: "pointer",
              }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Nama Lengkap</label>
                    <input style={inputStyle} placeholder="Ahmad Pratama" value={form.nama} onChange={(e) => set("nama", e.target.value)} />
                    {errors.nama && <p style={{ marginTop: 4, fontSize: 10, color: "rgba(248,113,113,0.8)" }}>{errors.nama}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>NIM</label>
                    <input style={inputStyle} placeholder="20241001" value={form.nim} onChange={(e) => set("nim", e.target.value)} />
                    {errors.nim && <p style={{ marginTop: 4, fontSize: 10, color: "rgba(248,113,113,0.8)" }}>{errors.nim}</p>}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input style={inputStyle} type="email" placeholder="ahmad@kampus.ac.id" value={form.email} onChange={(e) => set("email", e.target.value)} />
                    {errors.email && <p style={{ marginTop: 4, fontSize: 10, color: "rgba(248,113,113,0.8)" }}>{errors.email}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Password (Opsional)</label>
                    <input style={inputStyle} type="password" placeholder="Default: NIM wisudawan" value={form.password} onChange={(e) => set("password", e.target.value)} />
                    {errors.password && <p style={{ marginTop: 4, fontSize: 10, color: "rgba(248,113,113,0.8)" }}>{errors.password}</p>}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Fakultas</label>
                    <select style={{ ...inputStyle, cursor: "pointer" }} value={form.fakultas} onChange={(e) => { set("fakultas", e.target.value); set("prodi", ""); }}>
                      <option value="" style={{ background: "#0C1525" }}>Pilih fakultas</option>
                      {FAKULTAS_LIST.map((f) => <option key={f} value={f} style={{ background: "#0C1525" }}>{f}</option>)}
                    </select>
                    {errors.fakultas && <p style={{ marginTop: 4, fontSize: 10, color: "rgba(248,113,113,0.8)" }}>{errors.fakultas}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Program Studi</label>
                    <select style={{ ...inputStyle, cursor: "pointer", opacity: form.fakultas ? 1 : 0.5 }} value={form.prodi} onChange={(e) => set("prodi", e.target.value)} disabled={!form.fakultas}>
                      <option value="" style={{ background: "#0C1525" }}>Pilih prodi</option>
                      {(majors[form.fakultas] ?? []).map((p) => <option key={p} value={p} style={{ background: "#0C1525" }}>{p}</option>)}
                    </select>
                    {errors.prodi && <p style={{ marginTop: 4, fontSize: 10, color: "rgba(248,113,113,0.8)" }}>{errors.prodi}</p>}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, paddingTop: 4 }}>
                  <button type="button" onClick={onClose} style={{
                    borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)",
                    padding: "8px 14px", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", cursor: "pointer",
                  }}>
                    Batal
                  </button>
                  <button type="submit" disabled={loading} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    borderRadius: 8, border: "none", background: "rgba(37,99,235,0.9)",
                    padding: "8px 16px", fontSize: 11, fontWeight: 600, color: "white",
                    cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1,
                    boxShadow: "0 1px 3px rgba(37,99,235,0.3)",
                  }}>
                    {loading && <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />}
                    Buat Akun
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
