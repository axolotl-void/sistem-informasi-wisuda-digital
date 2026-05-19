"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWisudawan } from "@/hooks/use-wisudawan";
import type { WisudawanRow } from "@/services/wisudawan.service";

interface Props {
  open: boolean;
  target: WisudawanRow | null;
  onClose: () => void;
}

export function DeleteConfirmModal({ open, target, onClose }: Props) {
  const { remove } = useWisudawan();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!target) return;
    setLoading(true);
    try {
      await remove(target.id);
      onClose();
    } catch {
      toast.error("Gagal menghapus akun");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && target && (
        <motion.div
          key="delete-backdrop"
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
            key="delete-modal"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative", width: "100%", maxWidth: 320,
              borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)",
              background: "#0C1525", padding: 20,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
              textAlign: "center",
            }}
          >
            <div style={{
              margin: "0 auto 12px", width: 40, height: 40, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.1)",
            }}>
              <AlertTriangle style={{ width: 18, height: 18, color: "rgba(248,113,113,0.8)" }} />
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 600, color: "white", margin: 0 }}>Hapus Akun</h3>
            <p style={{ marginTop: 6, fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.35)" }}>
              Yakin ingin menghapus akun{" "}
              <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>{target.nama}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div style={{ marginTop: 20, display: "flex", gap: 6 }}>
              <button type="button" onClick={onClose} style={{
                flex: 1, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.03)", padding: "8px 0",
                fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", cursor: "pointer",
              }}>
                Batal
              </button>
              <button type="button" onClick={handleDelete} disabled={loading} style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                borderRadius: 8, border: "none", background: "rgba(220,38,38,0.8)",
                padding: "8px 0", fontSize: 11, fontWeight: 600, color: "white",
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1,
              }}>
                {loading && <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />}
                Hapus
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
