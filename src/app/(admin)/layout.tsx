import { requireRole } from "@/lib/auth";
import { AdminLayoutShell } from "@/components/layout/admin-layout-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["SUPER_ADMIN", "ADMIN_FAKULTAS", "PETUGAS_SCAN"]);

  return (
    <AdminLayoutShell>
      {children}
    </AdminLayoutShell>
  );
}
