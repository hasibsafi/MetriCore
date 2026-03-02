import { DashboardShell } from "../../../../src/components/dashboard/dashboard-shell";
import { requireOrgMember } from "../../../../src/lib/auth-guards";
import { parseOrgId } from "../../../../src/lib/validators/org";
import { listSites } from "../../../../src/services/site-service";

type Props = {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
};

export default async function OrgDashboardLayout({ children, params }: Props) {
  const { orgId } = await params;
  const parsedOrgId = parseOrgId(orgId);
  const access = await requireOrgMember(parsedOrgId, { allowMetriCoreAdminRead: true });
  const sites = await listSites(access.user.id, parsedOrgId);
  const primarySiteId = sites[0]?.id ?? null;

  return (
    <DashboardShell orgId={parsedOrgId} userEmail={access.user.email} primarySiteId={primarySiteId}>
      {children}
    </DashboardShell>
  );
}
