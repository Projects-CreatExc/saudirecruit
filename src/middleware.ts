import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/settings", "/applications"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for NextAuth session token cookie
  const token =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoggedIn = !!token;

  // Signed-in users are sent away from auth pages by the (auth) layout, which
  // checks the account is still active. Doing it here from the cookie alone
  // would loop forever for a deactivated user.

  // Redirect unauthenticated users to login
  if (
    !isLoggedIn &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
