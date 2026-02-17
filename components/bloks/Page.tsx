import { storyblokEditable, StoryblokServerComponent } from "@storyblok/react/rsc";
import type { PageBlok } from "@/lib/types";

export default function Page({ blok }: { blok: PageBlok }) {
  return (
    <main {...storyblokEditable(blok)}>
      {blok.body?.map((nestedBlok) => (
        <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </main>
  );
}
