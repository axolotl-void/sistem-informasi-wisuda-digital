"use client";

import { useState, useEffect } from "react";
import { Bell, User, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;
  return <span className="font-mono text-[13px] tabular-nums text-slate-400 dark:text-white/40">{time}</span>;
}

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="size-9" />;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      className="flex size-9 items-center justify-center rounded-xl text-slate-400 dark:text-white/30 transition-all hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-700 dark:hover:text-white/60 cursor-pointer"
    >
      {isDark ? (
        <Sun className="size-[17px]" />
      ) : (
        <Moon className="size-[17px]" />
      )}
    </button>
  );
}

export function AdminHeader() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AD";

  return (
    <header
      className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/60 bg-white/70 px-6 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#07111F]/95"
    >
      {/* Left — Event + Live indicator */}
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[0.78rem] font-medium text-emerald-600 dark:text-emerald-400/80">Live</span>
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-semibold tracking-tight text-slate-700 dark:text-white/70">Wisuda Periode 2024/2025</p>
          <p className="text-xs font-medium text-slate-400 dark:text-white/25">Auditorium Utama · Sesi Pagi</p>
        </div>
      </div>

      {/* Right — Clock, Notifications, Profile */}
      <div className="flex items-center gap-3">
        <LiveClock />

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification */}
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-xl text-slate-400 dark:text-white/30 transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:text-slate-600 dark:hover:text-white/60 cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="size-[17px]" />
          <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-[#07111F]" />
        </button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/15 text-xs font-semibold text-blue-600 dark:text-blue-400">
                {initials}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-[13px] font-semibold text-slate-700 dark:text-white/70 leading-tight">
                  {user?.name ?? "Admin"}
                </p>
                <p className="text-[11px] font-medium text-slate-400 dark:text-white/25">{user?.role ?? "SUPER_ADMIN"}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F172A] text-slate-800 dark:text-white shadow-lg"
          >
            <DropdownMenuLabel className="text-slate-500 dark:text-white/50">Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/[0.06]" />
            <DropdownMenuItem className="text-slate-600 dark:text-white/70 focus:bg-slate-50 dark:focus:bg-white/[0.06] focus:text-slate-900 dark:focus:text-white cursor-pointer">
              <User className="mr-2 size-4" /> Profil
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/[0.06]" />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-500 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400 cursor-pointer"
            >
              <LogOut className="mr-2 size-4" /> Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
