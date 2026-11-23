import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_COOKIE_NAME, GATE_HEADER } from "@/lib/admin-gate";

function notFound(req: NextRequest) {
  return NextResponse.rewrite(new URL("/_tidak-ditemukan", req.url));
}

// Dashboard hanya bisa dibuka lewat /<ADMIN_PATH>. /admin dan /api/admin
// tampil sebagai 404 bagi siapa pun yang tidak tahu path rahasianya.
export function middleware(req: NextRequest) {
  const secret = process.env.ADMIN_PATH?.replace(/^\/+|\/+$/g, "");
  const { pathname } = req.nextUrl;

  if (secret && (pathname === `/${secret}` || pathname === `/${secret}/`)) {
    const res = NextResponse.rewrite(new URL("/admin", req.url));
    res.headers.set("Referrer-Policy", "no-referrer");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  if (pathname.startsWith("/admin")) return notFound(req);

  if (pathname.startsWith("/api/admin")) {
    const gateOk = !!secret && req.headers.get(GATE_HEADER) === secret;
    const hasCookie = req.cookies.has(ADMIN_COOKIE_NAME);
    if (!gateOk && !hasCookie) return notFound(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|favicon|icon|.*\\.[a-z0-9]+$).*)"],
};
