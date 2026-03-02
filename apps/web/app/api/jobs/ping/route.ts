import { NextResponse } from "next/server";
import { requireSession } from "../../../../src/lib/auth-guards";
import { enqueuePingForUser } from "../../../../src/services/job-service";

export async function POST() {
  try {
    const user = await requireSession();
    const result = await enqueuePingForUser(user.id);
    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    if (error instanceof Error && "status" in error) {
      return NextResponse.json({ message: error.message }, { status: Number((error as { status: number }).status) });
    }

    return NextResponse.json({ message: "Unable to enqueue ping job." }, { status: 500 });
  }
}
