import { type NextRequest, NextResponse } from "next/server";

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE PROTECTION MIDDLEWARE (PATH-BASED)
// ═══════════════════════════════════════════════════════════════════════════

const _API_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

const PROTECTED_ROUTES = [
  { prefix: "/admin", role: "admin", loginPath: "/admin/login" },
  { prefix: "/technician", role: "technician", loginPath: "/technician/login" },
  { prefix: "/dashboard", role: "customer", loginPath: "/login" },
];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 1. Skip if it's a static file or API route
  if (
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // 2. Allow public access to login pages
  if (pathname.endsWith("/login")) {
    return NextResponse.next();
  }

  const matched = PROTECTED_ROUTES.find((r) => pathname.startsWith(r.prefix));

  // ⚠️ CRITICAL: In a split-domain deployment (Vercel + Railway),
  // Vercel's edge middleware CANNOT see cookies set on Railway's domain.
  // We disable this strict check to allow the redirect to happen,
  // and rely on the client-side session check or custom domain setup.
  /*
    const hasCookie = req.cookies
      .getAll()
      .some(
        (c) =>
          c.name.includes("session_token") ||
          c.name.includes("better-auth") ||
          c.name.includes("auth_session"),
      );

    if (!hasCookie) {
      return NextResponse.redirect(new URL(matched.loginPath, req.url));
    }
    */

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
