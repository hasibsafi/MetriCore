import { db } from "../lib/db";

type UpsertIntegrationsInput = {
  ga4PropertyId?: string | null;
  gscSiteUrl?: string | null;
};

type UpdateGoogleConnectionInput = {
  encryptedRefreshToken: string;
  tokenExpiresAt: Date | null;
  googleEmail: string | null;
};

export async function upsertIntegrations(orgId: string, siteId: string, integrations: UpsertIntegrationsInput) {
  return db.siteIntegration.upsert({
    where: {
      siteId
    },
    update: {
      orgId,
      ga4PropertyId: integrations.ga4PropertyId ?? null,
      gscSiteUrl: integrations.gscSiteUrl ?? null
    },
    create: {
      orgId,
      siteId,
      ga4PropertyId: integrations.ga4PropertyId ?? null,
      gscSiteUrl: integrations.gscSiteUrl ?? null
    },
    select: {
      id: true,
      orgId: true,
      siteId: true,
      ga4PropertyId: true,
      gscSiteUrl: true,
      googleTokenExpiresAt: true,
      googleEmail: true,
      connectedAt: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

export async function getIntegrations(orgId: string, siteId: string) {
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
      googleTokenExpiresAt: true,
      googleEmail: true,
      connectedAt: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

export async function getIntegrationWithSecret(orgId: string, siteId: string) {
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
      connectedAt: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

export async function updateGoogleConnection(orgId: string, siteId: string, input: UpdateGoogleConnectionInput) {
  return db.siteIntegration.upsert({
    where: {
      siteId
    },
    update: {
      orgId,
      googleRefreshToken: input.encryptedRefreshToken,
      googleTokenExpiresAt: input.tokenExpiresAt,
      googleEmail: input.googleEmail,
      connectedAt: new Date()
    },
    create: {
      orgId,
      siteId,
      googleRefreshToken: input.encryptedRefreshToken,
      googleTokenExpiresAt: input.tokenExpiresAt,
      googleEmail: input.googleEmail,
      connectedAt: new Date()
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
      connectedAt: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

export async function disconnectGoogleConnection(orgId: string, siteId: string) {
  return db.siteIntegration.updateMany({
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

export async function getGoogleIntegrationStatus(orgId: string, siteId: string) {
  return db.siteIntegration.findFirst({
    where: {
      orgId,
      siteId
    },
    select: {
      siteId: true,
      ga4PropertyId: true,
      gscSiteUrl: true,
      googleEmail: true,
      connectedAt: true,
      googleRefreshToken: true
    }
  });
}
