import { StoryblokStory } from "@storyblok/react/rsc";
import { fetchStory, fetchStories } from "@/lib/storyblok";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const stories = await fetchStories({
    content_type: "page",
    excluding_fields: "body",
  });

  return stories.map((story: { full_slug: string }) => ({
    slug: story.full_slug === "home" ? [] : story.full_slug.split("/"),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolvedSlug = slug?.join("/") || "home";

  try {
    const story = await fetchStory(resolvedSlug);
    return {
      title: story?.content?.title || story?.name,
      description: story?.content?.description || "",
    };
  } catch {
    return { title: "Page Not Found" };
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const resolvedSlug = slug?.join("/") || "home";

  let story;
  try {
    story = await fetchStory(resolvedSlug);
  } catch {
    notFound();
  }

  if (!story) notFound();

  return <StoryblokStory story={story} />;
}
