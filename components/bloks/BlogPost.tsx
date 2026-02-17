import { storyblokEditable } from "@storyblok/react/rsc";
import { render } from "storyblok-rich-text-react-renderer";
import Image from "next/image";
import type { BlogPostBlok } from "@/lib/types";

export default function BlogPost({ blok }: { blok: BlogPostBlok }) {
  return (
    <article {...storyblokEditable(blok)} className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {blok.featured_image?.filename && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl mb-8">
            <Image
              src={blok.featured_image.filename}
              alt={blok.featured_image.alt || blok.title || ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {blok.title}
        </h1>
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          {blok.author && <span>By {blok.author}</span>}
          {blok.published_date && (
            <time dateTime={blok.published_date}>
              {new Date(blok.published_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
        </div>
        <div className="mt-8 prose prose-lg max-w-none">{render(blok.content)}</div>
      </div>
    </article>
  );
}
