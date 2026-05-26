import { cn } from "@/lib/utils";

export const pengaturanPanel = cn(
  "rounded-2xl border backdrop-blur-xl",
  "border-slate-200/90 bg-white/95 shadow-[0_4px_20px_rgba(59,130,246,0.06)]",
  "dark:border-white/[0.06] dark:bg-white/[0.01] dark:shadow-none",
);

export const pengaturanInput = cn(
  "h-10 w-full rounded-xl border px-3.5 text-xs font-medium outline-none transition-all duration-200",
  "border-slate-200/90 bg-white text-slate-800 placeholder:text-slate-400",
  "hover:border-slate-300 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10",
  "dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/80 dark:placeholder-white/15",
  "dark:hover:border-white/[0.15] dark:focus:border-blue-500/50 dark:focus:bg-white/[0.06] dark:focus:ring-blue-500/5",
);

export const pengaturanInputError = "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15 dark:border-rose-500/50 dark:focus:ring-rose-500/5";

export const pengaturanHeading =
  "text-lg font-bold text-slate-900 flex items-center gap-2 dark:text-white/90";

export const pengaturanSubheading = "text-xs text-slate-600 mt-0.5 dark:text-white/30";

export const pengaturanLabel =
  "text-[11px] font-bold uppercase tracking-wider text-slate-500 block dark:text-white/40";

export const pengaturanBtnPrimary = cn(
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-5 text-xs font-bold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 cursor-pointer",
  "border-blue-300/80 bg-blue-50 text-blue-700 hover:border-blue-400 hover:bg-blue-100",
  "dark:border-blue-500/25 dark:bg-blue-500/[0.08] dark:text-blue-400 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/[0.15] dark:hover:text-blue-300 dark:shadow-[0_0_12px_rgba(59,130,246,0.15)]",
);

export const pengaturanBtnEmerald = cn(
  "inline-flex h-10 items-center justify-center rounded-xl border transition-all active:scale-[0.96] disabled:opacity-50 cursor-pointer",
  "border-emerald-300/80 bg-emerald-50 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-100",
  "dark:border-emerald-500/25 dark:bg-emerald-500/[0.08] dark:text-emerald-400 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/[0.15]",
);

export const pengaturanListItem =
  "text-xs font-semibold text-slate-700 dark:text-white/70";

export const pengaturanEmptyList =
  "text-[11px] text-slate-400 py-6 text-center dark:text-white/20";
