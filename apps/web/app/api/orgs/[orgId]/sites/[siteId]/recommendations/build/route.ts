import { MembershipRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgRole, requireSession } from "../../../../../../../../src/lib/auth-guards";
import { enqueueRecommendationsBuild, RecommendationSiteNotFoundError } from "../../../../../../../../src/services/recommendation-service";
import { RateLimitError } from "../../../../../../../../src/services/rate-limit-service";

const paramsSchema = z.object({
  orgId: z.string().min(1),
  siteId: z.string().min(1)
});

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request, context: { params: Promise<{ orgId: string; siteId: string }> }) {
  try {
    const user = await requireSession();
    const parsed = paramsSchema.parse(await context.params);

    await requireOrgRole(parsed.orgId, [MembershipRole.owner, MembershipRole.admin, MembershipRole.member]);

    const result = await enqueueRecommendationsBuild({
      actorUserId: user.id,
      orgId: parsed.orgId,
      siteId: parsed.siteId,
      ipAddress: getClientIp(request)
    });

    return NextResponse.json(result, { status: 202 });
  } catch (error) {
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

    if (error instanceof RecommendationSiteNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ message: error.message }, { status: Number((error as { status: number }).status) });
    }

    return NextResponse.json({ message: "Unable to trigger recommendations build." }, { status: 500 });
  }
}
