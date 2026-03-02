import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "../../../../src/lib/auth.config";

export async function GET() {
  const cookieStore = await cookies();
  const allCookieNames = cookieStore.getAll().map((item) => item.name);
  const session = await auth();

  return NextResponse.json({
    hasSession: Boolean(session?.user?.id),
    user: session?.user
      ? {
          id: session.user.id,
          email: session.user.email ?? null,
          isMetriCoreAdmin: Boolean(session.user.isMetriCoreAdmin)
        }
      : null,
    cookieNames: allCookieNames
  });
}
