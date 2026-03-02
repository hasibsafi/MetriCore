import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { passwordResetConfirmSchema } from "../../../../../src/lib/validators/auth";
import { resetPasswordWithToken } from "../../../../../src/services/password-reset-service";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = passwordResetConfirmSchema.parse(payload);

    const result = await resetPasswordWithToken({
      token: parsed.token,
      password: parsed.password
    });

    if (!result.ok) {
      return NextResponse.json({ message: "Reset link is invalid or expired." }, { status: 400 });
    }

    return NextResponse.json({ message: "Password reset successful." });
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0]?.message ?? "Please check the form and try again.";
      return NextResponse.json({ message: firstIssue }, { status: 400 });
    }

    return NextResponse.json({ message: "Unable to reset password right now." }, { status: 500 });
  }
}
