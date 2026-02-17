"use client";

import { storyblokEditable } from "@storyblok/react";
import Link from "next/link";
import type { CallToActionBlok } from "@/lib/types";
import { useLocale } from "@/lib/locale-context";

function resolveLink(link: CallToActionBlok["button_link"], locale: string): string {
  if (!link) return `/${locale}`;
  let path: string;
  if (link.linktype === "story") {
    path = `/${link.cached_url}`.replace(/\/+$/, "") || "/";
  } else {
    path = link.cached_url || link.url || "/";
  }
  if (path.startsWith("/") && !path.startsWith("http")) {
    return `/${locale}${path === "/" ? "" : path}`;
  }
  return path;
}

export default function CallToAction({ blok }: { blok: CallToActionBlok }) {
  const locale = useLocale();

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
              href={resolveLink(blok.button_link, locale)}
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
