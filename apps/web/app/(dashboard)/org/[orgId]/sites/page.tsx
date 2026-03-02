import { parseOrgId } from "../../../../../src/lib/validators/org";
import { SitesClient } from "./sites-client";

type Props = {
  params: Promise<{ orgId: string }>;
};

export default async function SitesPage({ params }: Props) {
  const { orgId } = await params;
  const parsedOrgId = parseOrgId(orgId);

  return <SitesClient orgId={parsedOrgId} />;
}
