import { storyblokEditable } from "@storyblok/react/rsc";
import Image from "next/image";
import type { LogoCloudBlok } from "@/lib/types";

export default function LogoCloud({ blok }: { blok: LogoCloudBlok }) {
  return (
    <section {...storyblokEditable(blok)} className="py-12 md:py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {blok.title && (
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-gray-500 mb-8">
            {blok.title}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
          {blok.logos?.map((logoItem) => (
            <div key={logoItem._uid} className="flex items-center justify-center">
              {logoItem.logo?.filename ? (
                <Image
                  src={logoItem.logo.filename}
                  alt={logoItem.name || logoItem.logo.alt || "Partner logo"}
                  width={160}
                  height={48}
                  className="h-10 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-200"
                />
              ) : (
                <span className="text-lg font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                  {logoItem.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
