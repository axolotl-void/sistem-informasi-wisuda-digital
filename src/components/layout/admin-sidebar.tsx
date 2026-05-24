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
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
  { label: "Akun Wisudawan", href: ROUTES.ADMIN.MAHASISWA, icon: Users },
  { label: "Undangan Digital", href: ROUTES.ADMIN.UNDANGAN, icon: Mail },
  { label: "Seat Monitoring", href: ROUTES.ADMIN.SEAT_MONITORING, icon: Armchair },
  { label: "Scanner Gate", href: ROUTES.SCANNER.SCAN, icon: ScanLine },
  { label: "Kehadiran", href: ROUTES.ADMIN.KEHADIRAN, icon: ClipboardList },
  { label: "Laporan", href: ROUTES.ADMIN.LAPORAN, icon: BarChart3 },
  { label: "Pengaturan", href: ROUTES.ADMIN.PENGATURAN, icon: Settings },
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
      className="hidden lg:flex flex-col border border-white/90 bg-white/55 shadow-[0_8px_32px_rgba(59,130,246,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-3xl backdrop-saturate-150 dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none"
      style={{
        width: 260,
        flexShrink: 0,
        margin: 12,
        borderRadius: 16,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 20px" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, rgb(59,130,246), rgb(37,99,235))",
          boxShadow: "0 4px 12px rgba(59,130,246,0.25)",
        }}>
          <GraduationCap style={{ width: 20, height: 20, color: "white" }} />
        </div>
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-slate-800 dark:text-white leading-tight m-0">Wisuda</p>
          <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-slate-400 dark:text-white/30 m-0">Digital System</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-slate-200 dark:bg-white/[0.06]" />

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
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 w-full text-left border border-transparent",
                isActive
                  ? "bg-blue-50 dark:bg-blue-500/12 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-transparent shadow-sm dark:shadow-none"
                  : "text-slate-500 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-800 dark:hover:text-white/70"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="size-[17px] shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="size-3 opacity-50" />}
              {isNavigating && <Loader2 className="size-3 animate-spin opacity-40" />}
            </button>
          );
        })}
      </nav>

      {/* Loading indicator */}
      {isPending && (
        <div className="flex items-center justify-center gap-1.5 py-2 mx-5 border-t border-slate-200 dark:border-white/[0.06]">
          <Loader2 className="size-3 text-blue-400 animate-spin" />
          <span className="text-[10px] font-medium text-slate-400 dark:text-white/25">Memuat...</span>
        </div>
      )}

      {/* Footer */}
      <div className="mx-5 h-px bg-slate-200 dark:bg-white/[0.06]" />
      <div className="px-5 py-4">
        <p className="text-[10px] text-slate-300 dark:text-white/15 m-0">Sistem Informasi Wisuda Digital</p>
        <p className="text-[9.5px] text-slate-300 dark:text-white/10 mt-0.5">v1.0.0</p>
      </div>
    </aside>
  );
}
