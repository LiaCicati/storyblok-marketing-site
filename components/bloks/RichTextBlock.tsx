import { storyblokEditable } from "@storyblok/react/rsc";
import { render } from "storyblok-rich-text-react-renderer";
import type { RichTextBlockBlok } from "@/lib/types";

export default function RichTextBlock({ blok }: { blok: RichTextBlockBlok }) {
  return (
    <section {...storyblokEditable(blok)} className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">{render(blok.content)}</div>
      </div>
    </section>
  );
}
