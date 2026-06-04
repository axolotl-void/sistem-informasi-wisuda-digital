"use client";

import { useAuth } from "@/hooks/use-auth";
import { useScannerStore } from "@/store/scanner.store";
import { LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export function PetugasHeader() {
  const { user } = useAuth();
  const { isConnected } = useScannerStore();
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "P";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/70 dark:border-white/[0.07] dark:bg-[#0A0A0C]/50 backdrop-blur-2xl px-5 py-4 flex items-center justify-between shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)] pt-[calc(env(safe-area-inset-top,0px)+16px)] transition-colors duration-300">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-white/90 dark:bg-white/10 p-0 shadow-sm border border-slate-200/50 dark:border-white/[0.08] overflow-hidden">
          <img src="/img/logo-wusuda-2.png" alt="Logo Kampus" className="size-full object-contain scale-125" />
        </div>
        <div>
          <h1 className="text-sm font-black tracking-wider uppercase text-slate-800 dark:text-white/95 leading-none transition-colors">
            Gate Scanner
          </h1>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest transition-colors">
            Sistem Wisuda Digital
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time Connection Status - Hanya ditampilkan saat terhubung (Live) */}
        {isConnected && (
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] dark:bg-emerald-500/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 transition-colors">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
        )}

        <AnimatedThemeToggler
          variant="circle"
          duration={420}
          className={cn(
            "flex size-9 cursor-pointer items-center justify-center rounded-xl transition-colors",
            "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
            "dark:text-white/50 dark:hover:bg-white/[0.08] dark:hover:text-white/80",
          )}
        />

        {/* User Avatar Initials */}
        <div className="flex size-9 items-center justify-center overflow-hidden rounded-xl border border-blue-500/20 bg-blue-500/10 dark:bg-gradient-to-br dark:from-blue-500/15 dark:to-indigo-500/10 transition-colors">
          <span className="text-[10px] font-black text-blue-600 dark:text-blue-300 transition-colors">{initials}</span>
        </div>
      </div>
    </header>
  );
}
