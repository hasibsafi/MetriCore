import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { passwordResetRequestSchema } from "../../../../../src/lib/validators/auth";
import { requestPasswordReset } from "../../../../../src/services/password-reset-service";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = passwordResetRequestSchema.parse(payload);

    const requestUrl = new URL(request.url);
    const appUrl = process.env.APP_URL ?? requestUrl.origin;

    const result = await requestPasswordReset({
      email: parsed.email,
      appUrl
    });

    const responseBody: { message: string; resetUrl?: string } = {
      message: "If an account exists for that email, a reset link has been sent."
    };

    if (process.env.NODE_ENV !== "production" && result.resetUrl) {
      responseBody.resetUrl = result.resetUrl;
    }

    return NextResponse.json(responseBody);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0]?.message ?? "Please provide a valid email address.";
      return NextResponse.json({ message: firstIssue }, { status: 400 });
    }

    return NextResponse.json({ message: "Unable to request a reset link right now." }, { status: 500 });
  }
}
