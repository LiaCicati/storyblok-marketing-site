import { apiPlugin, storyblokInit, setComponents } from "@storyblok/react/rsc";
import { blokComponents } from "./components";
import type { Locale } from "./i18n";
import { toStoryblokLanguage } from "./i18n";

// Register components for server-side rendering
setComponents(blokComponents);

export const getStoryblokApi = storyblokInit({
  accessToken: process.env.STORYBLOK_API_TOKEN,
  use: [apiPlugin],
  apiOptions: {
    region: "eu",
  },
});

/**
 * Resolves a URL slug to a Storyblok story slug.
 * Stories may live in folders (e.g., "pages/services") but the frontend
 * URL only shows "services". This function tries the direct slug first,
 * then falls back to the "pages/" folder prefix.
 */
async function resolveAndFetchStory(slug: string, params?: Record<string, unknown>) {
  const storyblokApi = getStoryblokApi();

  // Try direct slug first (works for root stories like "home", "config")
  try {
    const { data } = await storyblokApi.get(`cdn/stories/${slug}`, {
      version: "draft",
      ...params,
    });
    if (data?.story) return data.story;
  } catch {
    // Not found at root level — try folder
  }

  // Try with pages/ prefix (for stories organized in folders)
  if (!slug.startsWith("pages/")) {
    try {
      const { data } = await storyblokApi.get(`cdn/stories/pages/${slug}`, {
        version: "draft",
        ...params,
      });
      if (data?.story) return data.story;
    } catch {
      // Not found in folder either
    }
  }

  return null;
}

export async function fetchStory(slug: string, params?: Record<string, unknown>) {
  const story = await resolveAndFetchStory(slug, params);
  if (!story) {
    throw new Error(`Story not found: ${slug}`);
  }
  return story;
}

export async function fetchStories(params?: Record<string, unknown>) {
  const storyblokApi = getStoryblokApi();
  const { data } = await storyblokApi.get("cdn/stories", {
    version: "draft",
    ...params,
  });
  return data?.stories ?? [];
}

/**
 * Strips folder prefixes from a Storyblok full_slug to get the frontend URL slug.
 * e.g., "pages/services" → "services", "home" → "home"
 */
export function toUrlSlug(fullSlug: string): string {
  return fullSlug.replace(/^pages\//, "");
}

export async function fetchConfig(locale?: Locale) {
  const language = locale ? toStoryblokLanguage(locale) : undefined;
  const params: Record<string, unknown> = {};
  if (language) {
    params.language = language;
  }
  return fetchStory("config", params);
}
