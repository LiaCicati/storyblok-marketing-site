import type { Metadata } from "next";
import { Inter } from "next/font/google";
import StoryblokProvider from "@/components/StoryblokProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { fetchConfig } from "@/lib/storyblok";
import type { ConfigBlok } from "@/lib/types";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Storyblok Marketing Site",
    template: "%s | Storyblok Marketing Site",
  },
  description: "A modern marketing website built with Next.js and Storyblok CMS",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let config: ConfigBlok | null = null;

  try {
    const story = await fetchConfig();
    config = story?.content as ConfigBlok;
  } catch {
    // Config story might not exist yet
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <StoryblokProvider>
          <div className="flex min-h-screen flex-col">
            <Header
              siteName={config?.site_name || "Storyblok Site"}
              navLinks={config?.header_nav || []}
            />
            <div className="flex-1">{children}</div>
            <Footer
              siteName={config?.site_name || "Storyblok Site"}
              columns={config?.footer_columns || []}
              socialLinks={config?.social_links || []}
              copyrightText={config?.copyright_text || ""}
            />
          </div>
        </StoryblokProvider>
      </body>
    </html>
  );
}
