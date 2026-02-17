import { NextRequest, NextResponse } from "next/server";
import { i18n } from "@/lib/i18n";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

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

  // Detect Storyblok visual editor — it loads pages without locale prefix
  // Use rewrite (not redirect) to preserve the iframe URL and bridge connection
  const isStoryblokEditor =
    searchParams.has("_storyblok") ||
    searchParams.has("_storyblok_tk[space_id]") ||
    searchParams.has("_storyblok_c");

  // Determine locale from Storyblok language param, cookie, or default
  const storyblokLang = searchParams.get("_storyblok_lang");
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale =
    (storyblokLang && i18n.locales.includes(storyblokLang as (typeof i18n.locales)[number])
      ? storyblokLang
      : null) ||
    (cookieLocale && i18n.locales.includes(cookieLocale as (typeof i18n.locales)[number])
      ? cookieLocale
      : null) ||
    i18n.defaultLocale;

  // Strip folder prefixes (e.g., /pages/services → /services) so URLs stay clean
  // This is needed because Storyblok stores stories in folders (pages/services)
  // but our Next.js routes use clean URLs (/en/services)
  const cleanPathname = pathname.replace(/^\/pages\//, "/");

  const localizedPath = `/${locale}${cleanPathname === "/" ? "" : cleanPathname}`;

  if (isStoryblokEditor) {
    // Rewrite: serve the locale route but keep the URL the same for the bridge
    const url = request.nextUrl.clone();
    url.pathname = localizedPath;
    return NextResponse.rewrite(url);
  }

  // Normal visitors: redirect to locale-prefixed URL (also strip folder prefix)
  if (cleanPathname !== pathname) {
    // If the URL had a folder prefix, redirect to the clean version
    return NextResponse.redirect(
      new URL(localizedPath, request.url)
    );
  }

  return NextResponse.redirect(
    new URL(localizedPath, request.url)
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
