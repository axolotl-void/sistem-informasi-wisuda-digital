"use client";

import { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

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
  return (
    <span className="font-mono text-[13px] tabular-nums text-slate-500 dark:text-white/50">
      {time}
    </span>
  );
}

export function AdminHeader() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-16 items-center justify-between border-b px-6",
        /* Light */
        "border-slate-200/90 bg-white/90 text-slate-900 backdrop-blur-xl",
        /* Dark — solid, bukan putih transparan */
        "dark:border-white/[0.08] dark:bg-[#0a1628] dark:text-white dark:backdrop-blur-md",
      )}
    >
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <div className="size-2 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" />
          <span className="text-[0.78rem] font-medium text-emerald-600 dark:text-emerald-400">
            Live
          </span>
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-semibold tracking-tight text-slate-800 dark:text-white/85">
            Wisuda Periode 2024/2025
          </p>
          <p className="text-xs font-medium text-slate-500 dark:text-white/40">
            Auditorium Utama · Sesi Pagi
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LiveClock />
        <AnimatedThemeToggler
          variant="circle"
          duration={420}
          className={cn(
            "flex size-9 cursor-pointer items-center justify-center rounded-xl transition-colors",
            "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
            "dark:text-white/50 dark:hover:bg-white/[0.08] dark:hover:text-white/80",
          )}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors",
                "hover:bg-slate-100 dark:hover:bg-white/[0.08]",
              )}
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                {initials}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-[13px] font-semibold leading-tight text-slate-800 dark:text-white/85">
                  {user?.name ?? "Admin"}
                </p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-white/40">
                  {user?.role ?? "SUPER_ADMIN"}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 border-slate-200 bg-white text-slate-800 shadow-lg dark:border-white/10 dark:bg-[#0f172a] dark:text-white"
          >
            <DropdownMenuLabel className="text-slate-500 dark:text-white/50">
              Akun Saya
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/[0.06]" />
            <DropdownMenuItem className="cursor-pointer text-slate-600 focus:bg-slate-50 focus:text-slate-900 dark:text-white/70 dark:focus:bg-white/[0.06] dark:focus:text-white">
              <User className="mr-2 size-4" /> Profil
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/[0.06]" />
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:focus:bg-red-500/10 dark:focus:text-red-300"
            >
              <LogOut className="mr-2 size-4" /> Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
