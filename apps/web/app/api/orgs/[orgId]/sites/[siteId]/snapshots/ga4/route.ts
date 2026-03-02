import { MembershipRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgRole, requireSession } from "../../../../../../../../src/lib/auth-guards";
import { RateLimitError } from "../../../../../../../../src/services/rate-limit-service";
import { enqueueGa4Snapshot } from "../../../../../../../../src/services/snapshot-service";

const paramsSchema = z.object({
  orgId: z.string().trim().min(1, "orgId is required"),
  siteId: z.string().trim().min(1, "siteId is required")
});

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

type Props = {
  params: Promise<{ orgId: string; siteId: string }>;
};

export async function POST(request: Request, { params }: Props) {
  try {
    const user = await requireSession();
    const parsedParams = paramsSchema.parse(await params);

    await requireOrgRole(parsedParams.orgId, [MembershipRole.owner, MembershipRole.admin, MembershipRole.member]);

    const result = await enqueueGa4Snapshot({
      actorUserId: user.id,
      orgId: parsedParams.orgId,
      siteId: parsedParams.siteId,
      ipAddress: getClientIp(request)
    });

    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    console.error("Failed to trigger GA4 snapshot", error);
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ message: firstIssue }, { status: 400 });
    }

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { message: error.message },
        {
          status: 429,
          headers: {
            "Retry-After": String(error.retryAfterSeconds)
          }
        }
      );
    }

    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ message: error.message }, { status: Number((error as { status: number }).status) });
    }

    return NextResponse.json({ message: "Unable to trigger GA4 snapshot." }, { status: 500 });
  }
}
