import { MembershipRole } from "@prisma/client";
import { db } from "../lib/db";

export type OrgMembershipView = {
  orgId: string;
  orgName: string;
  role: MembershipRole;
};

export async function getUserOrgs(userId: string): Promise<OrgMembershipView[]> {
  const memberships = await db.membership.findMany({
    where: { userId },
    include: {
      organization: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      organization: {
        name: "asc"
      }
    }
  });

  return memberships.map((membership) => ({
    orgId: membership.organization.id,
    orgName: membership.organization.name,
    role: membership.role
  }));
}

export async function getOrgMembership(userId: string, orgId: string) {
  return db.membership.findUnique({
    where: {
      orgId_userId: {
        orgId,
        userId
      }
    },
    select: {
      id: true,
      orgId: true,
      userId: true,
      role: true
    }
  });
}

export async function getMembership(userId: string, orgId: string) {
  return getOrgMembership(userId, orgId);
}

export async function listUserMemberships(userId: string) {
  return db.membership.findMany({
    where: { userId },
    select: {
      id: true,
      orgId: true,
      userId: true,
      role: true,
      organization: {
        select: {
          id: true,
          name: true,
          createdAt: true
        }
      }
    },
    orderBy: {
      organization: {
        name: "asc"
      }
    }
  });
}

export async function createOwnerMembership(orgId: string, userId: string) {
  return db.membership.create({
    data: {
      orgId,
      userId,
      role: MembershipRole.owner
    },
    select: {
      id: true,
      orgId: true,
      userId: true,
      role: true
    }
  });
}
