import { requireRole } from "@/lib/auth";
import { MahasiswaHeader } from "@/components/layout/mahasiswa-header";

export default async function MahasiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["MAHASISWA"]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MahasiswaHeader />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {children}
      </main>
    </div>
  );
}
