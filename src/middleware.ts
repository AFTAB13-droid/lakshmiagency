import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// In-memory rate limiting map for Edge Middleware
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Extract client IP (Vercel, proxy or local fallback)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const now = Date.now();

  let decodedSearch = "";
  try {
    decodedSearch = decodeURIComponent(search).toLowerCase();
  } catch {
    decodedSearch = search.toLowerCase();
  }

  // =========================================================================
  // 1. Defend against common injection scanner patterns in URL
  // =========================================================================
  if (
    decodedSearch.includes("$where") ||
    decodedSearch.includes("$ne") ||
    decodedSearch.includes("<script") ||
    decodedSearch.includes("javascript:") ||
    decodedSearch.includes("../") ||
    decodedSearch.includes("etc/passwd")
  ) {
    return new NextResponse(
      JSON.stringify({ error: "Malicious payload detected and blocked by security firewall" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // =========================================================================
  // 2. Global Rate Limiting for /api routes
  // =========================================================================
  if (pathname.startsWith("/api")) {
    let limit = 80; // general API limit per minute
    let windowMs = 60 * 1000;

    if (
      pathname.startsWith("/api/auth/register") ||
      pathname.startsWith("/api/auth/forgot-password") ||
      pathname.startsWith("/api/auth/callback")
    ) {
      limit = 20; // 20 requests/minute for sensitive auth
    } else if (pathname.startsWith("/api/webhooks")) {
      limit = 45; // 45 webhook requests/minute
    }

    const rateKey = `${ip}:${pathname.startsWith("/api/auth") ? "auth" : "api"}`;
    const entry = ipRequestCounts.get(rateKey);

    if (!entry || now > entry.resetAt) {
      ipRequestCounts.set(rateKey, { count: 1, resetAt: now + windowMs });
    } else {
      entry.count += 1;
      if (entry.count > limit) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        return new NextResponse(
          JSON.stringify({
            error: "Too Many Requests. High-frequency request protection triggered.",
            retryAfterSeconds: retryAfter,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(retryAfter),
            },
          }
        );
      }
    }
  }

  // =========================================================================
  // 3. Protected Routes Authentication & Role-Based Access Control (RBAC)
  // =========================================================================
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const userRole = (token?.role as string) || null;

  // Protect Admin Workspace (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== "ADMIN") {
      // Redirect to authorized role dashboard
      const dest = userRole === "PREMIUM_USER" ? "/mediator" : "/buyer";
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  // Protect Mediator Workspace (/mediator/*)
  if (pathname.startsWith("/mediator")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== "PREMIUM_USER" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/buyer", request.url));
    }
  }

  // Protect Buyer Workspace (/buyer/*)
  if (pathname.startsWith("/buyer")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Internal Admin APIs (/api/admin/*)
  if (pathname.startsWith("/api/admin")) {
    if (!token || userRole !== "ADMIN") {
      return new NextResponse(
        JSON.stringify({ error: "Access Denied: Master Administrator credentials required" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Protect Internal Mediator APIs (/api/mediator/*)
  if (pathname.startsWith("/api/mediator")) {
    if (!token || (userRole !== "PREMIUM_USER" && userRole !== "ADMIN")) {
      return new NextResponse(
        JSON.stringify({ error: "Access Denied: Premium Agent credentials required" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Redirect already-logged-in users from /login or /signup directly to their dashboard
  if (pathname === "/login" || pathname === "/signup") {
    if (token) {
      let dest = "/buyer";
      if (userRole === "ADMIN") dest = "/admin";
      else if (userRole === "PREMIUM_USER") dest = "/mediator";
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  // =========================================================================
  // 4. Security Headers for all responses
  // =========================================================================
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, images, favicon
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.jpg|.*\\.png$).*)",
  ],
};
