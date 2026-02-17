"use client";

import { storyblokEditable } from "@storyblok/react";
import Link from "next/link";
import type { PricingCardBlok } from "@/lib/types";
import { useLocale } from "@/lib/locale-context";

function resolveLink(link: PricingCardBlok["button_link"], locale: string): string {
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

export default function PricingCard({ blok }: { blok: PricingCardBlok }) {
  const locale = useLocale();
  const features = blok.features
    ? blok.features.split("\n").filter((f) => f.trim())
    : [];

  return (
    <div
      {...storyblokEditable(blok)}
      className={`relative rounded-2xl bg-white p-8 shadow-sm border-2 transition-shadow hover:shadow-md ${
        blok.is_popular ? "border-primary-500 shadow-md" : "border-gray-200"
      }`}
    >
      {blok.is_popular && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-4 py-1 text-xs font-semibold text-white">
          {blok.popular_badge_text || "Most Popular"}
        </span>
      )}
      <h3 className="text-lg font-semibold text-gray-900">{blok.plan_name}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-gray-900">{blok.price}</span>
        {blok.period && <span className="text-gray-500">/{blok.period}</span>}
      </div>
      {features.length > 0 && (
        <ul className="mt-8 space-y-3" role="list">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <svg
                className="h-5 w-5 flex-shrink-0 text-primary-500 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      )}
      {blok.button_label && (
        <Link
          href={resolveLink(blok.button_link, locale)}
          className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
            blok.is_popular
              ? "bg-primary-600 text-white hover:bg-primary-500"
              : "bg-gray-100 text-gray-900 hover:bg-gray-200"
          }`}
        >
          {blok.button_label}
        </Link>
      )}
    </div>
  );
}
