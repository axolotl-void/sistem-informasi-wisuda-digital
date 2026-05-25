import type { Metadata } from "next";
import { PortalAuthWrapper } from "./_components/portal-auth-wrapper";

export const metadata: Metadata = {
  title: "Portal Wisudawan",
  description: "Profil, pengajuan tamu, dan e-ticket wisuda digital",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalAuthWrapper>{children}</PortalAuthWrapper>;
}
