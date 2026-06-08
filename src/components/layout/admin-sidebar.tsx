"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  LayoutDashboard, Users, Mail, Armchair, ScanLine,
  ClipboardList, BarChart3, Settings, ChevronRight,
  Loader2, ShieldCheck, MailCheck,
} from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";
import { ROUTES } from "@/utils/constants";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const role = useAuthStore((s) => s.user?.role);

  const navItems = [
    { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
    { label: "Akun Wisudawan", href: ROUTES.ADMIN.MAHASISWA, icon: Users },
    { label: "Undangan Digital", href: ROUTES.ADMIN.UNDANGAN, icon: Mail },
    { label: "Undangan Dosen", href: ROUTES.ADMIN.UNDANGAN_DOSEN, icon: MailCheck },
    { label: "Seat Monitoring", href: ROUTES.ADMIN.SEAT_MONITORING, icon: Armchair },
    { label: "Scanner Gate", href: ROUTES.SCANNER.SCAN, icon: ScanLine },
    { label: "Kehadiran", href: ROUTES.ADMIN.KEHADIRAN, icon: ClipboardList },
    { label: "Laporan", href: ROUTES.ADMIN.LAPORAN, icon: BarChart3 },
    { label: "Pengaturan", href: ROUTES.ADMIN.PENGATURAN, icon: Settings },
    ...(role === "SUPER_ADMIN"
      ? [{ label: "Akun Admin/Pengawas", href: ROUTES.ADMIN.AKUN, icon: ShieldCheck }]
      : []),
  ];

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
      className="hidden lg:flex flex-col border border-white/90 bg-white/60 shadow-[0_8px_32px_rgba(59,130,246,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.05] dark:shadow-none"
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
          width: 48, height: 48, borderRadius: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(59, 130, 246, 0.08)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 16px rgba(59, 130, 246, 0.06)",
          overflow: "hidden",
          flexShrink: 0
        }}>
          <img src="/img/logo-wusuda-2.png" alt="Logo Wisuda" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-slate-800 dark:text-white leading-tight m-0">Wisuda</p>
          <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-slate-400 dark:text-white/30 m-0">Digital System</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-slate-200 dark:bg-white/[0.06]" />

      {/* Navigation with LayoutGroup for shared layout animations */}
      <LayoutGroup>
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
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium w-full text-left border border-transparent cursor-pointer",
                  "transition-colors duration-150",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-800 dark:hover:text-white/70"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Sliding active indicator — seperti Pengaturan */}
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveIndicator"
                    className="absolute inset-0 rounded-xl bg-blue-50 border border-blue-100 shadow-sm dark:bg-blue-500/[0.08] dark:border-blue-500/20 dark:shadow-[0_0_12px_rgba(59,130,246,0.06)]"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                    }}
                    style={{ willChange: "transform" }}
                  />
                )}

                <item.icon className="relative z-[1] size-[17px] shrink-0" />
                <span className="relative z-[1] flex-1">{item.label}</span>
                {isActive && <ChevronRight className="relative z-[1] size-3 opacity-50" />}
                {isNavigating && <Loader2 className="relative z-[1] size-3 animate-spin opacity-40" />}
              </button>
            );
          })}
        </nav>
      </LayoutGroup>

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
