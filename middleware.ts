import { NextRequest, NextResponse } from "next/server";
import { i18n } from "@/lib/i18n";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals, API routes, draft mode routes, and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/draft") ||
    pathname.startsWith("/disable-draft") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if the pathname already has a locale prefix
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // Store the current locale in a cookie for blok components
    const currentLocale = pathname.split("/")[1];
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", currentLocale);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.cookies.set("NEXT_LOCALE", currentLocale, { path: "/" });
    return response;
  }

  // No locale prefix — use cookie if available, otherwise default locale
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale =
    cookieLocale && i18n.locales.includes(cookieLocale as (typeof i18n.locales)[number])
      ? cookieLocale
      : i18n.defaultLocale;

  return NextResponse.redirect(
    new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url)
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
