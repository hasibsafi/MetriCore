import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hasAuthSessionCookie(req: NextRequest): boolean {
  const sessionCookieBases = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token"
  ];

  const allCookies = req.cookies.getAll();

  return allCookies.some((cookie) => {
    if (!cookie.value || cookie.value.length === 0) {
      return false;
    }

    return sessionCookieBases.some(
      (baseName) => cookie.name === baseName || cookie.name.startsWith(`${baseName}.`)
    );
  });
}

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const requiresAuth = pathname.startsWith("/org") || pathname.startsWith("/select-org");

  if (!requiresAuth) {
    return NextResponse.next();
  }

  if (!hasAuthSessionCookie(req)) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/org/:path*", "/select-org"]
};
