"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/** Ambient mesh — ringan (2 orbs, blur lebih kecil) */
export function LiquidGlassAmbient({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="absolute -left-16 -top-24 size-[360px] rounded-full bg-blue-400/30 blur-3xl dark:bg-blue-500/12" />
      <div className="absolute -right-8 top-[10%] size-[320px] rounded-full bg-violet-400/22 blur-3xl dark:bg-violet-500/10" />
      <div className="absolute bottom-0 left-[30%] size-[340px] rounded-full bg-emerald-400/18 blur-3xl dark:bg-emerald-500/8" />
    </div>
  );
}

const glassBase =
  "relative overflow-hidden rounded-3xl border transition-[transform,box-shadow,border-color] duration-300 " +
  "border-white/90 bg-gradient-to-br from-white/80 via-white/50 to-white/30 " +
  "shadow-[0_4px_24px_rgba(59,130,246,0.08)] ring-1 ring-slate-900/[0.04] " +
  "backdrop-blur-xl " +
  "dark:border-white/[0.12] dark:from-white/[0.09] dark:via-white/[0.05] dark:to-white/[0.02] " +
  "dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] dark:ring-0 " +
  "motion-reduce:backdrop-blur-none motion-reduce:bg-white/95 dark:motion-reduce:bg-[#0f172a]/95";

interface LiquidGlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  shine?: boolean;
  /** Nonaktifkan animasi masuk (lebih ringan untuk list/table) */
  noEntrance?: boolean;
}

export function LiquidGlassCard({
  children,
  className,
  hover = true,
  shine = false,
  noEntrance = false,
  initial,
  animate,
  transition,
  ...motionProps
}: LiquidGlassCardProps) {
  const entrance = noEntrance
    ? {}
    : {
        initial: initial ?? { opacity: 0, y: 12 },
        animate: animate ?? { opacity: 1, y: 0 },
        transition: transition ?? { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <motion.div
      className={cn(
        glassBase,
        hover &&
          "hover:-translate-y-px hover:border-white hover:shadow-[0_12px_36px_rgba(59,130,246,0.12)] dark:hover:border-white/18",
        className,
      )}
      {...entrance}
      {...motionProps}
    >
      {shine && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-transparent opacity-80 dark:from-white/[0.06] dark:opacity-100"
        />
      )}
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  );
}

export const glassBtnGhost = cn(
  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition-colors active:scale-[0.97] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
  "border-white/80 bg-white/70 text-slate-700 hover:bg-white/90",
  "dark:border-white/10 dark:bg-white/[0.08] dark:text-white/55 dark:hover:bg-white/[0.12] dark:hover:text-white/85",
);

export const glassBtnPrimary = cn(
  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition-colors active:scale-[0.97] cursor-pointer shadow-[0_4px_16px_rgba(59,130,246,0.25)]",
  "border-blue-400/40 bg-gradient-to-b from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
  "dark:border-blue-500/30 dark:from-blue-500/90 dark:to-blue-600/80",
);

export const glassBtnDanger = cn(
  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition-colors active:scale-[0.97] cursor-pointer",
  "border-red-400/40 bg-red-500/15 text-red-800 hover:bg-red-500/25",
  "dark:border-red-500/30 dark:bg-red-500/12 dark:text-red-300 dark:hover:bg-red-500/20",
);

export const glassInput = cn(
  "rounded-xl border outline-none transition-[border-color,box-shadow]",
  "border-white/80 bg-white/70 text-slate-900 placeholder:text-slate-400",
  "focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/15",
  "dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/25 dark:focus:border-blue-500/40",
);

export function GlassChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3",
        "border-white/80 bg-white/55 ring-1 ring-slate-900/[0.03]",
        "dark:border-white/[0.08] dark:bg-white/[0.05] dark:ring-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
