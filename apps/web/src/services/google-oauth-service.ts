import {
  buildGoogleAuthorizationUrl,
  buildGoogleOauthState,
  exchangeGoogleAuthCode,
  fetchGoogleUserEmail,
  sanitizeReturnTo
} from "../lib/google-oauth";
import { completeGoogleConnection, GoogleIntegrationSiteNotFoundError } from "./google-integration-service";
import { getOrgSiteById } from "../repositories/site-repository";

export class GoogleCallbackError extends Error {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = "GoogleCallbackError";
  }
}

async function ensureSite(orgId: string, siteId: string) {
  const site = await getOrgSiteById(orgId, siteId);
  if (!site) {
    throw new GoogleIntegrationSiteNotFoundError();
  }

  return site;
}

export async function buildConnectGoogleUrl(input: {
  actorUserId: string;
  orgId: string;
  siteId: string;
  returnTo?: string | null;
}) {
  await ensureSite(input.orgId, input.siteId);

  const safeReturnTo = sanitizeReturnTo(input.returnTo, input.orgId, input.siteId);
  const state = buildGoogleOauthState({
    orgId: input.orgId,
    siteId: input.siteId,
    userId: input.actorUserId,
    returnTo: safeReturnTo
  });

  return buildGoogleAuthorizationUrl(state);
}

export async function finalizeGoogleCallback(input: {
  actorUserId: string;
  orgId: string;
  siteId: string;
  code: string;
}) {
  const tokens = await exchangeGoogleAuthCode(input.code);

  if (!tokens.refresh_token) {
    throw new GoogleCallbackError("Google did not return a refresh token. Please reconnect and approve consent.");
  }

  const email = await fetchGoogleUserEmail(tokens.access_token);
  const tokenExpiresAt = Number.isFinite(tokens.expires_in)
    ? new Date(Date.now() + Math.max(0, tokens.expires_in) * 1000)
    : null;

  await completeGoogleConnection({
    actorUserId: input.actorUserId,
    orgId: input.orgId,
    siteId: input.siteId,
    refreshToken: tokens.refresh_token,
    tokenExpiresAt,
    googleEmail: email
  });
}
