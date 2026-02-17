"use client";

import { storyblokInit, apiPlugin } from "@storyblok/react";
import type { ReactNode } from "react";
import { blokComponents } from "@/lib/components";

const isVisualEditor =
  typeof window !== "undefined" &&
  window.self !== window.top &&
  window.location.search.includes("_storyblok");

storyblokInit({
  accessToken: process.env.NEXT_PUBLIC_STORYBLOK_API_TOKEN,
  use: [apiPlugin],
  components: blokComponents,
  enableFallbackComponent: true,
  bridge: isVisualEditor,
  apiOptions: {
    region: "eu",
  },
});

export default function StoryblokProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
