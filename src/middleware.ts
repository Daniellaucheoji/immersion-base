import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;
  const isPlayHost =
    host.startsWith("play.") || host.includes("play.enterimmersion");

  // play.enterimmersion.com → serve the kiosk at /
  if (isPlayHost) {
    if (
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/admin") ||
      pathname === "/favicon.ico" ||
      pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    if (pathname === "/" || pathname === "") {
      const url = request.nextUrl.clone();
      url.pathname = "/play";
      return NextResponse.rewrite(url);
    }

    if (!pathname.startsWith("/play")) {
      const url = request.nextUrl.clone();
      url.pathname = "/play";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
