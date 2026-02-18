import { apiPlugin, storyblokInit, setComponents } from "@storyblok/react/rsc";
import { blokComponents } from "./components";
import type { Locale } from "./i18n";
import { i18n, toStoryblokLanguage } from "./i18n";

// Register components for server-side rendering
setComponents(blokComponents);

export const getStoryblokApi = storyblokInit({
  accessToken: process.env.STORYBLOK_API_TOKEN,
  use: [apiPlugin],
  apiOptions: {
    region: "eu",
  },
});

/** Root-level slugs that are NOT inside the pages/ folder */
const ROOT_SLUGS = new Set(["home", "config"]);

export async function fetchStory(slug: string, params?: Record<string, unknown>) {
  const storyblokApi = getStoryblokApi();

  // Determine the Storyblok path: root-level stories keep their slug,
  // everything else lives in the pages/ folder
  const storyblokSlug =
    slug.startsWith("pages/") || ROOT_SLUGS.has(slug) ? slug : `pages/${slug}`;

  const { data } = await storyblokApi.get(`cdn/stories/${storyblokSlug}`, {
    version: "draft",
    ...params,
  });
  return data?.story;
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

/**
 * Fetches datasource entries by slug.
 * When a dimension (e.g. "ro") is provided, each entry includes
 * a `dimension_value` with the translated string.
 * Returns a Map<name, value> for easy lookups.
 */
export async function fetchDatasource(
  slug: string,
  dimension?: string
): Promise<Map<string, string>> {
  const storyblokApi = getStoryblokApi();
  const params: Record<string, unknown> = {
    datasource: slug,
    per_page: 500,
    version: "draft",
  };
  if (dimension) {
    params.dimension = dimension;
  }

  const { data } = await storyblokApi.get("cdn/datasource_entries", params);
  const entries = data?.datasource_entries ?? [];

  const map = new Map<string, string>();
  for (const entry of entries) {
    // If a dimension is requested and the entry has a dimension_value, use it
    const value = dimension && entry.dimension_value ? entry.dimension_value : entry.value;
    map.set(entry.name, value);
  }
  return map;
}

/**
 * Fetches the form-labels datasource as a plain object (serializable for React context).
 */
export async function fetchFormLabels(locale?: Locale): Promise<Record<string, string>> {
  const dimension = locale && locale !== i18n.defaultLocale ? locale : undefined;
  const map = await fetchDatasource("form-labels", dimension);
  return Object.fromEntries(map);
}

export async function fetchConfig(locale?: Locale) {
  const language = locale ? toStoryblokLanguage(locale) : undefined;
  const params: Record<string, unknown> = {};
  if (language) {
    params.language = language;
  }
  return fetchStory("config", params);
}
