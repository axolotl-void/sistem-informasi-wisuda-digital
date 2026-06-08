"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";

/**
 * Wrapper yang memberi animasi transisi halaman smooth (slide + fade)
 * mirip dengan tab content di halaman Pengaturan.
 *
 * Menggunakan `will-change` dan GPU-accelerated transforms
 * agar animasi 60fps bahkan di perangkat mid-range.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Urutan menu agar slide direction konsisten
  const routeOrder = [
    "/dashboard",
    "/mahasiswa",
    "/undangan",
    "/undangan-dosen",
    "/seat-monitoring",
    "/scan",
    "/kehadiran",
    "/laporan",
    "/pengaturan",
    "/akun",
  ];

  useEffect(() => {
    const prevIndex = routeOrder.findIndex((r) => prevPath.current.startsWith(r));
    const nextIndex = routeOrder.findIndex((r) => pathname.startsWith(r));
    setDirection(nextIndex >= prevIndex ? 1 : -1);
    prevPath.current = pathname;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: direction * 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: direction * -8 }}
        transition={{
          duration: 0.18,
          ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad — smooth 60fps feel
        }}
        style={{ willChange: "transform, opacity" }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
