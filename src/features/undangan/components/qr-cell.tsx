"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QrCellProps {
  token: string;
  size?: number;
}

export function QrCell({ token, size = 36 }: QrCellProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(token, {
      width: size * 2,
      margin: 1,
      color: { dark: "#ffffff", light: "#00000000" },
    }).then(setDataUrl).catch(() => {});
  }, [token, size]);

  if (!dataUrl) {
    return (
      <div
        className="rounded-md bg-white/[0.04] animate-pulse"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="group relative rounded-md overflow-hidden transition-transform duration-200 hover:scale-110 cursor-pointer"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-md bg-white/[0.06] group-hover:bg-white/[0.1] transition-colors" />
      <img
        src={dataUrl}
        alt="QR"
        width={size}
        height={size}
        className="relative z-10 p-0.5"
      />
    </div>
  );
}

// Large QR for modal/drawer
export function QrLarge({ token, size = 200 }: QrCellProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(token, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#1e293b", light: "#ffffff" },
    }).then(setDataUrl).catch(() => {});
  }, [token, size]);

  if (!dataUrl) {
    return (
      <div
        className="rounded-2xl bg-white/[0.04] animate-pulse"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl" />
      <div className="relative rounded-2xl bg-white p-4 shadow-2xl">
        <img src={dataUrl} alt="QR Code" width={size} height={size} />
      </div>
    </div>
  );
}
