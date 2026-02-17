"use client";

import { storyblokEditable } from "@storyblok/react";
import Image from "next/image";
import Link from "next/link";
import type { HeroBlok, HeroButtonBlok } from "@/lib/types";
import { useLocale } from "@/lib/locale-context";

function resolveLink(link: HeroButtonBlok["link"], locale: string): string {
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

const sizeClasses = {
  large: "py-24 md:py-40",
  medium: "py-16 md:py-28",
  small: "py-12 md:py-20",
};

export default function Hero({ blok }: { blok: HeroBlok }) {
  const locale = useLocale();
  const size = blok.size || "large";

  return (
    <section
      {...storyblokEditable(blok)}
      className={`relative overflow-hidden bg-gray-900 ${sizeClasses[size]}`}
    >
      {blok.background_image?.filename && (
        <Image
          src={blok.background_image.filename}
          alt={blok.background_image.alt || ""}
          fill
          className="object-cover opacity-30"
          priority
          sizes="100vw"
        />
      )}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {blok.headline}
        </h1>
        {blok.subheadline && (
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300 sm:text-xl">
            {blok.subheadline}
          </p>
        )}
        {blok.buttons && blok.buttons.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {blok.buttons.map((btn) => (
              <Link
                key={btn._uid}
                href={resolveLink(btn.link, locale)}
                className={
                  btn.variant === "secondary"
                    ? "rounded-lg border-2 border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white hover:text-gray-900 transition-colors"
                    : "rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primary-500 transition-colors"
                }
              >
                {btn.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
