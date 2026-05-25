"use client";

import { memo, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface QrCellProps {
  token: string;
  size?: number;
}

const qrCache = new Map<string, string>();

function cacheKey(token: string, size: number) {
  return `${token}:${size}`;
}

export const QrCell = memo(function QrCell({ token, size = 36 }: QrCellProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [dataUrl, setDataUrl] = useState(() => qrCache.get(cacheKey(token, size)) ?? "");
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const cached = qrCache.get(cacheKey(token, size));
    if (cached) {
      setDataUrl(cached);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "80px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [token, size]);

  useEffect(() => {
    if (!shouldLoad || !token) return;
    const key = cacheKey(token, size);
    if (qrCache.has(key)) {
      setDataUrl(qrCache.get(key)!);
      return;
    }

    let cancelled = false;
    QRCode.toDataURL(token, {
      width: size * 2,
      margin: 1,
      color: { dark: "#ffffff", light: "#00000000" },
    })
      .then((url) => {
        if (cancelled) return;
        qrCache.set(key, url);
        setDataUrl(url);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [shouldLoad, token, size]);

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden rounded-md"
      style={{ width: size, height: size }}
    >
      {!dataUrl ? (
        <div
          className="size-full rounded-md bg-white/40 dark:bg-white/[0.06]"
          aria-hidden
        />
      ) : (
        <img
          src={dataUrl}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="size-full p-0.5"
        />
      )}
    </div>
  );
});

export function QrLarge({ token, size = 200 }: QrCellProps) {
  const [dataUrl, setDataUrl] = useState(() => qrCache.get(cacheKey(token, size)) ?? "");

  useEffect(() => {
    const key = cacheKey(token, size);
    if (qrCache.has(key)) {
      setDataUrl(qrCache.get(key)!);
      return;
    }
    QRCode.toDataURL(token, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#1e293b", light: "#ffffff" },
    })
      .then((url) => {
        qrCache.set(key, url);
        setDataUrl(url);
      })
      .catch(() => {});
  }, [token, size]);

  if (!dataUrl) {
    return (
      <div
        className="rounded-2xl bg-white/40 dark:bg-white/[0.06]"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-xl dark:shadow-black/40">
      <img
        src={dataUrl}
        alt="QR Code"
        width={size}
        height={size}
        decoding="async"
      />
    </div>
  );
}
