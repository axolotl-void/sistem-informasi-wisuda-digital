"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useWisudawan } from "@/hooks/use-wisudawan";
import type { WisudawanRow } from "@/services/wisudawan.service";

interface Props {
  open: boolean;
  target: WisudawanRow | null;
  onClose: () => void;
}

export function ResetPasswordModal({ open, target, onClose }: Props) {
  const { resetPassword } = useWisudawan();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [customPw, setCustomPw] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"confirm" | "result">("confirm");

  const handleClose = useCallback(() => {
    setStep("confirm");
    setNewPassword("");
    setCustomPw("");
    setUseCustom(false);
    setCopied(false);
    onClose();
  }, [onClose]);

  async function handleReset() {
    if (!target) return;
    setLoading(true);
    try {
      const res = await resetPassword(target.id, !useCustom);
      setNewPassword(res.newPassword);
      setStep("result");
    } catch {
      toast.error("Gagal mereset password");
    } finally {
      setLoading(false);
    }
  }

  async function copyPw() {
    await navigator.clipboard.writeText(newPassword);
    setCopied(true);
    toast.success("Password disalin");
    setTimeout(() => setCopied(false), 2000);
  }

  const inputStyle: React.CSSProperties = {
    height: 36, width: "100%", borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.03)",
    padding: "0 12px", fontSize: 13, fontWeight: 500,
    color: "white", outline: "none",
  };

  return (
    <AnimatePresence>
      {open && target && (
        <motion.div
          key="reset-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleClose}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16, background: "rgba(0,0,0,0.5)",
          }}
        >
          <motion.div
            key="reset-modal"
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
            }}
          >
            <div style={{
              margin: "0 auto 12px", width: 40, height: 40, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.1)",
            }}>
              <KeyRound style={{ width: 18, height: 18, color: "rgba(96,165,250,0.8)" }} />
            </div>

            {step === "confirm" ? (
              <>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "white", margin: 0, textAlign: "center" }}>Reset Password</h3>
                <p style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
                  Reset password untuk <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>{target.nama}</span>
                </p>

                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={useCustom} onChange={(e) => setUseCustom(e.target.checked)}
                      style={{ width: 14, height: 14, accentColor: "rgb(59,130,246)" }} />
                    <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>Password custom</span>
                  </label>
                  {useCustom && (
                    <input type="text" value={customPw} onChange={(e) => setCustomPw(e.target.value)}
                      placeholder="Min. 8 karakter" style={inputStyle} />
                  )}
                </div>

                <div style={{ marginTop: 20, display: "flex", gap: 6 }}>
                  <button type="button" onClick={handleClose} style={{
                    flex: 1, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.03)", padding: "8px 0",
                    fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", cursor: "pointer",
                  }}>
                    Batal
                  </button>
                  <button type="button" onClick={handleReset} disabled={loading || (useCustom && customPw.length < 8)} style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    borderRadius: 8, border: "none", background: "rgba(37,99,235,0.9)",
                    padding: "8px 0", fontSize: 11, fontWeight: 600, color: "white",
                    cursor: "pointer", opacity: (loading || (useCustom && customPw.length < 8)) ? 0.5 : 1,
                    boxShadow: "0 1px 3px rgba(37,99,235,0.3)",
                  }}>
                    {loading && <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />}
                    Reset
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "white", margin: 0, textAlign: "center" }}>Password Direset</h3>
                <p style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>Simpan password ini</p>

                <div style={{
                  marginTop: 16, display: "flex", alignItems: "center", gap: 8,
                  borderRadius: 8, border: "1px solid rgba(16,185,129,0.1)",
                  background: "rgba(16,185,129,0.05)", padding: 10,
                }}>
                  <code style={{ flex: 1, fontSize: 13, fontFamily: "monospace", fontWeight: 600, color: "rgb(52,211,153)", userSelect: "all" }}>
                    {newPassword}
                  </code>
                  <button type="button" onClick={copyPw} style={{
                    display: "flex", width: 28, height: 28, alignItems: "center", justifyContent: "center",
                    borderRadius: 6, background: "rgba(255,255,255,0.06)", border: "none",
                    color: "rgba(255,255,255,0.4)", cursor: "pointer",
                  }}>
                    {copied ? <Check style={{ width: 12, height: 12, color: "rgb(52,211,153)" }} /> : <Copy style={{ width: 12, height: 12 }} />}
                  </button>
                </div>

                <button type="button" onClick={handleClose} style={{
                  marginTop: 16, width: "100%", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)",
                  padding: "8px 0", fontSize: 11, fontWeight: 600,
                  color: "rgba(255,255,255,0.4)", cursor: "pointer",
                }}>
                  Selesai
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
