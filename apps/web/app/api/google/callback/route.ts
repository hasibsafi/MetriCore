import { MembershipRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgRole, requireSession } from "../../../../src/lib/auth-guards";
import { sanitizeReturnTo, verifyGoogleOauthState } from "../../../../src/lib/google-oauth";
import { finalizeGoogleCallback } from "../../../../src/services/google-oauth-service";

const callbackQuerySchema = z.object({
  code: z.string().trim().optional(),
  state: z.string().trim().optional(),
  error: z.string().trim().optional()
});

function buildRedirect(requestUrl: string, path: string, errorCode?: string) {
  const url = new URL(path, requestUrl);
  if (errorCode) {
    url.searchParams.set("googleError", errorCode);
  }

  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  let safeReturnTo = "/select-org";

  try {
    const user = await requireSession();
    const requestUrl = new URL(request.url);
    const parsed = callbackQuerySchema.parse({
      code: requestUrl.searchParams.get("code") ?? undefined,
      state: requestUrl.searchParams.get("state") ?? undefined,
      error: requestUrl.searchParams.get("error") ?? undefined
    });

    if (!parsed.state) {
      return buildRedirect(request.url, "/select-org", "invalid_state");
    }

    const state = verifyGoogleOauthState(parsed.state);
    safeReturnTo = sanitizeReturnTo(state.returnTo, state.orgId, state.siteId);

    if (state.userId !== user.id) {
      return buildRedirect(request.url, safeReturnTo, "state_user_mismatch");
    }

    await requireOrgRole(state.orgId, [MembershipRole.owner, MembershipRole.admin]);

    if (parsed.error) {
      return buildRedirect(request.url, safeReturnTo, "google_denied");
    }

    if (!parsed.code) {
      return buildRedirect(request.url, safeReturnTo, "missing_code");
    }

    await finalizeGoogleCallback({
      actorUserId: user.id,
      orgId: state.orgId,
      siteId: state.siteId,
      code: parsed.code
    });

    return buildRedirect(request.url, safeReturnTo);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown callback error";
    console.error("[google-callback]", message);

    let errorCode = "callback_failed";

    if (message.includes("refresh token")) {
      errorCode = "missing_refresh_token";
    } else if (message.includes("fetch failed") || message.includes("timed out") || message.includes("aborted")) {
      errorCode = "google_network_error";
    } else if (message.includes("Invalid OAuth state") || message.includes("signature")) {
      errorCode = "invalid_state";
    } else if (message.includes("permission") || message.includes("Forbidden")) {
      errorCode = "forbidden";
    }

    return buildRedirect(request.url, safeReturnTo, errorCode);
  }
}
