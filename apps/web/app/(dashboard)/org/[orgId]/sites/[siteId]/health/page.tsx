import { parseOrgId } from "../../../../../../../src/lib/validators/org";
import { requireOrgMember } from "../../../../../../../src/lib/auth-guards";
import { HealthClient } from "./health-client";

type Props = {
  params: Promise<{ orgId: string; siteId: string }>;
};

export default async function SiteHealthPage({ params }: Props) {
  const { orgId, siteId } = await params;
  const parsedOrgId = parseOrgId(orgId);

  await requireOrgMember(parsedOrgId, { allowMetriCoreAdminRead: true });

  return <HealthClient orgId={parsedOrgId} siteId={siteId} />;
}
