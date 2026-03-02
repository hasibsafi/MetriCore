import { createSiteBodySchema, validatePublicHttpUrl } from "@metricore/shared";
import { createAuditLog } from "../repositories/audit-log-repository";
import { createSite as createSiteRecord, deleteSite as deleteSiteRecord, getOrgSiteById, listOrgSites } from "../repositories/site-repository";

export async function createSite(currentUserId: string, orgId: string, url: string, displayName: string) {
  const parsed = createSiteBodySchema.parse({ url, displayName });
  const validated = validatePublicHttpUrl(parsed.url);

  const site = await createSiteRecord(orgId, validated.normalizedUrl, parsed.displayName);

  await createAuditLog({
    orgId,
    actorUserId: currentUserId,
    action: "site.created",
    entityType: "site",
    entityId: site.id,
    metadataJson: {
      url: site.url
    }
  });

  return site;
}

export async function listSites(_currentUserId: string, orgId: string) {
  return listOrgSites(orgId);
}

export async function deleteSite(currentUserId: string, orgId: string, siteId: string) {
  const site = await getOrgSiteById(orgId, siteId);
  if (!site) {
    throw Object.assign(new Error("Site not found."), { status: 404 });
  }

  const deleted = await deleteSiteRecord(orgId, siteId);

  await createAuditLog({
    orgId,
    actorUserId: currentUserId,
    action: "site.deleted",
    entityType: "site",
    entityId: siteId,
    metadataJson: {
      url: deleted.url
    }
  });

  return deleted;
}
