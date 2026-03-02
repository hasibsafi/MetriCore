import { MembershipRole } from "@prisma/client";
import { db } from "../lib/db";

export async function createOrgWithOwner(userId: string, name: string) {
  return db.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name },
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });

    await tx.membership.create({
      data: {
        orgId: organization.id,
        userId,
        role: MembershipRole.owner
      }
    });

    return organization;
  });
}

export async function listUserOrgs(userId: string) {
  return db.membership.findMany({
    where: { userId },
    select: {
      orgId: true,
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

export async function getOrgById(orgId: string) {
  return db.organization.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      name: true,
      createdAt: true
    }
  });
}
