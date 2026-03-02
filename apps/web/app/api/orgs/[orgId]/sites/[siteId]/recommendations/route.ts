import { MembershipRole, RecommendationPriority, RecommendationStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgMember, requireSession } from "../../../../../../../src/lib/auth-guards";
import { getRecommendations, RecommendationSiteNotFoundError } from "../../../../../../../src/services/recommendation-service";

const paramsSchema = z.object({
  orgId: z.string().min(1),
  siteId: z.string().min(1)
});

const querySchema = z.object({
  status: z.nativeEnum(RecommendationStatus).optional(),
  priority: z.nativeEnum(RecommendationPriority).optional()
});

export async function GET(request: Request, context: { params: Promise<{ orgId: string; siteId: string }> }) {
  try {
    await requireSession();
    const parsedParams = paramsSchema.parse(await context.params);
    const membershipContext = await requireOrgMember(parsedParams.orgId, { allowMetriCoreAdminRead: true });

    const url = new URL(request.url);
    const parsedQuery = querySchema.parse({
      status: url.searchParams.get("status") ?? undefined,
      priority: url.searchParams.get("priority") ?? undefined
    });

    const result = await getRecommendations(parsedParams.orgId, parsedParams.siteId, {
      status: parsedQuery.status,
      priority: parsedQuery.priority
    });

    return NextResponse.json({
      canWrite: membershipContext.membership ? membershipContext.membership.role !== MembershipRole.viewer : false,
      ...result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ message: firstIssue }, { status: 400 });
    }

    if (error instanceof RecommendationSiteNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ message: error.message }, { status: Number((error as { status: number }).status) });
    }

    return NextResponse.json({ message: "Unable to fetch recommendations." }, { status: 500 });
  }
}
