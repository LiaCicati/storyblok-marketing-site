import { storyblokEditable, StoryblokServerComponent } from "@storyblok/react/rsc";
import type { PricingTableBlok } from "@/lib/types";

export default function PricingTable({ blok }: { blok: PricingTableBlok }) {
  return (
    <section {...storyblokEditable(blok)} className="py-16 md:py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {blok.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {blok.title}
            </h2>
            {blok.subtitle && (
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{blok.subtitle}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 items-start">
          {blok.plans?.map((plan) => (
            <StoryblokServerComponent blok={plan} key={plan._uid} />
          ))}
        </div>
      </div>
    </section>
  );
}
