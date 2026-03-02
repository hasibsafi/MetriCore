import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgMember, requireSession } from "../../../../src/lib/auth-guards";
import { getJobStatus } from "../../../../src/services/job-service";

const scanRunIdSchema = z.string().trim().min(1, "scanRunId is required");

type Props = {
  params: Promise<{ scanRunId: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  try {
    await requireSession();

    const { scanRunId } = await params;
    const parsedScanRunId = scanRunIdSchema.parse(scanRunId);

    const run = await getJobStatus(parsedScanRunId);
    if (!run) {
      return NextResponse.json({ message: "Scan run not found." }, { status: 404 });
    }

    await requireOrgMember(run.orgId, { allowMetriCoreAdminRead: true });

    return NextResponse.json({
      scanRunId: run.id,
      orgId: run.orgId,
      siteId: run.siteId,
      type: run.type,
      status: run.status,
      queuedAt: run.queuedAt,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      error: run.error
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]?.message ?? "Invalid scanRunId";
      return NextResponse.json({ message: firstIssue }, { status: 400 });
    }

    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ message: error.message }, { status: Number((error as { status: number }).status) });
    }

    return NextResponse.json({ message: "Unable to fetch job status." }, { status: 500 });
  }
}
