"use client";

import { useState } from "react";
import { storyblokEditable } from "@storyblok/react";
import { render } from "storyblok-rich-text-react-renderer";
import type { FAQBlok, FAQItemBlok } from "@/lib/types";

function FAQItem({ item }: { item: FAQItemBlok }) {
  const [open, setOpen] = useState(false);

  return (
    <div {...storyblokEditable(item)} className="border-b border-gray-200">
      <button
        type="button"
        className="flex w-full items-center justify-between py-5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-base font-medium text-gray-900">{item.question}</span>
        <svg
          className={`h-5 w-5 flex-shrink-0 text-gray-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
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
          open ? "max-h-96 pb-5" : "max-h-0"
        }`}
      >
        <div className="prose prose-sm text-gray-600">{render(item.answer)}</div>
      </div>
    </div>
  );
}

export default function FAQ({ blok }: { blok: FAQBlok }) {
  return (
    <section {...storyblokEditable(blok)} className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {blok.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {blok.title}
            </h2>
            {blok.subtitle && (
              <p className="mt-4 text-lg text-gray-600">{blok.subtitle}</p>
            )}
          </div>
        )}
        <div className="divide-y divide-gray-200 border-t border-gray-200">
          {blok.items?.map((item) => (
            <FAQItem key={item._uid} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
