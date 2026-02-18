"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLinkBlok, LinkBlok } from "@/lib/types";
import { i18n, localeNames } from "@/lib/i18n";

function resolveLink(link: NavLinkBlok["link"] | LinkBlok | undefined, locale: string): string {
  if (!link) return `/${locale}`;
  let path: string;
  if (link.linktype === "story") {
    path = `/${link.cached_url}`.replace(/\/+$/, "") || "/";
  } else {
    path = link.cached_url || link.url || "/";
  }
  // Only prefix internal links
  if (path.startsWith("/") && !path.startsWith("http")) {
    return `/${locale}${path === "/" ? "" : path}`;
  }
  return path;
}

function hasChildren(item: NavLinkBlok): boolean {
  return Array.isArray(item.children) && item.children.length > 0;
}

// --- Desktop dropdown for nav items with children ---
function DesktopNavItem({ item, locale }: { item: NavLinkBlok; locale: string }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!hasChildren(item)) {
    return (
      <Link
        href={resolveLink(item.link, locale)}
        className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
      >
        {item.label}
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown panel */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 top-full pt-2 transition-all duration-200 ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="w-56 rounded-xl bg-white shadow-lg ring-1 ring-gray-900/5 p-2">
          {/* Optional: parent link at top */}
          <Link
            href={resolveLink(item.link, locale)}
            className="block rounded-lg px-3 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
            onClick={() => setOpen(false)}
          >
            All {item.label}
          </Link>
          <div className="my-1 h-px bg-gray-100" />
          {item.children!.map((child) => (
            <Link
              key={child._uid}
              href={resolveLink(child.link, locale)}
              className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
              onClick={() => setOpen(false)}
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Mobile nav item with expandable children ---
function MobileNavItem({
  item,
  locale,
  onClose,
}: {
  item: NavLinkBlok;
  locale: string;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!hasChildren(item)) {
    return (
      <Link
        href={resolveLink(item.link, locale)}
        className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
        onClick={onClose}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        {item.label}
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-4 space-y-1 pb-2">
          <Link
            href={resolveLink(item.link, locale)}
            className="block rounded-lg px-3 py-1.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
            onClick={onClose}
          >
            All {item.label}
          </Link>
          {item.children!.map((child) => (
            <Link
              key={child._uid}
              href={resolveLink(child.link, locale)}
              className="block rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-colors"
              onClick={onClose}
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();

  // Strip current locale prefix from pathname
  const pathnameWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  return (
    <div className="flex items-center gap-1 text-sm">
      {i18n.locales.map((loc) => (
        <Link
          key={loc}
          href={`/${loc}${pathnameWithoutLocale === "/" ? "" : pathnameWithoutLocale}`}
          className={`px-2 py-1 rounded transition-colors ${
            loc === locale
              ? "bg-primary-100 text-primary-700 font-semibold"
              : "text-gray-500 hover:text-gray-700"
          }`}
          aria-label={`Switch to ${loc === "en" ? "English" : "Română"}`}
          aria-current={loc === locale ? "true" : undefined}
        >
          {localeNames[loc]}
        </Link>
      ))}
    </div>
  );
}

interface HeaderProps {
  siteName: string;
  navLinks: NavLinkBlok[];
  ctaLabel?: string;
  ctaLink?: LinkBlok;
  locale: string;
}

export default function Header({ siteName, navLinks, ctaLabel, ctaLink, locale }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={`/${locale}`} className="text-xl font-bold text-primary-600">
            {siteName || "Storyblok Site"}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navLinks?.map((item) => (
              <DesktopNavItem key={item._uid} item={item} locale={locale} />
            ))}
            <LanguageSwitcher locale={locale} />
            {ctaLabel && (
              <Link
                href={resolveLink(ctaLink, locale)}
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
          mobileOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="border-t border-gray-100 bg-white px-4 py-4 space-y-1" aria-label="Mobile navigation">
          {navLinks?.map((item) => (
            <MobileNavItem
              key={item._uid}
              item={item}
              locale={locale}
              onClose={() => setMobileOpen(false)}
            />
          ))}
          {ctaLabel && (
            <Link
              href={resolveLink(ctaLink, locale)}
              className="block rounded-lg bg-primary-600 px-3 py-2 text-center text-base font-semibold text-white hover:bg-primary-500 transition-colors mt-2"
              onClick={() => setMobileOpen(false)}
            >
              {ctaLabel}
            </Link>
          )}
          <div className="flex justify-center pt-2">
            <LanguageSwitcher locale={locale} />
          </div>
        </nav>
      </div>
    </header>
  );
}
