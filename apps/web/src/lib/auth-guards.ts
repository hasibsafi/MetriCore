import { MembershipRole } from "@prisma/client";
import { auth } from "./auth.config";
import { parseOrgId } from "./validators/org";
import { getMembershipForOrg } from "../services/tenant-service";
import { isRoleAllowed } from "./rbac";

export class UnauthorizedError extends Error {
  readonly status = 401;

  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  readonly status = 403;

  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export type SessionUser = {
  id: string;
  email: string | null;
  isMetriCoreAdmin: boolean;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    isMetriCoreAdmin: Boolean(session.user.isMetriCoreAdmin)
  };
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}

export async function requireOrgMember(
  orgId: string,
  options?: {
    allowMetriCoreAdminRead?: boolean;
  }
) {
  const parsedOrgId = parseOrgId(orgId);
  const user = await requireSession();
  const membership = await getMembershipForOrg(user.id, parsedOrgId);

  if (membership) {
    return { user, membership, orgId: parsedOrgId, isAdminReadBypass: false };
  }

  if (options?.allowMetriCoreAdminRead && user.isMetriCoreAdmin) {
    return { user, membership: null, orgId: parsedOrgId, isAdminReadBypass: true };
  }

  throw new ForbiddenError("You do not have access to this organization.");
}

export async function requireOrgRole(
  orgId: string,
  allowedRoles: MembershipRole[],
  options?: {
    allowMetriCoreAdminRead?: boolean;
  }
) {
  const parsedOrgId = parseOrgId(orgId);
  const user = await requireSession();
  const membership = await getMembershipForOrg(user.id, parsedOrgId);

  if (membership && isRoleAllowed(membership.role, allowedRoles)) {
    return { user, membership, orgId: parsedOrgId, isAdminReadBypass: false };
  }

  if (options?.allowMetriCoreAdminRead && user.isMetriCoreAdmin) {
    return { user, membership: null, orgId: parsedOrgId, isAdminReadBypass: true };
  }

  throw new ForbiddenError("You do not have permission for this action.");
}
