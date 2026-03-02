import { db } from "../lib/db";

export async function createSite(orgId: string, url: string, displayName: string) {
  return db.site.create({
    data: {
      orgId,
      url,
      displayName
    },
    select: {
      id: true,
      orgId: true,
      url: true,
      displayName: true,
      createdAt: true
    }
  });
}

export async function listOrgSites(orgId: string) {
  return db.site.findMany({
    where: { orgId },
    select: {
      id: true,
      orgId: true,
      url: true,
      displayName: true,
      createdAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getOrgSiteById(orgId: string, siteId: string) {
  return db.site.findFirst({
    where: {
      id: siteId,
      orgId
    },
    select: {
      id: true,
      orgId: true,
      url: true,
      displayName: true,
      createdAt: true
    }
  });
}

export async function deleteSite(orgId: string, siteId: string) {
  return db.site.delete({
    where: {
      id: siteId,
      orgId
    },
    select: {
      id: true,
      orgId: true,
      url: true,
      displayName: true,
      createdAt: true
    }
  });
}
