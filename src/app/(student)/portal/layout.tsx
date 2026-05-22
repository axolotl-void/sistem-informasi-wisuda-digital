import { PortalAuthWrapper } from "./_components/portal-auth-wrapper";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalAuthWrapper>{children}</PortalAuthWrapper>;
}
