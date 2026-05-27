"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, ShieldCheck, Trash2, UserCog, UserRoundSearch } from "lucide-react";
import { API_ROUTES, FAKULTAS_LIST } from "@/utils/constants";
import { fetchWithAuth } from "@/lib/client-auth";
import { cn } from "@/lib/utils";
import { glassBtnPrimary } from "@/components/ui/liquid-glass";

type StaffRole = "SUPER_ADMIN" | "ADMIN_FAKULTAS" | "PETUGAS_SCAN";

type StaffAccount = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  fakultas: string | null;
  createdAt: string;
};

type CreatePayload = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN_FAKULTAS" | "PETUGAS_SCAN";
  fakultas?: string;
};

const roleLabel: Record<StaffRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN_FAKULTAS: "Admin",
  PETUGAS_SCAN: "Pengawas",
};

export function AccountManagementPage() {
  const [accounts, setAccounts] = useState<StaffAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");

  const [form, setForm] = useState<CreatePayload>({
    name: "",
    email: "",
    password: "",
    role: "ADMIN_FAKULTAS",
    fakultas: "",
  });

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetchWithAuth(API_ROUTES.ADMIN.ACCOUNTS);
      const body = await res.json();
      if (!res.ok || !body?.success) {
        throw new Error(body?.message ?? "Gagal memuat data akun");
      }
      setAccounts(body.data as StaffAccount[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data akun");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return accounts;
    return accounts.filter((acc) => {
      return (
        acc.name.toLowerCase().includes(needle) ||
        acc.email.toLowerCase().includes(needle) ||
        roleLabel[acc.role].toLowerCase().includes(needle)
      );
    });
  }, [accounts, query]);

  async function submitCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const payload: CreatePayload = {
        ...form,
        email: form.email.trim(),
        name: form.name.trim(),
        fakultas: form.fakultas?.trim() || undefined,
      };

      const res = await fetchWithAuth(API_ROUTES.ADMIN.ACCOUNTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok || !body?.success) {
        throw new Error(body?.message ?? "Gagal menambahkan akun");
      }

      setSuccess("Akun berhasil ditambahkan");
      setForm({
        name: "",
        email: "",
        password: "",
        role: "ADMIN_FAKULTAS",
        fakultas: "",
      });
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambahkan akun");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeAccount(target: StaffAccount) {
    if (target.role === "SUPER_ADMIN") return;
    if (!confirm(`Hapus akun ${target.name}?`)) return;

    setError("");
    setSuccess("");

    try {
      const res = await fetchWithAuth(`${API_ROUTES.ADMIN.ACCOUNTS}/${target.id}`, {
        method: "DELETE",
      });
      const body = await res.json();
      if (!res.ok || !body?.success) {
        throw new Error(body?.message ?? "Gagal menghapus akun");
      }
      setSuccess("Akun berhasil dihapus");
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus akun");
    }
  }

  return (
    <div className="dashboard-mesh relative -m-4 min-h-full overflow-hidden rounded-none p-4 sm:-m-6 sm:rounded-3xl sm:p-6">
      <div className="relative z-10 space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl border border-white/90 bg-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_16px_rgba(59,130,246,0.1)] dark:border-white/10 dark:bg-white/[0.08]">
              <ShieldCheck className="size-5 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Manajemen Akun
              </h1>
              <p className="mt-0.5 text-sm font-medium text-slate-600 dark:text-white/45">
                Tambah dan kelola akun admin serta pengawas
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]">
          <form
            onSubmit={submitCreate}
            className="rounded-2xl border border-white/90 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div className="mb-3 flex items-center gap-2">
              <Plus className="size-4 text-blue-600 dark:text-blue-300" />
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white/85">Tambah Akun</h2>
            </div>

            <div className="space-y-3">
              <input
                placeholder="Nama lengkap"
                value={form.name}
                onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100"
                minLength={8}
                required
              />
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((v) => ({
                    ...v,
                    role: e.target.value as CreatePayload["role"],
                  }))
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100"
              >
                <option value="ADMIN_FAKULTAS">Admin</option>
                <option value="PETUGAS_SCAN">Pengawas</option>
              </select>
              <select
                value={form.fakultas ?? ""}
                onChange={(e) => setForm((v) => ({ ...v, fakultas: e.target.value }))}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100"
              >
                <option value="">Semua fakultas (opsional)</option>
                {FAKULTAS_LIST.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <button type="submit" disabled={isSaving} className={cn(glassBtnPrimary, "h-10 w-full")}>
                {isSaving ? "Menyimpan..." : "Tambah Akun"}
              </button>
            </div>
          </form>

          <section className="rounded-2xl border border-white/90 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white/85">
                <UserCog className="size-4 text-blue-600 dark:text-blue-300" />
                Daftar Akun
              </h2>
              <div className="relative w-full max-w-[220px]">
                <UserRoundSearch className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari nama / email"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              {isLoading ? (
                <p className="py-6 text-center text-sm text-slate-500 dark:text-white/45">Memuat data akun...</p>
              ) : filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500 dark:text-white/45">Belum ada akun ditemukan</p>
              ) : (
                filtered.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white/85">{acc.name}</p>
                      <p className="text-xs text-slate-500 dark:text-white/45">{acc.email}</p>
                      <p className="mt-1 text-[11px] text-blue-700 dark:text-blue-300">
                        {roleLabel[acc.role]}
                        {acc.fakultas ? ` • ${acc.fakultas}` : ""}
                      </p>
                    </div>

                    {acc.role === "SUPER_ADMIN" ? (
                      <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                        Protected
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void removeAccount(acc)}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-500"
                        aria-label={`Hapus akun ${acc.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </section>

        {(error || success) && (
          <div
            className={cn(
              "rounded-xl border px-4 py-3 text-sm",
              error
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
            )}
          >
            {error || success}
          </div>
        )}
      </div>
    </div>
  );
}
