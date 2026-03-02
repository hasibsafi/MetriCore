import { requireOrgMember } from "../../../../../../../src/lib/auth-guards";
import { parseOrgId } from "../../../../../../../src/lib/validators/org";
import { RecommendationsClient } from "./recommendations-client";

type Props = {
  params: Promise<{ orgId: string; siteId: string }>;
};

export default async function SiteRecommendationsPage({ params }: Props) {
  const { orgId, siteId } = await params;
  const parsedOrgId = parseOrgId(orgId);

  await requireOrgMember(parsedOrgId, { allowMetriCoreAdminRead: true });

  return <RecommendationsClient orgId={parsedOrgId} siteId={siteId} />;
}
