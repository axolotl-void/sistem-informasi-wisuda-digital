import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  // Redirect berdasarkan role
  switch (session.role) {
    case "SUPER_ADMIN":
    case "ADMIN_FAKULTAS":
      redirect("/dashboard");
    case "PETUGAS_SCAN":
      redirect("/scan");
    case "MAHASISWA":
      redirect("/mahasiswa/dashboard");
    default:
      redirect("/login");
  }
}
