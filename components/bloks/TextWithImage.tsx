import { storyblokEditable } from "@storyblok/react/rsc";
import { render } from "storyblok-rich-text-react-renderer";
import Image from "next/image";
import type { TextWithImageBlok } from "@/lib/types";

export default function TextWithImage({ blok }: { blok: TextWithImageBlok }) {
  const imageLeft = blok.image_position === "left";

  return (
    <section {...storyblokEditable(blok)} className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
            imageLeft ? "lg:flex-row-reverse" : ""
          }`}
        >
          <div className={imageLeft ? "lg:order-2" : "lg:order-1"}>
            {blok.title && (
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {blok.title}
              </h2>
            )}
            <div className="mt-6 prose prose-lg text-gray-600 max-w-none">
              {render(blok.content)}
            </div>
          </div>
          <div className={imageLeft ? "lg:order-1" : "lg:order-2"}>
            {blok.image?.filename && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src={blok.image.filename}
                  alt={blok.image.alt || blok.title || ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
