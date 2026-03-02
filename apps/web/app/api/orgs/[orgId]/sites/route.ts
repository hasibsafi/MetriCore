import { createSiteBodySchema, PublicUrlValidationError } from "@metricore/shared";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { MembershipRole } from "@prisma/client";
import { requireOrgMember, requireOrgRole, requireSession } from "../../../../../src/lib/auth-guards";
import { parseOrgId } from "../../../../../src/lib/validators/org";
import { createSite, listSites } from "../../../../../src/services/site-service";

type Props = {
  params: Promise<{ orgId: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  try {
    const user = await requireSession();
    const { orgId } = await params;
    const parsedOrgId = parseOrgId(orgId);

    await requireOrgMember(parsedOrgId);

    const sites = await listSites(user.id, parsedOrgId);
    return NextResponse.json({ sites });
  } catch (error) {
    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ message: error.message }, { status: Number((error as { status: number }).status) });
    }

    return NextResponse.json({ message: "Unable to list sites." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Props) {
  try {
    const user = await requireSession();
    const { orgId } = await params;
    const parsedOrgId = parseOrgId(orgId);

    await requireOrgRole(parsedOrgId, [MembershipRole.owner, MembershipRole.admin]);

    const payload = await request.json();
    const parsed = createSiteBodySchema.parse(payload);

    const site = await createSite(user.id, parsedOrgId, parsed.url, parsed.displayName);
    return NextResponse.json(site, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0]?.message ?? "Invalid payload";
      return NextResponse.json({ message: firstIssue }, { status: 400 });
    }

    if (error instanceof PublicUrlValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ message: error.message }, { status: Number((error as { status: number }).status) });
    }

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ message: "A site with this URL already exists for this organization." }, { status: 409 });
    }

    return NextResponse.json({ message: "Unable to create site." }, { status: 500 });
  }
}
