import { requireRole } from "@/lib/auth";
import { ScannerHeader } from "@/components/layout/scanner-header";

export default async function ScannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["PETUGAS_SCAN", "SUPER_ADMIN"]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <ScannerHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
