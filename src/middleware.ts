import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

/**
 * Constant-time string comparison for the Edge Runtime.
 * The Node.js crypto.timingSafeEqual is not available in Edge,
 * so we implement the same XOR-and-accumulate pattern here:
 * always iterates the full length so timing doesn't reveal
 * which byte position differs.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function middleware(request: NextRequest) {
  // 1. Password protect the /admin route
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const envUser = process.env.ADMIN_USER;
    const envPass = process.env.ADMIN_PASSWORD;

    // Fail closed: if env vars aren't set, deny everything
    if (!envUser || !envPass) {
      console.error(
        "Admin auth: ADMIN_USER or ADMIN_PASSWORD is not set. Denying all /admin requests."
      );
      return new NextResponse("Authentication required", { status: 401 });
    }

    const authHeader = request.headers.get("authorization");

    if (authHeader) {
      const authValue = authHeader.split(" ")[1];
      let decoded: string;
      try {
        decoded = atob(authValue);
      } catch {
        return new NextResponse("Authentication required", {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
        });
      }
      const colonIdx = decoded.indexOf(":");
      if (colonIdx === -1) {
        return new NextResponse("Authentication required", {
          status: 401,
          headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
        });
      }
      const user = decoded.slice(0, colonIdx);
      const pwd = decoded.slice(colonIdx + 1);

      if (timingSafeEqual(user, envUser) && timingSafeEqual(pwd, envPass)) {
        return await updateSession(request);
      }
    }

    // Trigger native browser login prompt
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  // 2. Supabase session update for all other routes
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
