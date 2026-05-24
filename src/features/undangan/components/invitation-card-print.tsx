"use client";

// Printable/exportable invitation card
// Layout: Info + QR Code (kiri) | Foto Profil (kanan)

import { forwardRef } from "react";
import type { Invitation } from "../types";

interface InvitationCardPrintProps {
  invitation: Invitation;
  qrDataUrl: string; // Base64 QR code image
}

export const InvitationCardPrint = forwardRef<HTMLDivElement, InvitationCardPrintProps>(
  ({ invitation, qrDataUrl }, ref) => {
    const initials = invitation.mahasiswaNama
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div
        ref={ref}
        style={{
          width: 794,
          minHeight: 500,
          background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 40%, #0f2347 100%)",
          borderRadius: 24,
          padding: "40px 48px",
          fontFamily: "'Geist', 'Inter', sans-serif",
          color: "white",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: 28,
          boxSizing: "border-box",
        }}
      >
        {/* -- Background decorations ----------------------------------- */}
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -60,
          width: 220, height: 220, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* -- Header -------------------------------------------------- */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 13,
              background: "linear-gradient(135deg, #2563eb, #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, flexShrink: 0,
            }}>
              🎓
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
                Universitas Nusantara
              </p>
              <p style={{ fontSize: 11, color: "rgba(147,197,253,0.65)", margin: "2px 0 0" }}>
                Sistem Informasi Wisuda Digital
              </p>
            </div>
          </div>
          <div style={{
            padding: "5px 13px", borderRadius: 999,
            border: "1px solid rgba(59,130,246,0.3)",
            background: "rgba(59,130,246,0.1)",
            fontSize: 10, fontWeight: 700, color: "rgba(147,197,253,0.9)",
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            Undangan Resmi
          </div>
        </div>

        {/* -- Divider ------------------------------------------------- */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.35), transparent)", margin: "-8px 0" }} />

        {/* -- Main content: KIRI (info + QR) | KANAN (foto) ----------- */}
        <div style={{ display: "flex", gap: 36, alignItems: "stretch" }}>

          {/* -- KIRI: Info akademik + QR Code ----------------------- */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Nama & NIM */}
            <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 6px" }}>
              Dengan hormat mengundang
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 3px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              {invitation.mahasiswaNama}
            </h1>
            <p style={{ fontSize: 12, color: "rgba(147,197,253,0.65)", margin: "0 0 20px", fontWeight: 500 }}>
              NIM: {invitation.nim}
            </p>

            {/* Info grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", flex: 1 }}>
              {[
                { label: "Fakultas", value: invitation.fakultas },
                { label: "Program Studi", value: invitation.prodi },
                { label: "Sesi", value: invitation.sesi },
                { label: "Gedung", value: invitation.gedung },
                { label: "Nomor Kursi", value: invitation.nomorKursi || "—" },
                { label: "Kuota Tamu", value: `${invitation.kuotaTamu} orang` },
                { label: "Tanggal", value: new Date(invitation.tanggalWisuda).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) },
                { label: "Waktu", value: `${invitation.waktuMulai} – ${invitation.waktuSelesai} WIB` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", margin: "0 0 2px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    {label}
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", margin: 0, fontWeight: 500, lineHeight: 1.3 }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* -- QR Code utama (validasi kehadiran) -- */}
            <div style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 14px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}>
              {/* QR image */}
              <div style={{
                padding: 8,
                borderRadius: 10,
                background: "white",
                boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
                flexShrink: 0,
              }}>
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code Kehadiran" width={72} height={72} style={{ display: "block" }} />
                ) : (
                  <div style={{ width: 72, height: 72, background: "#e2e8f0", borderRadius: 6 }} />
                )}
              </div>
              {/* Label */}
              <div>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", margin: "0 0 4px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Scan untuk validasi kehadiran
                </p>
                <p style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(147,197,253,0.75)", margin: "0 0 6px", fontWeight: 600, wordBreak: "break-all" }}>
                  {invitation.qrToken}
                </p>
                <div style={{
                  display: "inline-flex",
                  padding: "3px 8px",
                  borderRadius: 999,
                  background: "rgba(59,130,246,0.12)",
                  border: "1px solid rgba(59,130,246,0.22)",
                }}>
                  <p style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(147,197,253,0.85)", margin: 0, fontWeight: 700, letterSpacing: "0.05em" }}>
                    {invitation.kode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* -- KANAN: Foto Profil Mahasiswa ------------------------ */}
          <div style={{
            width: 180,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          }}>
            {/* Foto melingkar dengan neon ring */}
            <div style={{ position: "relative", width: 160, height: 160 }}>
              {/* Glow ring */}
              <div style={{
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(59,130,246,0.45), rgba(99,102,241,0.35), rgba(139,92,246,0.25))",
                filter: "blur(5px)",
              }} />
              {/* Foto container */}
              <div style={{
                position: "relative",
                width: 160,
                height: 160,
                borderRadius: "50%",
                overflow: "hidden",
                border: "2.5px solid rgba(255,255,255,0.14)",
                background: "linear-gradient(135deg, #1e3a5f, #1e2d5a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {invitation.foto ? (
                  <img
                    src={invitation.foto}
                    alt={invitation.mahasiswaNama}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  /* Inisial jika tidak ada foto */
                  <span style={{
                    fontSize: 52,
                    fontWeight: 900,
                    color: "rgba(147,197,253,0.85)",
                    lineHeight: 1,
                    userSelect: "none",
                  }}>
                    {initials}
                  </span>
                )}
              </div>
            </div>

            {/* Nama & NIM di bawah foto */}
            <div style={{ textAlign: "center" }}>
              <p style={{
                fontSize: 14,
                fontWeight: 800,
                color: "rgba(255,255,255,0.88)",
                margin: "0 0 3px",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}>
                {invitation.mahasiswaNama}
              </p>
              <p style={{
                fontSize: 11,
                fontFamily: "monospace",
                color: "rgba(147,197,253,0.65)",
                margin: 0,
                fontWeight: 600,
              }}>
                {invitation.nim}
              </p>
            </div>
          </div>

        </div>

        {/* -- Footer -------------------------------------------------- */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)", margin: "-4px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", margin: 0 }}>
            Undangan ini bersifat resmi dan tidak dapat dipindahtangankan
          </p>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", margin: 0, fontFamily: "monospace" }}>
            {invitation.qrToken}
          </p>
        </div>
      </div>
    );
  }
);

InvitationCardPrint.displayName = "InvitationCardPrint";
