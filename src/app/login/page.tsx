"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useTheme } from "next-themes";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const { theme, setTheme } = useTheme();
  const { login, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }
    try {
      await login({ email, password });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Email atau password salah",
      );
    }
  }

  return (
    <main className="relative flex w-screen min-h-screen items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/img/Tamnel-login-page.png')" }}
    >
      {/* ================================================================
          1. BACKGROUND OVERLAY — Light / Dark adaptive
      ================================================================ */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-white/10 backdrop-blur-sm dark:bg-black/50 dark:backdrop-blur-sm"
      />

      {/* Bottom aura glow — blue (light) / orange (dark) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 h-80 w-[60vw] max-w-3xl rounded-full bg-blue-500/30 blur-[100px] dark:bg-orange-500/25"
      />

      {/* ================================================================
          2. THEME TOGGLE — Top-right absolute
      ================================================================ */}
      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
        className="absolute top-5 right-5 z-30 flex size-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 dark:border-orange-500/30 dark:bg-zinc-900/80"
      >
        {mounted ? (
          theme === "dark" ? (
            <Sun className="size-[18px] text-orange-400" />
          ) : (
            <Moon className="size-[18px] text-blue-600" />
          )
        ) : (
          <span className="size-[18px]" />
        )}
      </button>

      {/* ================================================================
          3. CARD — Glassmorphism + Aura Glow + 3D Hover
      ================================================================ */}
      <div
        className={[
          "relative z-10 mx-4 w-full max-w-[26rem]",
          "rounded-3xl px-7 py-10 sm:px-9",
          "backdrop-blur-xl",
          // Light: white card + blue aura glow
          "bg-white/90 border border-blue-100",
          "shadow-[0_0_50px_rgba(37,99,235,0.25)]",
          // Dark: dark card + orange aura glow
          "dark:bg-zinc-950/90 dark:border-orange-500/20",
          "dark:shadow-[0_0_60px_rgba(249,115,22,0.35)]",
          // 3D hover lift
          "transition-all duration-500 ease-out",
          "hover:-translate-y-1.5 hover:scale-[1.01]",
          "hover:shadow-[0_0_70px_rgba(37,99,235,0.35)]",
          "dark:hover:shadow-[0_0_80px_rgba(249,115,22,0.45)]",
          // Entrance
          "animate-in fade-in slide-in-from-bottom-8 zoom-in-95",
          "fill-mode-both duration-700 ease-out",
        ].join(" ")}
      >
        {/* -- Logo Icon ----------------------------------------------- */}
        <div
          className={[
            "mb-4 flex justify-center",
            "animate-in fade-in slide-in-from-bottom-4",
            "fill-mode-both duration-700 ease-out delay-75",
          ].join(" ")}
        >
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30 dark:from-orange-500 dark:to-orange-700 dark:shadow-orange-500/30">
            <GraduationCap className="size-8 text-white" strokeWidth={2.2} />
          </div>
        </div>

        {/* -- Title — Gradient Shimmer -------------------------------- */}
        <div
          className={[
            "mb-8 text-center",
            "animate-in fade-in slide-in-from-bottom-4",
            "fill-mode-both duration-700 ease-out delay-75",
          ].join(" ")}
        >
          <h1 className="text-[1.65rem] font-bold tracking-tight sm:text-[1.8rem]">
            <span className="animate-shimmer bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-clip-text text-transparent dark:from-orange-500 dark:via-amber-400 dark:to-orange-500">
              Portal Wisuda Digital
            </span>
          </h1>
          <p className="mt-2 text-[0.84rem] text-slate-500 dark:text-zinc-400">
            Masuk untuk mengakses undangan dan informasi acara
          </p>
        </div>

        {/* -- Form ---------------------------------------------------- */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Error banner */}
          {error && (
            <div className="animate-in fade-in duration-300 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/20 dark:bg-red-500/10">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* -- Email ------------------------------------------------- */}
          <div
            className={[
              "space-y-2",
              "animate-in fade-in slide-in-from-bottom-5",
              "fill-mode-both duration-700 ease-out delay-150",
            ].join(" ")}
          >
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-slate-700 dark:text-zinc-300"
            >
              Email
            </label>
            <div className="group relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-slate-400 transition-colors duration-300 group-focus-within:text-blue-500 dark:text-zinc-500 dark:group-focus-within:text-orange-400" />
              <input
                id="login-email"
                type="email"
                placeholder="nama@kampus.ac.id"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={[
                  "h-12 w-full rounded-xl pl-11 pr-4 text-sm outline-none",
                  "border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
                  "transition-all duration-300",
                  "focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/40",
                  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500",
                  "dark:focus:border-orange-500 dark:focus:ring-2 dark:focus:ring-orange-500/40",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                ].join(" ")}
              />
            </div>
          </div>

          {/* -- Password ---------------------------------------------- */}
          <div
            className={[
              "space-y-2",
              "animate-in fade-in slide-in-from-bottom-5",
              "fill-mode-both duration-700 ease-out delay-150",
            ].join(" ")}
          >
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-slate-700 dark:text-zinc-300"
            >
              Password
            </label>
            <div className="group relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-slate-400 transition-colors duration-300 group-focus-within:text-blue-500 dark:text-zinc-500 dark:group-focus-within:text-orange-400" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={[
                  "h-12 w-full rounded-xl pl-11 pr-12 text-sm outline-none",
                  "border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400",
                  "transition-all duration-300",
                  "focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/40",
                  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500",
                  "dark:focus:border-orange-500 dark:focus:ring-2 dark:focus:ring-orange-500/40",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                ].join(" ")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1 text-slate-400 transition-colors duration-200 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200"
              >
                {showPassword ? (
                  <EyeOff className="size-[17px]" />
                ) : (
                  <Eye className="size-[17px]" />
                )}
              </button>
            </div>
            <div className="flex justify-end">
              <a
                href="#"
                className="text-xs text-slate-400 underline-offset-4 transition-colors duration-200 hover:text-blue-600 hover:underline dark:text-zinc-500 dark:hover:text-orange-400"
              >
                Lupa password?
              </a>
            </div>
          </div>

          {/* -- Submit Button — 3D Pop -------------------------------- */}
          <div
            className={[
              "pt-1",
              "animate-in fade-in slide-in-from-bottom-5",
              "fill-mode-both duration-700 ease-out delay-300",
            ].join(" ")}
          >
            <button
              type="submit"
              disabled={isLoading}
              className={[
                "flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold",
                // Light — Blue gradient + blue drop shadow
                "bg-gradient-to-r from-blue-600 to-blue-500 text-white",
                "shadow-[0_4px_0_0_#1e40af,0_6px_20px_rgba(37,99,235,0.3)]",
                "hover:from-blue-700 hover:to-blue-600",
                // Dark — Orange gradient + orange drop shadow
                "dark:from-orange-600 dark:to-orange-500 dark:text-black dark:font-bold",
                "dark:shadow-[0_4px_0_0_#c2410c,0_6px_20px_rgba(249,115,22,0.3)]",
                "dark:hover:from-orange-700 dark:hover:to-orange-600",
                // Active press-down
                "active:translate-y-0.5 active:scale-[0.98]",
                "active:shadow-[0_1px_0_0_#1e40af,0_2px_8px_rgba(37,99,235,0.2)]",
                "dark:active:shadow-[0_1px_0_0_#c2410c,0_2px_8px_rgba(249,115,22,0.2)]",
                // Transition
                "transition-all duration-200",
                "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0 disabled:active:scale-100",
              ].join(" ")}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Memproses…
                </>
              ) : (
                "Masuk ke Portal"
              )}
            </button>
          </div>
        </form>

        {/* -- Footer -------------------------------------------------- */}
        <p
          className={[
            "mt-8 text-center text-xs text-slate-400 dark:text-zinc-600",
            "animate-in fade-in fill-mode-both duration-500 ease-out delay-500",
          ].join(" ")}
        >
          © {new Date().getFullYear()} Sistem Informasi Wisuda Digital
        </p>
      </div>
    </main>
  );
}
