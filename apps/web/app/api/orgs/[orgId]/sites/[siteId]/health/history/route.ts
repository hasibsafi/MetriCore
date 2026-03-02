import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgMember, requireSession } from "../../../../../../../../src/lib/auth-guards";
import { getHealthHistory } from "../../../../../../../../src/services/analytics-visualization-service";

const paramsSchema = z.object({
  orgId: z.string().trim().min(1, "orgId is required"),
  siteId: z.string().trim().min(1, "siteId is required")
});

const querySchema = z.object({
  range: z.enum(["7d", "30d", "90d"]).optional()
});

type Props = {
  params: Promise<{ orgId: string; siteId: string }>;
};

export async function GET(request: Request, { params }: Props) {
  try {
    await requireSession();
    const parsedParams = paramsSchema.parse(await params);
    const parsedQuery = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams.entries()));

    await requireOrgMember(parsedParams.orgId);

    const result = await getHealthHistory(parsedParams.orgId, parsedParams.siteId, parsedQuery.range ?? null);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ message: firstIssue }, { status: 400 });
    }

    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ message: error.message }, { status: Number((error as { status: number }).status) });
    }

    return NextResponse.json({ message: "Unable to fetch health history." }, { status: 500 });
  }
}
