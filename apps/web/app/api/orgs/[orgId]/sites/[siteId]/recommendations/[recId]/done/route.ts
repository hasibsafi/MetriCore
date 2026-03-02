import { MembershipRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgRole, requireSession } from "../../../../../../../../../src/lib/auth-guards";
import {
  markRecommendationDoneById,
  RecommendationNotFoundError,
  RecommendationSiteNotFoundError
} from "../../../../../../../../../src/services/recommendation-service";

const paramsSchema = z.object({
  orgId: z.string().min(1),
  siteId: z.string().min(1),
  recId: z.string().min(1)
});

export async function POST(_request: Request, context: { params: Promise<{ orgId: string; siteId: string; recId: string }> }) {
  try {
    const user = await requireSession();
    const parsedParams = paramsSchema.parse(await context.params);

    await requireOrgRole(parsedParams.orgId, [MembershipRole.owner, MembershipRole.admin, MembershipRole.member]);

    const result = await markRecommendationDoneById({
      actorUserId: user.id,
      orgId: parsedParams.orgId,
      siteId: parsedParams.siteId,
      recId: parsedParams.recId
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ message: firstIssue }, { status: 400 });
    }

    if (error instanceof RecommendationSiteNotFoundError || error instanceof RecommendationNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ message: error.message }, { status: Number((error as { status: number }).status) });
    }

    return NextResponse.json({ message: "Unable to mark recommendation done." }, { status: 500 });
  }
}
