import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { i18n } from "@/lib/i18n";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "/";
  const locale = searchParams.get("locale") || i18n.defaultLocale;

  const draft = await draftMode();
  draft.disable();

  // Prefix with locale if the slug doesn't already include one
  const path = slug.startsWith("/") ? slug : `/${slug}`;
  const hasLocale = i18n.locales.some(
    (loc) => path.startsWith(`/${loc}/`) || path === `/${loc}`
  );

  redirect(hasLocale ? path : `/${locale}${path === "/" ? "" : path}`);
}
