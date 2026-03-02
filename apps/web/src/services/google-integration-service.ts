import { encryptAes256Gcm, integrationUpdateBodySchema, validateEncryptionKey } from "@metricore/shared";
import { createAuditLog } from "../repositories/audit-log-repository";
import {
  disconnectGoogleConnection,
  getGoogleIntegrationStatus,
  getIntegrationWithSecret,
  updateGoogleConnection,
  upsertIntegrations
} from "../repositories/site-integrations-repository";
import { getOrgSiteById } from "../repositories/site-repository";

export class GoogleIntegrationSiteNotFoundError extends Error {
  readonly status = 404;

  constructor() {
    super("Site not found.");
    this.name = "GoogleIntegrationSiteNotFoundError";
  }
}

function getEncryptionKey(): string {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error("ENCRYPTION_KEY is required");
  }

  validateEncryptionKey(encryptionKey);
  return encryptionKey;
}

async function ensureSite(orgId: string, siteId: string) {
  const site = await getOrgSiteById(orgId, siteId);
  if (!site) {
    throw new GoogleIntegrationSiteNotFoundError();
  }

  return site;
}

export async function getGoogleIntegration(orgId: string, siteId: string) {
  await ensureSite(orgId, siteId);

  const integration = await getGoogleIntegrationStatus(orgId, siteId);

  return {
    connected: Boolean(integration?.googleRefreshToken),
    googleEmail: integration?.googleEmail ?? null,
    connectedAt: integration?.connectedAt ?? null,
    ga4PropertyId: integration?.ga4PropertyId ?? null,
    gscSiteUrl: integration?.gscSiteUrl ?? null
  };
}

export async function updateGoogleIntegrationConfig(
  actorUserId: string,
  orgId: string,
  siteId: string,
  payload: unknown
) {
  await ensureSite(orgId, siteId);

  const parsed = integrationUpdateBodySchema.parse(payload);

  const integration = await upsertIntegrations(orgId, siteId, {
    ga4PropertyId: parsed.ga4PropertyId,
    gscSiteUrl: parsed.gscSiteUrl
  });

  await createAuditLog({
    orgId,
    actorUserId,
    action: "google.integration_updated",
    entityType: "site",
    entityId: siteId,
    metadataJson: {
      ga4PropertyId: parsed.ga4PropertyId,
      gscSiteUrl: parsed.gscSiteUrl
    }
  });

  return {
    connected: Boolean(integration.connectedAt),
    googleEmail: integration.googleEmail,
    connectedAt: integration.connectedAt,
    ga4PropertyId: integration.ga4PropertyId,
    gscSiteUrl: integration.gscSiteUrl
  };
}

export async function completeGoogleConnection(input: {
  actorUserId: string;
  orgId: string;
  siteId: string;
  refreshToken: string;
  tokenExpiresAt: Date | null;
  googleEmail: string | null;
}) {
  await ensureSite(input.orgId, input.siteId);

  const encryptionKey = getEncryptionKey();
  const encryptedRefreshToken = encryptAes256Gcm(input.refreshToken, encryptionKey);

  await updateGoogleConnection(input.orgId, input.siteId, {
    encryptedRefreshToken,
    tokenExpiresAt: input.tokenExpiresAt,
    googleEmail: input.googleEmail
  });

  await createAuditLog({
    orgId: input.orgId,
    actorUserId: input.actorUserId,
    action: "google.connected",
    entityType: "site",
    entityId: input.siteId,
    metadataJson: {
      googleEmail: input.googleEmail
    }
  });
}

export async function disconnectGoogleIntegrationForSite(actorUserId: string, orgId: string, siteId: string) {
  await ensureSite(orgId, siteId);

  await disconnectGoogleConnection(orgId, siteId);

  await createAuditLog({
    orgId,
    actorUserId,
    action: "google.disconnected",
    entityType: "site",
    entityId: siteId
  });

  return { success: true };
}

export async function assertSnapshotIntegrationsReady(orgId: string, siteId: string, kind: "ga4" | "gsc") {
  const integration = await getIntegrationWithSecret(orgId, siteId);

  if (!integration?.googleRefreshToken) {
    throw Object.assign(new Error("Google is not connected for this site."), { status: 400 });
  }

  if (kind === "ga4" && !integration.ga4PropertyId) {
    throw Object.assign(new Error("GA4 property ID is not configured."), { status: 400 });
  }

  if (kind === "gsc" && !integration.gscSiteUrl) {
    throw Object.assign(new Error("GSC site URL is not configured."), { status: 400 });
  }
}
