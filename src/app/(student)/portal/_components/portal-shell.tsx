"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Users, Ticket, GraduationCap, LogOut, Bell, ChevronRight } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/portal", label: "Profil", icon: User, exact: true },
  { href: "/portal/tamu", label: "Tamu", icon: Users, exact: false },
  { href: "/portal/tiket", label: "E-Ticket", icon: Ticket, exact: false },
];

// ─── Sidebar (desktop) ───────────────────────────────────────────────────────

function Sidebar({ pathname, user, onLogout }: { pathname: string; user: PortalUser; onLogout: () => void }) {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 min-h-screen border-r border-white/[0.06] bg-[#080f1e]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
        <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/20">
          <GraduationCap className="size-5 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-white/90 leading-tight">Portal Wisuda</p>
          <p className="text-[0.65rem] text-white/30">Wisudawan 2025</p>
        </div>
      </div>

      {/* User card */}
      <div className="mx-4 mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-blue-500/20 overflow-hidden">
            {user.foto ? (
              <img src={user.foto} alt={user.nama} className="size-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-blue-300">{user.avatar}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[0.82rem] font-semibold text-white/80 truncate">{user.nama}</p>
            <p className="text-[0.65rem] text-white/35 truncate">{user.nim}</p>
          </div>
        </div>
        {user.sesiWisuda && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-blue-500/10 border border-blue-500/15 px-2.5 py-1.5">
            <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[0.65rem] font-semibold text-blue-400">{user.sesiWisuda}</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname.startsWith(href) && href !== "/portal";
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-blue-500/15 border border-blue-500/20 text-blue-400"
                  : "text-white/40 hover:bg-white/[0.04] hover:text-white/70 border border-transparent"
              }`}
            >
              <Icon className={`size-4 shrink-0 ${isActive ? "text-blue-400" : "text-white/30 group-hover:text-white/60"}`} />
              {label}
              {isActive && <ChevronRight className="ml-auto size-3.5 text-blue-400/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/15"
        >
          <LogOut className="size-4 shrink-0" />
          Keluar
        </button>
      </div>
    </aside>
  );
}

// ─── Bottom Nav (mobile) ──────────────────────────────────────────────────────

function BottomNav({ pathname }: { pathname: string }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/[0.07] bg-[#080f1e]/95 backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname.startsWith(href) && href !== "/portal";
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all"
            >
              <div className={`flex size-9 items-center justify-center rounded-xl transition-all ${
                active ? "bg-blue-500/20 border border-blue-500/25" : ""
              }`}>
                <Icon className={`size-5 transition-colors ${active ? "text-blue-400" : "text-white/30"}`} />
              </div>
              <span className={`text-[0.6rem] font-semibold transition-colors ${active ? "text-blue-400" : "text-white/25"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Mobile Header ────────────────────────────────────────────────────────────

function MobileHeader({ user }: { user: PortalUser }) {
  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#080f1e]/95 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/15 border border-blue-500/20">
          <GraduationCap className="size-4 text-blue-400" />
        </div>
        <span className="text-sm font-bold text-white/80">Portal Wisuda</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-xl text-white/30 hover:bg-white/[0.06] hover:text-white/60 transition-colors"
        >
          <Bell className="size-4" />
        </button>
        <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-blue-500/20 overflow-hidden">
          {user.foto ? (
            <img src={user.foto} alt={user.nama} className="size-full object-cover" />
          ) : (
            <span className="text-[0.65rem] font-bold text-blue-300">{user.avatar}</span>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

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
    <div className="min-h-screen bg-[#060d1a] text-white">
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(59,130,246,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(99,102,241,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar pathname={pathname} user={user} onLogout={handleLogout} />

        <div className="flex-1 flex flex-col min-w-0">
          <MobileHeader user={user} />

          <main className="flex-1 px-4 py-5 pb-24 lg:pb-8 lg:px-8 lg:py-8 max-w-2xl lg:max-w-3xl mx-auto w-full">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>

      <BottomNav pathname={pathname} />
    </div>
  );
}
