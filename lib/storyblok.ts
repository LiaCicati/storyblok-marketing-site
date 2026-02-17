import { apiPlugin, storyblokInit, setComponents } from "@storyblok/react/rsc";
import { blokComponents } from "./components";

// Register components for server-side rendering
setComponents(blokComponents);

export const getStoryblokApi = storyblokInit({
  accessToken: process.env.STORYBLOK_API_TOKEN,
  use: [apiPlugin],
  apiOptions: {
    region: "eu",
  },
});

export async function fetchStory(slug: string, params?: Record<string, string>) {
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

export async function fetchConfig() {
  return fetchStory("config");
}
