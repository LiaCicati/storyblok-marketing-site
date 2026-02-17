"use client";

import { useState } from "react";
import Link from "next/link";
import type { NavLinkBlok, LinkBlok } from "@/lib/types";

function resolveLink(link: NavLinkBlok["link"] | LinkBlok | undefined): string {
  if (!link) return "/";
  if (link.linktype === "story") {
    return `/${link.cached_url}`.replace(/\/+$/, "") || "/";
  }
  return link.cached_url || link.url || "/";
}

interface HeaderProps {
  siteName: string;
  navLinks: NavLinkBlok[];
  ctaLabel?: string;
  ctaLink?: LinkBlok;
}

export default function Header({ siteName, navLinks, ctaLabel, ctaLink }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary-600">
            {siteName || "Storyblok Site"}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navLinks?.map((item) => (
              <Link
                key={item._uid}
                href={resolveLink(item.link)}
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {ctaLabel && (
              <Link
                href={resolveLink(ctaLink)}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 transition-colors"
              >
                {ctaLabel}
              </Link>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="border-t border-gray-100 bg-white px-4 py-4 space-y-2" aria-label="Mobile navigation">
          {navLinks?.map((item) => (
            <Link
              key={item._uid}
              href={resolveLink(item.link)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {ctaLabel && (
            <Link
              href={resolveLink(ctaLink)}
              className="block rounded-lg bg-primary-600 px-3 py-2 text-center text-base font-semibold text-white hover:bg-primary-500 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {ctaLabel}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
