"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Users, Ticket, LogOut } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { motion } from "framer-motion";


interface PortalUser {
  id: string;
  nama: string;
  nim: string;
  fakultas: string;
  prodi: string;
  sesiWisuda: string | null;
  foto: string | null;
  avatar: string;
}

const NAV_ITEMS = [
  { href: "/portal", label: "Profil", icon: User, exact: true },
  { href: "/portal/tamu", label: "Tamu", icon: Users, exact: false },
  { href: "/portal/tiket", label: "E-Ticket", icon: Ticket, exact: false },
];

function Sidebar({
  pathname,
  user,
  onLogout,
}: {
  pathname: string;
  user: PortalUser;
  onLogout: () => void;
}) {
  return (
    <aside className="hidden lg:flex min-h-screen w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#080f1e]">
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-6 py-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/15 p-1.5">
          <img src="/img/logo-wusuda-2.png" alt="Logo Wisuda" className="size-full object-contain" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-white/90">Portal Wisuda</p>
          <p className="text-[0.65rem] text-white/30">Wisudawan 2025</p>
        </div>
      </div>

      <div className="mx-4 mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/30 to-indigo-500/30">
            {user.foto ? (
              <img src={user.foto} alt={user.nama} className="size-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-blue-300">{user.avatar}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.82rem] font-semibold text-white/80">{user.nama}</p>
            <p className="truncate text-[0.65rem] text-white/35">{user.nim}</p>
          </div>
        </div>
        {user.sesiWisuda && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-blue-500/15 bg-blue-500/10 px-2.5 py-1.5">
            <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[0.65rem] font-semibold text-blue-400">{user.sesiWisuda}</span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname.startsWith(href) && href !== "/portal";
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-500/12 text-blue-400"
                  : "text-white/40 hover:bg-white/[0.06] hover:text-white/70",
              )}
            >
              <Icon className="size-[17px] shrink-0" />
              <span className="flex-1">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white/35 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="size-4 shrink-0" />
          Keluar
        </button>
      </div>
    </aside>
  );
}

function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav
      className="portal-bottom-nav lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-white/[0.08] dark:bg-[#080f1e]/98"
      aria-label="Navigasi utama"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname.startsWith(href) && href !== "/portal";
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-[52px] min-w-[72px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 transition-colors touch-manipulation",
                active
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-500 active:bg-slate-100 dark:text-white/35 dark:active:bg-white/[0.06]",
              )}
            >
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-2xl transition-colors",
                  active &&
                    "bg-blue-500/10 border border-blue-500/20 dark:bg-blue-500/20 dark:border-blue-500/25",
                )}
              >
                <Icon className="size-5" />
              </div>
              <span className="text-[0.62rem] font-semibold leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function MobileHeader({ user }: { user: PortalUser }) {
  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 24,
        mass: 0.8
      }}
      className="portal-mobile-header lg:hidden sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg px-5 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-4 dark:border-white/[0.08] dark:bg-[#080f1e]/80"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/15 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/15 p-1.5">
          <img src="/img/logo-wusuda-2.png" alt="Logo Wisuda" className="size-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-white/95">
            Portal Wisuda
          </p>
          <p className="truncate text-[0.68rem] font-medium text-slate-500 dark:text-slate-400/80">{user.nim}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <AnimatedThemeToggler
          variant="circle"
          duration={360}
          className={cn(
            "flex size-10 items-center justify-center rounded-xl transition-colors touch-manipulation",
            "text-slate-600 active:bg-slate-100/80",
            "dark:text-white/40 dark:active:bg-white/[0.08]",
          )}
          aria-label="Ganti tema"
        />
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/15 to-indigo-500/10 dark:from-blue-500/30 dark:to-indigo-500/30 transition-all duration-300 hover:scale-105 active:scale-95">
          {user.foto ? (
            <img src={user.foto} alt={user.nama} className="size-full object-cover" />
          ) : (
            <span className="text-[0.65rem] font-bold text-blue-700 dark:text-blue-300">
              {user.avatar}
            </span>
          )}
        </div>
      </div>
    </motion.header>
  );
}

export function PortalShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: PortalUser;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuthStore();

  async function handleLogout() {
    try {
      await axios.post("/api/auth/logout");
    } catch {
      // ignore
    } finally {
      clearAuth();
      router.push("/login");
    }
  }

  return (
    <div className="portal-root min-h-[100dvh] bg-slate-50 text-slate-900 dark:bg-[#060d1a] dark:text-white">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(59,130,246,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(99,102,241,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 flex min-h-[100dvh]">
        <Sidebar pathname={pathname} user={user} onLogout={handleLogout} />

        <div className="flex min-w-0 flex-1 flex-col">
          <MobileHeader user={user} />

          <main className="portal-main flex-1 w-full max-w-lg mx-auto lg:max-w-3xl">
            {children}
          </main>
        </div>
      </div>

      <BottomNav pathname={pathname} />
    </div>
  );
}
