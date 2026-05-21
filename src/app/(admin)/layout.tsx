import { requireRole } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["SUPER_ADMIN", "ADMIN_FAKULTAS", "PETUGAS_SCAN"]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#07111F]">
      {/* Floating glass sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
