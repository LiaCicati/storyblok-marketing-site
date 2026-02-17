import { storyblokEditable } from "@storyblok/react/rsc";
import Link from "next/link";
import type { CallToActionBlok } from "@/lib/types";

function resolveLink(link: CallToActionBlok["button_link"]): string {
  if (!link) return "/";
  if (link.linktype === "story") {
    return `/${link.cached_url}`.replace(/\/+$/, "") || "/";
  }
  return link.cached_url || link.url || "/";
}

export default function CallToAction({ blok }: { blok: CallToActionBlok }) {
  return (
    <section {...storyblokEditable(blok)} className="py-16 md:py-24 bg-primary-600">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {blok.headline}
        </h2>
        {blok.body && <p className="mt-4 text-lg text-primary-100">{blok.body}</p>}
        {blok.button_label && (
          <div className="mt-8">
            <Link
              href={resolveLink(blok.button_link)}
              className="inline-block rounded-lg bg-white px-8 py-3 text-sm font-semibold text-primary-600 shadow-lg hover:bg-gray-100 transition-colors"
            >
              {blok.button_label}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
