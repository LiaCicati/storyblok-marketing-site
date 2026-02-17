import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { i18n } from "@/lib/i18n";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "/";
  const secret = searchParams.get("secret");
  const locale = searchParams.get("locale") || i18n.defaultLocale;

  // Optional: validate with a secret token
  if (secret && secret !== process.env.STORYBLOK_PREVIEW_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  // Prefix with locale if the slug doesn't already include one
  const path = slug.startsWith("/") ? slug : `/${slug}`;
  const hasLocale = i18n.locales.some(
    (loc) => path.startsWith(`/${loc}/`) || path === `/${loc}`
  );

  redirect(hasLocale ? path : `/${locale}${path === "/" ? "" : path}`);
}
