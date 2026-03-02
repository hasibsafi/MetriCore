import { MembershipRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgMember, requireOrgRole, requireSession } from "../../../../../../../../src/lib/auth-guards";
import {
  disconnectGoogleIntegrationForSite,
  getGoogleIntegration,
  updateGoogleIntegrationConfig
} from "../../../../../../../../src/services/google-integration-service";

const paramsSchema = z.object({
  orgId: z.string().trim().min(1, "orgId is required"),
  siteId: z.string().trim().min(1, "siteId is required")
});

type Props = {
  params: Promise<{ orgId: string; siteId: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  try {
    await requireSession();
    const parsedParams = paramsSchema.parse(await params);

    await requireOrgMember(parsedParams.orgId, { allowMetriCoreAdminRead: true });

    const integration = await getGoogleIntegration(parsedParams.orgId, parsedParams.siteId);
    return NextResponse.json(integration);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ message: firstIssue }, { status: 400 });
    }

    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ message: error.message }, { status: Number((error as { status: number }).status) });
    }

    return NextResponse.json({ message: "Unable to load Google integration status." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Props) {
  try {
    const user = await requireSession();
    const parsedParams = paramsSchema.parse(await params);

    await requireOrgRole(parsedParams.orgId, [MembershipRole.owner, MembershipRole.admin]);

    const payload = await request.json();
    const integration = await updateGoogleIntegrationConfig(user.id, parsedParams.orgId, parsedParams.siteId, payload);

    return NextResponse.json(integration);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ message: firstIssue }, { status: 400 });
    }

    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ message: error.message }, { status: Number((error as { status: number }).status) });
    }

    return NextResponse.json({ message: "Unable to update Google integration." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const user = await requireSession();
    const parsedParams = paramsSchema.parse(await params);

    await requireOrgRole(parsedParams.orgId, [MembershipRole.owner, MembershipRole.admin]);

    const result = await disconnectGoogleIntegrationForSite(user.id, parsedParams.orgId, parsedParams.siteId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ message: firstIssue }, { status: 400 });
    }

    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ message: error.message }, { status: Number((error as { status: number }).status) });
    }

    return NextResponse.json({ message: "Unable to disconnect Google integration." }, { status: 500 });
  }
}
