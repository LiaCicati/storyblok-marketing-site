import { storyblokEditable } from "@storyblok/react/rsc";
import Image from "next/image";
import type { TestimonialCardBlok } from "@/lib/types";

export default function TestimonialCard({ blok }: { blok: TestimonialCardBlok }) {
  return (
    <blockquote
      {...storyblokEditable(blok)}
      className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100"
    >
      <svg
        className="h-8 w-8 text-primary-300 mb-4"
        fill="currentColor"
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
      </svg>
      <p className="text-gray-700 leading-relaxed">{blok.quote}</p>
      <footer className="mt-6 flex items-center gap-4">
        {blok.avatar?.filename && (
          <Image
            src={blok.avatar.filename}
            alt={blok.author_name || ""}
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
        )}
        <div>
          <cite className="not-italic font-semibold text-gray-900">{blok.author_name}</cite>
          {blok.author_role && <p className="text-sm text-gray-500">{blok.author_role}</p>}
        </div>
      </footer>
    </blockquote>
  );
}
