import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createPasswordUser } from "../../../../src/services/auth-service";
import { signUpSchema } from "../../../../src/lib/validators/auth";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = signUpSchema.parse(payload);

    const result = await createPasswordUser({
      email: parsed.email,
      password: parsed.password
    });

    if (!result.ok && result.reason === "email_exists") {
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
    }

    return NextResponse.json({ message: "Account created successfully." }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0]?.message ?? "Please fill in all required fields.";
      return NextResponse.json({ message: firstIssue }, { status: 400 });
    }

    return NextResponse.json({ message: "Unable to create account right now. Please try again." }, { status: 500 });
  }
}
