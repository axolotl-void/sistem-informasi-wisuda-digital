"use client";

import { useAuth } from "@/hooks/use-auth";
import { useScannerStore } from "@/store/scanner.store";
import { LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function PetugasHeader() {
  const { user } = useAuth();
  const { isConnected } = useScannerStore();
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "P";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-[#0A0A0C]/50 backdrop-blur-2xl px-5 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)] pt-[calc(env(safe-area-inset-top,0px)+16px)]">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
          <Sparkles className="size-4" />
        </div>
        <div>
          <h1 className="text-sm font-black tracking-wider uppercase text-white/95 leading-none">
            Gate Scanner
          </h1>
          <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
            Sistem Wisuda Digital
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time Connection Status */}
        <div className={cn(
          "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
          isConnected
            ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400"
            : "border-rose-500/20 bg-rose-500/[0.06] text-rose-400"
        )}>
          <span className={cn("size-1.5 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
          {isConnected ? "Live" : "Offline"}
        </div>

        {/* User Avatar Initials */}
        <div className="flex size-9 items-center justify-center overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/15 to-indigo-500/10">
          <span className="text-[10px] font-black text-blue-300">{initials}</span>
        </div>
      </div>
    </header>
  );
}
