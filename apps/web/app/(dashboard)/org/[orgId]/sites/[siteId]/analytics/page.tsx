import { requireOrgMember } from "../../../../../../../src/lib/auth-guards";
import { parseOrgId } from "../../../../../../../src/lib/validators/org";
import { AnalyticsClient } from "./analytics-client";

type Props = {
  params: Promise<{ orgId: string; siteId: string }>;
};

export default async function SiteAnalyticsPage({ params }: Props) {
  const { orgId, siteId } = await params;
  const parsedOrgId = parseOrgId(orgId);

  await requireOrgMember(parsedOrgId, { allowMetriCoreAdminRead: true });

  return <AnalyticsClient orgId={parsedOrgId} siteId={siteId} />;
}
