import { MembershipRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgRole, requireSession } from "../../../../../../src/lib/auth-guards";
import { deleteSite } from "../../../../../../src/services/site-service";

const paramsSchema = z.object({
  orgId: z.string().trim().min(1, "orgId is required"),
  siteId: z.string().trim().min(1, "siteId is required")
});

type Props = {
  params: Promise<{ orgId: string; siteId: string }>;
};

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const user = await requireSession();
    const parsed = paramsSchema.parse(await params);

    await requireOrgRole(parsed.orgId, [MembershipRole.owner, MembershipRole.admin]);

    const deleted = await deleteSite(user.id, parsed.orgId, parsed.siteId);
    return NextResponse.json(deleted);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ message: firstIssue }, { status: 400 });
    }

    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ message: error.message }, { status: Number((error as { status: number }).status) });
    }

    return NextResponse.json({ message: "Unable to delete site." }, { status: 500 });
  }
}
