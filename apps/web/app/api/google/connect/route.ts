import { MembershipRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgRole, requireSession } from "../../../../src/lib/auth-guards";
import { buildConnectGoogleUrl } from "../../../../src/services/google-oauth-service";

const connectQuerySchema = z.object({
  orgId: z.string().trim().min(1, "orgId is required"),
  siteId: z.string().trim().min(1, "siteId is required"),
  returnTo: z.string().trim().optional()
});

export async function GET(request: Request) {
  try {
    const user = await requireSession();
    const url = new URL(request.url);
    const parsed = connectQuerySchema.parse({
      orgId: url.searchParams.get("orgId"),
      siteId: url.searchParams.get("siteId"),
      returnTo: url.searchParams.get("returnTo") ?? undefined
    });

    await requireOrgRole(parsed.orgId, [MembershipRole.owner, MembershipRole.admin]);

    const destination = await buildConnectGoogleUrl({
      actorUserId: user.id,
      orgId: parsed.orgId,
      siteId: parsed.siteId,
      returnTo: parsed.returnTo
    });

    return NextResponse.redirect(destination);
  } catch (error) {
    console.error("Failed to start Google connection", error);
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ message: firstIssue }, { status: 400 });
    }

    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ message: error.message }, { status: Number((error as { status: number }).status) });
    }

    return NextResponse.json({ message: "Unable to start Google connection." }, { status: 500 });
  }
}
