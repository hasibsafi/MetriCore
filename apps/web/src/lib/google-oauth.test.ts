import { beforeEach, describe, expect, it } from "vitest";
import { buildGoogleOauthState, sanitizeReturnTo, verifyGoogleOauthState } from "./google-oauth";

const STATE_SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe("google oauth state", () => {
  beforeEach(() => {
    process.env.GOOGLE_INTEGRATION_CLIENT_ID = "client-id";
    process.env.GOOGLE_INTEGRATION_CLIENT_SECRET = "client-secret";
    process.env.APP_URL = "http://localhost:3000";
    process.env.GOOGLE_OAUTH_STATE_SECRET = STATE_SECRET;
  });

  it("builds and verifies a signed state", () => {
    const state = buildGoogleOauthState({
      orgId: "org-1",
      siteId: "site-1",
      userId: "user-1",
      returnTo: "/org/org-1/settings"
    });

    const parsed = verifyGoogleOauthState(state);

    expect(parsed.orgId).toBe("org-1");
    expect(parsed.siteId).toBe("site-1");
    expect(parsed.userId).toBe("user-1");
    expect(parsed.returnTo).toBe("/org/org-1/settings");
    expect(parsed.nonce.length).toBeGreaterThan(0);
  });

  it("rejects tampered state", () => {
    const state = buildGoogleOauthState({
      orgId: "org-1",
      siteId: "site-1",
      userId: "user-1",
      returnTo: "/org/org-1/settings"
    });

    const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as {
      payload: { orgId: string; siteId: string; userId: string; returnTo: string; nonce: string };
      sig: string;
    };

    decoded.payload.orgId = "org-2";
    const tampered = Buffer.from(JSON.stringify(decoded)).toString("base64url");

    expect(() => verifyGoogleOauthState(tampered)).toThrow();
  });

  it("sanitizes returnTo", () => {
    expect(sanitizeReturnTo("/org/org-1/settings", "org-1", "site-1")).toBe("/org/org-1/settings");
    expect(sanitizeReturnTo("https://evil.example", "org-1", "site-1")).toBe("/org/org-1/sites/site-1/analytics");
  });
});
