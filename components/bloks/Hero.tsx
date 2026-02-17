import { storyblokEditable } from "@storyblok/react/rsc";
import Image from "next/image";
import Link from "next/link";
import type { HeroBlok, HeroButtonBlok } from "@/lib/types";

function resolveLink(link: HeroButtonBlok["link"]): string {
  if (!link) return "/";
  if (link.linktype === "story") {
    return `/${link.cached_url}`.replace(/\/+$/, "") || "/";
  }
  return link.cached_url || link.url || "/";
}

const sizeClasses = {
  large: "py-24 md:py-40",
  medium: "py-16 md:py-28",
  small: "py-12 md:py-20",
};

export default function Hero({ blok }: { blok: HeroBlok }) {
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
                href={resolveLink(btn.link)}
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
