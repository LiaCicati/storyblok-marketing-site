import StoryblokProvider from "@/components/StoryblokProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { fetchConfig } from "@/lib/storyblok";
import { i18n, isValidLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { ConfigBlok } from "@/lib/types";
import { LocaleProvider } from "@/lib/locale-context";
import { notFound } from "next/navigation";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  let config: ConfigBlok | null = null;
  try {
    const story = await fetchConfig(locale);
    config = story?.content as ConfigBlok;
  } catch {
    // Config story might not exist yet
  }

  return (
    <LocaleProvider locale={locale as Locale}>
      <StoryblokProvider>
        <div lang={locale} className="flex min-h-screen flex-col">
          <Header
            siteName={config?.site_name || "Storyblok Site"}
            navLinks={config?.header_nav || []}
            ctaLabel={config?.header_cta_label || ""}
            ctaLink={config?.header_cta_link}
            locale={locale}
          />
          <div className="flex-1">{children}</div>
          <Footer
            siteName={config?.site_name || "Storyblok Site"}
            tagline={config?.footer_tagline || ""}
            columns={config?.footer_columns || []}
            socialLinks={config?.social_links || []}
            copyrightText={config?.copyright_text || ""}
            locale={locale}
          />
        </div>
      </StoryblokProvider>
    </LocaleProvider>
  );
}
