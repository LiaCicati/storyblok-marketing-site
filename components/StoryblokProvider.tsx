"use client";

import { storyblokInit, apiPlugin } from "@storyblok/react";
import type { ReactNode } from "react";
import { blokComponents } from "@/lib/components";

storyblokInit({
  accessToken: process.env.NEXT_PUBLIC_STORYBLOK_API_TOKEN,
  use: [apiPlugin],
  components: blokComponents,
  enableFallbackComponent: true,
});

export default function StoryblokProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
