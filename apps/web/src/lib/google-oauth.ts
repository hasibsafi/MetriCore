import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";

type GoogleOauthConfig = {
  clientId: string;
  clientSecret: string;
  appUrl: string;
  stateSecret: string;
};

export type GoogleOauthStatePayload = {
  orgId: string;
  siteId: string;
  userId: string;
  returnTo: string;
  nonce: string;
};

type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
  scope?: string;
};

const GOOGLE_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly"
] as const;

export function getGoogleOauthConfig(): GoogleOauthConfig {
  const clientId = process.env.GOOGLE_INTEGRATION_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_INTEGRATION_CLIENT_SECRET;
  const appUrl = process.env.APP_URL;
  const stateSecret = process.env.GOOGLE_OAUTH_STATE_SECRET;

  if (!clientId) {
    throw new Error("GOOGLE_INTEGRATION_CLIENT_ID is required");
  }
  if (!clientSecret) {
    throw new Error("GOOGLE_INTEGRATION_CLIENT_SECRET is required");
  }
  if (!appUrl) {
    throw new Error("APP_URL is required");
  }
  if (!stateSecret || !/^[0-9a-fA-F]{64,}$/.test(stateSecret)) {
    throw new Error("GOOGLE_OAUTH_STATE_SECRET must be a hex string with at least 64 characters");
  }

  return {
    clientId,
    clientSecret,
    appUrl,
    stateSecret
  };
}

export function buildGoogleOauthState(input: Omit<GoogleOauthStatePayload, "nonce">): string {
  const statePayload: GoogleOauthStatePayload = {
    ...input,
    nonce: randomUUID()
  };

  const config = getGoogleOauthConfig();
  const payloadText = JSON.stringify(statePayload);
  const sig = createHmac("sha256", Buffer.from(config.stateSecret, "hex")).update(payloadText).digest("hex");

  return Buffer.from(
    JSON.stringify({
      payload: statePayload,
      sig
    })
  ).toString("base64url");
}

export function verifyGoogleOauthState(encodedState: string): GoogleOauthStatePayload {
  const config = getGoogleOauthConfig();

  let parsed: { payload: GoogleOauthStatePayload; sig: string };
  try {
    const decoded = Buffer.from(encodedState, "base64url").toString("utf8");
    parsed = JSON.parse(decoded) as { payload: GoogleOauthStatePayload; sig: string };
  } catch {
    throw new Error("Invalid OAuth state");
  }

  if (!parsed?.payload || !parsed?.sig) {
    throw new Error("Invalid OAuth state");
  }

  const payloadText = JSON.stringify(parsed.payload);
  const expectedSig = createHmac("sha256", Buffer.from(config.stateSecret, "hex")).update(payloadText).digest("hex");

  const expectedBuffer = Buffer.from(expectedSig, "hex");
  const actualBuffer = Buffer.from(parsed.sig, "hex");

  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    throw new Error("Invalid OAuth state signature");
  }

  return parsed.payload;
}

export function sanitizeReturnTo(returnTo: string | null | undefined, fallbackOrgId: string, fallbackSiteId: string): string {
  const fallback = `/org/${fallbackOrgId}/sites/${fallbackSiteId}/analytics`;

  if (!returnTo) {
    return fallback;
  }

  const trimmed = returnTo.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  return trimmed;
}

export function buildGoogleAuthorizationUrl(state: string): string {
  const config = getGoogleOauthConfig();
  const redirectUri = `${config.appUrl}/api/google/callback`;
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleAuthCode(code: string): Promise<GoogleTokenResponse> {
  const config = getGoogleOauthConfig();
  const redirectUri = `${config.appUrl}/api/google/callback`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });

  const body = (await response.json()) as Partial<GoogleTokenResponse> & { error?: string; error_description?: string };

  if (!response.ok || !body.access_token) {
    throw new Error(body.error_description ?? body.error ?? "Google token exchange failed");
  }

  return {
    access_token: body.access_token,
    expires_in: Number(body.expires_in ?? 3600),
    refresh_token: body.refresh_token,
    token_type: body.token_type ?? "Bearer",
    scope: body.scope
  };
}

export async function fetchGoogleUserEmail(accessToken: string): Promise<string | null> {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as { email?: string };
  return body.email ?? null;
}
