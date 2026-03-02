import { MembershipRole } from "@prisma/client";

export function isRoleAllowed(role: MembershipRole, allowedRoles: MembershipRole[]): boolean {
  return allowedRoles.includes(role);
}
