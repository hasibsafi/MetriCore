import { createOrgBodySchema } from "@metricore/shared";
import { createAuditLog } from "../repositories/audit-log-repository";
import { createOrgWithOwner, listUserOrgs } from "../repositories/org-repository";

export async function createOrg(currentUserId: string, name: string) {
  const parsed = createOrgBodySchema.parse({ name });
  const organization = await createOrgWithOwner(currentUserId, parsed.name);

  await createAuditLog({
    orgId: organization.id,
    actorUserId: currentUserId,
    action: "org.created",
    entityType: "organization",
    entityId: organization.id
  });

  return organization;
}

export async function listOrgs(currentUserId: string) {
  const memberships = await listUserOrgs(currentUserId);

  return memberships.map((membership) => ({
    orgId: membership.organization.id,
    name: membership.organization.name,
    role: membership.role,
    createdAt: membership.organization.createdAt
  }));
}
