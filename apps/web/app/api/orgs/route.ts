import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireSession } from "../../../src/lib/auth-guards";
import { createOrgBodySchema } from "@metricore/shared";
import { createOrg, listOrgs } from "../../../src/services/org-service";

export async function POST(request: Request) {
  try {
    const user = await requireSession();
    const payload = await request.json();
    const parsed = createOrgBodySchema.parse(payload);

    const org = await createOrg(user.id, parsed.name);

    return NextResponse.json(org, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0]?.message ?? "Invalid payload";
      return NextResponse.json({ message: firstIssue }, { status: 400 });
    }

    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ message: error.message }, { status: Number((error as { status: number }).status) });
    }

    return NextResponse.json({ message: "Unable to create organization." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireSession();
    const orgs = await listOrgs(user.id);
    return NextResponse.json({ orgs });
  } catch (error) {
    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ message: error.message }, { status: Number((error as { status: number }).status) });
    }

    return NextResponse.json({ message: "Unable to list organizations." }, { status: 500 });
  }
}
