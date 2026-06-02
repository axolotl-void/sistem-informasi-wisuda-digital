import { requireRole } from "@/lib/auth";

export default async function PetugasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["PETUGAS_SCAN", "SUPER_ADMIN"]);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-[#0A0A0C] dark:text-slate-100 overflow-x-hidden font-sans relative flex flex-col transition-colors duration-300">
      {children}
    </div>
  );
}
