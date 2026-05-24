"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/** Ambient mesh orbs — letakkan di dalam wrapper `relative` */
export function LiquidGlassAmbient({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/* Light: orbs lebih kuat agar kaca terlihat transparan */}
      <div className="absolute -left-20 -top-28 size-[480px] rounded-full bg-blue-400/45 blur-[90px] dark:hidden" />
      <div className="absolute right-[-5%] top-[8%] size-[400px] rounded-full bg-violet-400/35 blur-[85px] dark:hidden" />
      <div className="absolute bottom-[-10%] left-[25%] size-[440px] rounded-full bg-emerald-400/30 blur-[95px] dark:hidden" />
      <div className="absolute -right-12 bottom-[20%] size-[300px] rounded-full bg-sky-400/28 blur-[70px] dark:hidden" />
      <div className="absolute left-[40%] top-[35%] size-[200px] rounded-full bg-rose-300/20 blur-[60px] dark:hidden" />

      {/* Dark */}
      <div className="absolute -left-24 -top-32 hidden size-[420px] rounded-full bg-blue-500/15 blur-[100px] dark:block" />
      <div className="absolute right-0 top-1/4 hidden size-[360px] rounded-full bg-violet-500/12 blur-[90px] dark:block" />
      <div className="absolute bottom-0 left-1/3 hidden size-[400px] rounded-full bg-emerald-500/10 blur-[100px] dark:block" />
      <div className="absolute -right-16 bottom-1/4 hidden size-[280px] rounded-full bg-cyan-500/8 blur-[80px] dark:block" />
    </div>
  );
}

const glassBase =
  "relative overflow-hidden rounded-3xl border backdrop-blur-3xl backdrop-saturate-150 transition-all duration-500 " +
  /* Light: semi-transparan + rim halus ala iOS */
  "border-white/90 bg-gradient-to-br from-white/75 via-white/45 to-white/20 " +
  "shadow-[0_1px_1px_rgba(255,255,255,0.9)_inset,0_8px_32px_rgba(59,130,246,0.1),0_2px_8px_rgba(15,23,42,0.06)] " +
  "ring-1 ring-slate-900/[0.04] " +
  /* Dark */
  "dark:border-white/[0.12] dark:from-white/[0.09] dark:via-white/[0.05] dark:to-white/[0.02] " +
  "dark:shadow-[0_8px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] dark:ring-0";

interface LiquidGlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  shine?: boolean;
}

export function LiquidGlassCard({
  children,
  className,
  hover = true,
  shine = true,
  ...motionProps
}: LiquidGlassCardProps) {
  return (
    <motion.div
      className={cn(
        glassBase,
        hover &&
          "hover:-translate-y-0.5 hover:border-white hover:shadow-[0_1px_1px_rgba(255,255,255,1)_inset,0_20px_50px_rgba(59,130,246,0.16),0_4px_12px_rgba(15,23,42,0.08)] dark:hover:border-white/20 dark:hover:from-white/[0.11]",
        className,
      )}
      {...motionProps}
    >
      {shine && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/90 via-white/30 to-transparent opacity-90 dark:from-white/[0.08] dark:via-transparent dark:opacity-100"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-blue-200/40 blur-2xl dark:hidden"
          />
        </>
      )}
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  );
}

/** Inner nested glass chip (stat boxes, pills) */
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
        "rounded-2xl border px-4 py-3 backdrop-blur-xl backdrop-saturate-150",
        "border-white/80 bg-gradient-to-b from-white/70 to-white/35",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_8px_rgba(59,130,246,0.06)]",
        "ring-1 ring-slate-900/[0.03]",
        "dark:border-white/[0.08] dark:from-transparent dark:to-transparent dark:bg-white/[0.04] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:ring-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
