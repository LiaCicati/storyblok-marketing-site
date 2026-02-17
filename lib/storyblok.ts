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

export async function fetchStory(slug: string, params?: Record<string, unknown>) {
  const storyblokApi = getStoryblokApi();
  const { data } = await storyblokApi.get(`cdn/stories/${slug}`, {
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

export async function fetchConfig(locale?: Locale) {
  const language = locale ? toStoryblokLanguage(locale) : undefined;
  const params: Record<string, unknown> = {};
  if (language) {
    params.language = language;
  }
  return fetchStory("config", params);
}
