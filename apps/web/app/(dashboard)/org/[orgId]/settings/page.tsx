import { PageShell } from "../../../../../src/components/dashboard/page-shell";
import { parseOrgId } from "../../../../../src/lib/validators/org";
import { SettingsClient } from "./settings-client";

type Props = {
  params: Promise<{ orgId: string }>;
};

export default async function OrgSettingsPage({ params }: Props) {
  const { orgId } = await params;
  const parsedOrgId = parseOrgId(orgId);

  return (
    <PageShell title="Settings" description="Manage Google integrations for each site in this organization.">
      <SettingsClient orgId={parsedOrgId} />
    </PageShell>
  );
}
