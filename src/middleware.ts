import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate only: sends visitors without a session cookie to /login.
 * Real authentication and authorization happen on the server in
 * src/lib/auth.ts (pages, route handlers and, later, file downloads).
 */
export function middleware(req: NextRequest) {
  const has = req.cookies.has("som_session");
  if (has) return NextResponse.next();
  const { pathname, search } = req.nextUrl;
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/student/:path*", "/staff/:path*", "/api/me", "/api/student/:path*", "/api/staff/:path*"] };
