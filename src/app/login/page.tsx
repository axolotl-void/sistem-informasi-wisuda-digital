"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import axios from "axios";
import {
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  readAuthStorage,
  syncAuthFromSession,
  fetchWithAuth,
  clearClientAuth,
} from "@/lib/client-auth";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { LoginAurora } from "@/features/auth/components/login-aurora";
export default function LoginPage() {
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Redirect otomatis hanya dari callback middleware (?callbackUrl=) — hindari loop spam
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get("callbackUrl");
    if (!callbackUrl) return;

    let cancelled = false;
    async function resumeSession() {
      let { token, role } = readAuthStorage();
      if (!token) {
        await syncAuthFromSession();
        ({ token, role } = readAuthStorage());
      }
      if (cancelled || !token || !role) return;

      const verifyUrl = role === "MAHASISWA" ? "/api/portal/me" : "/api/auth/me";
      const meRes = await fetchWithAuth(verifyUrl);
      if (!meRes.ok) {
        clearClientAuth();
        return;
      }

      window.location.replace(callbackUrl || "/portal");
    }
    void resumeSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const inputClassName = [
    "h-10 w-full rounded-lg text-sm outline-none sm:h-12 sm:rounded-xl",
    "border border-slate-200 bg-slate-50 text-slate-900 caret-slate-900 placeholder:text-slate-400",
    "transition-all duration-300",
    "focus:border-blue-500 focus:bg-white focus:text-slate-900 focus:ring-2 focus:ring-blue-500/40",
    "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:caret-zinc-100 dark:placeholder:text-zinc-500",
    "dark:focus:border-orange-500 dark:focus:bg-zinc-900 dark:focus:text-zinc-100 dark:focus:ring-2 dark:focus:ring-orange-500/40",
    "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#f8fafc]",
    "[&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a]",
    "dark:[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#18181b]",
    "dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#f4f4f5]",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" ");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = formRef.current ?? e.currentTarget;
    const fd = new FormData(form);
    const emailVal = String(fd.get("email") ?? email).trim();
    const passwordVal = String(fd.get("password") ?? password);

    if (!emailVal || !passwordVal) {
      setError("Email dan password wajib diisi");
      return;
    }

    setEmail(emailVal);
    setPassword(passwordVal);

    try {
      await login({ email: emailVal, password: passwordVal });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          (err.response?.data as { message?: string })?.message ??
          "Email atau password salah";
        setError(msg);
      } else {
        setError(
          err instanceof Error ? err.message : "Email atau password salah",
        );
      }
    }
  }

  return (
    <main
      className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-3 py-5 sm:min-h-screen sm:w-screen sm:px-0 sm:py-0"
      style={{ backgroundImage: "url('/img/Tamnel-login-page.png')" }}
    >
      {/* Aurora — bagian atas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[min(38vh,320px)] min-h-[160px] sm:h-[min(46vh,420px)] sm:min-h-[220px]"
      >
        <div
          className="absolute inset-0 opacity-90 [mask-image:linear-gradient(to_bottom,black_25%,transparent_100%)]"
          style={{ WebkitMaskImage: "linear-gradient(to bottom, black 25%, transparent 100%)" }}
        >
          <LoginAurora />
        </div>
      </div>

      {/* ================================================================
          1. BACKGROUND OVERLAY — Light / Dark adaptive
      ================================================================ */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-b from-white/5 via-white/15 to-white/35 backdrop-blur-[2px] dark:from-black/25 dark:via-black/45 dark:to-black/65 dark:backdrop-blur-sm"
      />

      {/* Bottom aura glow — blue (light) / orange (dark) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 h-80 w-[60vw] max-w-3xl rounded-full bg-blue-500/30 blur-[100px] dark:bg-orange-500/25"
      />

      {/* ================================================================
          2. THEME TOGGLE — Top-right absolute
      ================================================================ */}
      <AnimatedThemeToggler
        variant="circle"
        duration={420}
        className="absolute top-3 right-3 z-30 flex size-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 sm:top-5 sm:right-5 sm:size-10 sm:rounded-xl dark:border-orange-500/30 dark:bg-zinc-900/80"
      />

      {/* ================================================================
          3. CARD — Glassmorphism + Aura Glow + 3D Hover
      ================================================================ */}
      <div
        className={[
          "relative z-10 w-full max-w-[19.5rem] sm:max-w-[26rem]",
          "rounded-2xl px-5 py-6 sm:rounded-3xl sm:px-9 sm:py-10",
          "backdrop-blur-xl",
          // Light: white card + blue aura glow
          "bg-white/90 border border-blue-100",
          "shadow-[0_0_40px_rgba(37,99,235,0.2)] sm:shadow-[0_0_50px_rgba(37,99,235,0.25)]",
          // Dark: dark card + orange aura glow
          "dark:bg-zinc-950/90 dark:border-orange-500/20",
          "dark:shadow-[0_0_45px_rgba(249,115,22,0.3)] sm:dark:shadow-[0_0_60px_rgba(249,115,22,0.35)]",
          // 3D hover lift (desktop only)
          "transition-all duration-500 ease-out",
          "sm:hover:-translate-y-1.5 sm:hover:scale-[1.01]",
          "sm:hover:shadow-[0_0_70px_rgba(37,99,235,0.35)]",
          "sm:dark:hover:shadow-[0_0_80px_rgba(249,115,22,0.45)]",
          // Entrance
          "animate-in fade-in slide-in-from-bottom-8 zoom-in-95",
          "fill-mode-both duration-700 ease-out",
        ].join(" ")}
      >
        {/* -- Logo Icon ----------------------------------------------- */}
        <div
          className={[
            "mb-3 flex justify-center sm:mb-4",
            "animate-in fade-in slide-in-from-bottom-4",
            "fill-mode-both duration-700 ease-out delay-75",
          ].join(" ")}
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30 sm:size-16 sm:rounded-2xl dark:from-orange-500 dark:to-orange-700 dark:shadow-orange-500/30 p-1 sm:p-1.5">
            <img src="/img/logo-wusuda-2.png" alt="Logo Wisuda" className="size-full object-contain" />
          </div>
        </div>

        {/* -- Title — Gradient Shimmer -------------------------------- */}
        <div
          className={[
            "mb-5 text-center sm:mb-8",
            "animate-in fade-in slide-in-from-bottom-4",
            "fill-mode-both duration-700 ease-out delay-75",
          ].join(" ")}
        >
          <h1 className="text-lg font-bold tracking-tight sm:text-[1.8rem]">
            <span className="animate-shimmer bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-clip-text text-transparent dark:from-orange-500 dark:via-amber-400 dark:to-orange-500">
              Portal Wisuda Digital
            </span>
          </h1>
          <p className="mt-1.5 text-xs leading-snug text-slate-500 sm:mt-2 sm:text-[0.84rem] dark:text-zinc-400">
            Masuk untuk mengakses undangan dan informasi acara
          </p>
        </div>

        {/* -- Form ---------------------------------------------------- */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="space-y-3.5 sm:space-y-5"
        >
          {/* Error banner */}
          {error && (
            <div className="animate-in fade-in duration-300 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/20 dark:bg-red-500/10">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* -- Email ------------------------------------------------- */}
          <div
            className={[
              "space-y-1.5 sm:space-y-2",
              "animate-in fade-in slide-in-from-bottom-5",
              "fill-mode-both duration-700 ease-out delay-150",
            ].join(" ")}
          >
            <label
              htmlFor="login-email"
              className="block text-xs font-medium text-slate-700 sm:text-sm dark:text-zinc-300"
            >
              Email
            </label>
            <div className="group relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 transition-colors duration-300 group-focus-within:text-blue-500 sm:left-3.5 sm:size-[17px] dark:text-zinc-500 dark:group-focus-within:text-orange-400" />
              <input
                id="login-email"
                name="email"
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="nama@kampus.ac.id"
                autoComplete="username"
                enterKeyHint="next"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onInput={(e) => setEmail(e.currentTarget.value)}
                disabled={isLoading}
                className={`${inputClassName} pl-10 pr-3 sm:pl-11 sm:pr-4`}
              />
            </div>
          </div>

          {/* -- Password ---------------------------------------------- */}
          <div
            className={[
              "space-y-1.5 sm:space-y-2",
              "animate-in fade-in slide-in-from-bottom-5",
              "fill-mode-both duration-700 ease-out delay-150",
            ].join(" ")}
          >
            <label
              htmlFor="login-password"
              className="block text-xs font-medium text-slate-700 sm:text-sm dark:text-zinc-300"
            >
              Password
            </label>
            <div className="group relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 transition-colors duration-300 group-focus-within:text-blue-500 sm:left-3.5 sm:size-[17px] dark:text-zinc-500 dark:group-focus-within:text-orange-400" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                enterKeyHint="go"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onInput={(e) => setPassword(e.currentTarget.value)}
                disabled={isLoading}
                className={`${inputClassName} pl-10 pr-10 sm:pl-11 sm:pr-12`}
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
              <button
                type="button"
                className="text-xs text-slate-400 underline-offset-4 transition-colors duration-200 hover:text-blue-600 hover:underline dark:text-zinc-500 dark:hover:text-orange-400"
              >
                Lupa password?
              </button>
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
                "touch-manipulation",
                "flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-semibold sm:h-12 sm:rounded-xl",
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
            "mt-5 text-center text-[10px] text-slate-400 sm:mt-8 sm:text-xs dark:text-zinc-600",
            "animate-in fade-in fill-mode-both duration-500 ease-out delay-500",
          ].join(" ")}
        >
          © {new Date().getFullYear()} Sistem Informasi Wisuda Digital
        </p>
      </div>
    </main>
  );
}
