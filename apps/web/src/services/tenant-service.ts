import { z } from "zod";
import { createOrganization } from "../repositories/organization-repository";
import { createOwnerMembership, getOrgMembership, getUserOrgs } from "../repositories/membership-repository";

const createOrgSchema = z.object({
  name: z.string().trim().min(2, "Organization name is required").max(120)
});

export async function getUserOrganizations(userId: string) {
  return getUserOrgs(userId);
}

export async function getMembershipForOrg(userId: string, orgId: string) {
  return getOrgMembership(userId, orgId);
}

export async function createOrganizationForUser(input: { userId: string; name: string }) {
  const parsed = createOrgSchema.parse({ name: input.name });
  const org = await createOrganization(parsed.name);
  await createOwnerMembership(org.id, input.userId);
  return org;
}
