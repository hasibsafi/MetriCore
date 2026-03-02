import { db } from "../lib/db";

export async function getSiteIntegration(orgId: string, siteId: string) {
  return db.siteIntegration.findFirst({
    where: {
      orgId,
      siteId
    },
    select: {
      id: true,
      orgId: true,
      siteId: true,
      ga4PropertyId: true,
      gscSiteUrl: true,
      googleRefreshToken: true,
      googleTokenExpiresAt: true,
      googleEmail: true,
      connectedAt: true
    }
  });
}

export async function clearGoogleConnection(orgId: string, siteId: string) {
  await db.siteIntegration.updateMany({
    where: {
      orgId,
      siteId
    },
    data: {
      googleRefreshToken: null,
      googleTokenExpiresAt: null,
      googleEmail: null,
      connectedAt: null
    }
  });
}

export async function touchGoogleTokenExpiry(orgId: string, siteId: string, tokenExpiresAt: Date | null) {
  await db.siteIntegration.updateMany({
    where: {
      orgId,
      siteId
    },
    data: {
      googleTokenExpiresAt: tokenExpiresAt
    }
  });
}
