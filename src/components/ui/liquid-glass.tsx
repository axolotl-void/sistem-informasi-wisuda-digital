"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Dekorasi ambient — gradient statis saja (tanpa filter blur = jauh lebih ringan GPU).
 * Background utama sudah dari `.dashboard-mesh`.
 */
export function LiquidGlassAmbient({ className }: { className?: string }) {
  return null;
}

/** Frosted glass tanpa backdrop-filter — tampilan mirip, repaint minimal */
const glassBase =
  "relative overflow-hidden rounded-3xl border " +
  "border-white/90 bg-gradient-to-br from-white/[0.97] via-white/[0.93] to-white/[0.88] " +
  "shadow-[0_4px_24px_rgba(59,130,246,0.08)] ring-1 ring-slate-900/[0.04] " +
  "dark:border-white/[0.12] dark:from-[#131d32]/96 dark:via-[#101a2c]/94 dark:to-[#0d1526]/92 " +
  "dark:shadow-[0_8px_32px_rgba(0,0,0,0.28)] dark:ring-0 " +
  "[contain:layout_style]";

interface LiquidGlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  shine?: boolean;
  noEntrance?: boolean;
}

export function LiquidGlassCard({
  children,
  className,
  hover = false,
  shine = false,
  noEntrance = true,
  initial,
  animate,
  transition,
  ...motionProps
}: LiquidGlassCardProps) {
  const classes = cn(
    glassBase,
    hover &&
      "transition-[border-color,box-shadow] duration-200 hover:border-white hover:shadow-[0_8px_28px_rgba(59,130,246,0.1)] dark:hover:border-white/16",
    className,
  );

  const inner = (
    <>
      {shine && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-white/[0.04]"
        />
      )}
      <div className="relative z-[1]">{children}</div>
    </>
  );

  if (noEntrance) {
    const { style, id, role, "aria-label": ariaLabel, ...rest } = motionProps;
    return (
      <div 
        className={classes} 
        style={style as React.CSSProperties} 
        id={id} 
        role={role} 
        aria-label={ariaLabel}
        {...(rest as React.HTMLAttributes<HTMLDivElement>)}
      >
        {inner}
      </div>
    );
  }

  return (
    <motion.div
      className={classes}
      initial={initial ?? { opacity: 0, y: 8 }}
      animate={animate ?? { opacity: 1, y: 0 }}
      transition={transition ?? { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
      {...motionProps}
    >
      {inner}
    </motion.div>
  );
}

export const glassBtnGhost = cn(
  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition-colors active:scale-[0.97] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
  "border-white/80 bg-white/85 text-slate-700 hover:bg-white/95",
  "dark:border-white/10 dark:bg-white/[0.08] dark:text-white/55 dark:hover:bg-white/[0.12] dark:hover:text-white/85",
);

export const glassBtnPrimary = cn(
  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition-colors active:scale-[0.97] cursor-pointer shadow-[0_4px_16px_rgba(59,130,246,0.22)]",
  "border-blue-400/40 bg-gradient-to-b from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700",
  "dark:border-blue-500/30 dark:from-blue-500/90 dark:to-blue-600/80",
);

export const glassInput = cn(
  "rounded-xl border outline-none transition-[border-color,box-shadow]",
  "border-white/80 bg-white/90 text-slate-900 placeholder:text-slate-400",
  "focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/15",
  "dark:border-white/[0.08] dark:bg-white/[0.07] dark:text-white dark:placeholder:text-white/25 dark:focus:border-blue-500/40",
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
        "border-white/80 bg-white/90 ring-1 ring-slate-900/[0.03]",
        "dark:border-white/[0.08] dark:bg-white/[0.06] dark:ring-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
