import { requireOrgMember } from "../../../../../../../src/lib/auth-guards";
import { parseOrgId } from "../../../../../../../src/lib/validators/org";
import { SearchClient } from "./search-client";

type Props = {
  params: Promise<{ orgId: string; siteId: string }>;
};

export default async function SiteSearchPage({ params }: Props) {
  const { orgId, siteId } = await params;
  const parsedOrgId = parseOrgId(orgId);

  await requireOrgMember(parsedOrgId, { allowMetriCoreAdminRead: true });

  return <SearchClient orgId={parsedOrgId} siteId={siteId} />;
}
