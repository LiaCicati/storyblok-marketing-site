import { storyblokEditable, StoryblokServerComponent } from "@storyblok/react/rsc";
import type { TestimonialsBlok } from "@/lib/types";

export default function Testimonials({ blok }: { blok: TestimonialsBlok }) {
  return (
    <section {...storyblokEditable(blok)} className="py-16 md:py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {blok.title && (
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-12">
            {blok.title}
          </h2>
        )}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blok.items?.map((item) => (
            <StoryblokServerComponent blok={item} key={item._uid} />
          ))}
        </div>
      </div>
    </section>
  );
}
