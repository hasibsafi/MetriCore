import { requireOrgMember } from "../../../../../src/lib/auth-guards";
import { parseOrgId } from "../../../../../src/lib/validators/org";
import { OverviewClient } from "./overview-client";

type Props = {
  params: Promise<{ orgId: string }>;
};

export default async function OrgOverviewPage({ params }: Props) {
  const { orgId } = await params;
  const parsedOrgId = parseOrgId(orgId);

  await requireOrgMember(parsedOrgId, { allowMetriCoreAdminRead: true });

  return <OverviewClient orgId={parsedOrgId} />;
}
