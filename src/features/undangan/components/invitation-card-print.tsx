"use client";

// This component renders the printable/exportable invitation card
// It uses plain HTML/CSS for reliable html2canvas capture

import { forwardRef } from "react";
import type { Invitation } from "../types";

interface InvitationCardPrintProps {
  invitation: Invitation;
  qrDataUrl: string;
}

export const InvitationCardPrint = forwardRef<HTMLDivElement, InvitationCardPrintProps>(
  ({ invitation, qrDataUrl }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: 794,
          minHeight: 520,
          background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 40%, #0f2347 100%)",
          borderRadius: 24,
          padding: 48,
          fontFamily: "'Geist', 'Inter', sans-serif",
          color: "white",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {/* Background decorations */}
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -60,
          width: 240, height: 240, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, #2563eb, #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24,
            }}>
              🎓
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
                Universitas Nusantara
              </p>
              <p style={{ fontSize: 12, color: "rgba(147,197,253,0.7)", margin: "2px 0 0" }}>
                Sistem Informasi Wisuda Digital
              </p>
            </div>
          </div>
          <div style={{
            padding: "6px 14px", borderRadius: 999,
            border: "1px solid rgba(59,130,246,0.3)",
            background: "rgba(59,130,246,0.1)",
            fontSize: 11, fontWeight: 600, color: "rgba(147,197,253,0.9)",
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            Undangan Resmi
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)" }} />

        {/* Main content */}
        <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
          {/* Left — Student info */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>
              Dengan hormat mengundang
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              {invitation.mahasiswaNama}
            </h1>
            <p style={{ fontSize: 13, color: "rgba(147,197,253,0.7)", margin: "0 0 24px", fontWeight: 500 }}>
              NIM: {invitation.nim}
            </p>

            {/* Info grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
              {[
                { label: "Fakultas", value: invitation.fakultas },
                { label: "Program Studi", value: invitation.prodi },
                { label: "Sesi", value: invitation.sesi },
                { label: "Gedung", value: invitation.gedung },
                { label: "Ruangan", value: invitation.ruangan },
                { label: "Nomor Kursi", value: invitation.nomorKursi },
                { label: "Tanggal", value: new Date(invitation.tanggalWisuda).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
                { label: "Waktu", value: `${invitation.waktuMulai} – ${invitation.waktuSelesai} WIB` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {label}
                  </p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", margin: 0, fontWeight: 500 }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Guest quota */}
            <div style={{
              marginTop: 20, padding: "10px 16px", borderRadius: 12,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>Kuota Tamu</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.8)", margin: 0 }}>
                {invitation.kuotaTamu} orang
              </p>
            </div>
          </div>

          {/* Right — QR Code */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{
              padding: 16, borderRadius: 20,
              background: "white",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" width={160} height={160} />
              ) : (
                <div style={{ width: 160, height: 160, background: "#f1f5f9", borderRadius: 8 }} />
              )}
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Kode Undangan
              </p>
              <p style={{ fontSize: 13, fontFamily: "monospace", color: "rgba(147,197,253,0.8)", margin: 0, fontWeight: 600 }}>
                {invitation.kode}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", margin: 0 }}>
            Undangan ini bersifat resmi dan tidak dapat dipindahtangankan
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", margin: 0, fontFamily: "monospace" }}>
            {invitation.qrToken}
          </p>
        </div>
      </div>
    );
  }
);

InvitationCardPrint.displayName = "InvitationCardPrint";
