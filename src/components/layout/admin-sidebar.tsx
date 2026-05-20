"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  LayoutDashboard, Users, Mail, Armchair, ScanLine,
  ClipboardList, BarChart3, Settings, GraduationCap, ChevronRight,
  Loader2,
} from "lucide-react";
import { ROUTES } from "@/utils/constants";

const navItems = [
  { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
  { label: "Akun Wisudawan", href: ROUTES.ADMIN.MAHASISWA, icon: Users },
  { label: "Undangan Digital", href: ROUTES.ADMIN.UNDANGAN, icon: Mail },
  { label: "Seat Monitoring", href: ROUTES.ADMIN.SEAT_MONITORING, icon: Armchair },
  { label: "Scanner Gate", href: "#scanner", icon: ScanLine },
  { label: "Kehadiran", href: ROUTES.ADMIN.KEHADIRAN, icon: ClipboardList },
  { label: "Laporan", href: ROUTES.ADMIN.LAPORAN, icon: BarChart3 },
  { label: "Pengaturan", href: "#settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleNav(href: string) {
    if (href.startsWith("#")) {
      const targetId = href.replace("#", "");
      if (pathname === ROUTES.ADMIN.DASHBOARD) {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        router.push(`${ROUTES.ADMIN.DASHBOARD}${href}`);
      }
      return;
    }

    if (href === pathname) return;
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <aside
      className="hidden lg:flex flex-col"
      style={{
        width: 260,
        flexShrink: 0,
        margin: 12,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, rgb(59,130,246), rgb(37,99,235))",
          boxShadow: "0 4px 12px rgba(59,130,246,0.2)",
        }}>
          <GraduationCap style={{ width: 20, height: 20, color: "white" }} />
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: "white", lineHeight: 1.2, margin: 0 }}>Wisuda</p>
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: 0 }}>Digital System</p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ margin: "0 20px", height: 1, background: "rgba(255,255,255,0.06)" }} />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }} aria-label="Admin navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const isHashLink = item.href.startsWith("#");
          const isNavigating = isPending && !isActive && !isHashLink;

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => handleNav(item.href)}
              disabled={isHashLink && false}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                borderRadius: 12, padding: "10px 12px",
                fontSize: 14, fontWeight: 500,
                background: isActive ? "rgba(59,130,246,0.12)" : "transparent",
                color: isActive ? "rgb(96,165,250)" : "rgba(255,255,255,0.4)",
                border: "none",
                cursor: "pointer",
                transition: "background 0.1s, color 0.1s",
                textAlign: "left",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                }
              }}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon style={{ width: 17, height: 17, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && <ChevronRight style={{ width: 12, height: 12, color: "rgba(96,165,250,0.6)" }} />}
            </button>
          );
        })}
      </nav>

      {/* Loading indicator */}
      {isPending && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "8px 0", margin: "0 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <Loader2 style={{ width: 12, height: 12, color: "rgba(96,165,250,0.6)", animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.25)" }}>Memuat...</span>
        </div>
      )}

      {/* Footer */}
      <div style={{ margin: "0 20px", height: 1, background: "rgba(255,255,255,0.06)" }} />
      <div style={{ padding: "16px 20px" }}>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", margin: 0 }}>Sistem Informasi Wisuda Digital</p>
        <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.1)", marginTop: 2 }}>v1.0.0</p>
      </div>
    </aside>
  );
}
