import { requireRole } from "@/lib/auth";
import { AccountManagementPage } from "@/features/account/components/account-management-page";

export default async function AkunPage() {
  await requireRole(["SUPER_ADMIN"]);
  return <AccountManagementPage />;
}
