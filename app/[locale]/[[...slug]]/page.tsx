import { StoryblokStory } from "@storyblok/react/rsc";
import { fetchStory, fetchStories, toUrlSlug } from "@/lib/storyblok";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { i18n, isValidLocale, toStoryblokLanguage } from "@/lib/i18n";

interface PageProps {
  params: Promise<{ locale: string; slug?: string[] }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const stories = await fetchStories({
    content_type: "page",
    excluding_fields: "body",
  });

  const params: { locale: string; slug: string[] }[] = [];

  for (const locale of i18n.locales) {
    for (const story of stories) {
      // Strip folder prefix so URLs stay clean (pages/services → services)
      const urlSlug = toUrlSlug(story.full_slug);
      params.push({
        locale,
        slug: urlSlug === "home" ? [] : urlSlug.split("/"),
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const resolvedSlug = slug?.join("/") || "home";

  if (!isValidLocale(locale)) {
    return { title: "Page Not Found" };
  }

  try {
    const language = toStoryblokLanguage(locale);
    const story = await fetchStory(resolvedSlug, language ? { language } : {});

    // Build hreflang alternates
    const languages: Record<string, string> = {};
    for (const loc of i18n.locales) {
      const path = resolvedSlug === "home" ? "" : `/${resolvedSlug}`;
      languages[loc] = `/${loc}${path}`;
    }

    return {
      title: story?.content?.title || story?.name,
      description: story?.content?.description || "",
      alternates: {
        languages,
      },
    };
  } catch {
    return { title: "Page Not Found" };
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const resolvedSlug = slug?.join("/") || "home";

  if (!isValidLocale(locale)) {
    notFound();
  }

  const language = toStoryblokLanguage(locale);

  let story;
  try {
    story = await fetchStory(resolvedSlug, language ? { language } : {});
  } catch {
    notFound();
  }

  if (!story) notFound();

  return <StoryblokStory story={story} />;
}
