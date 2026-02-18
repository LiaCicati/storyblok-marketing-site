import StoryblokProvider from "@/components/StoryblokProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { fetchConfig, fetchFormLabels } from "@/lib/storyblok";
import { i18n, isValidLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { ConfigBlok } from "@/lib/types";
import { LocaleProvider } from "@/lib/locale-context";
import { FormLabelsProvider } from "@/lib/form-labels-context";
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
  let formLabels: Record<string, string> = {};
  try {
    const [story, labels] = await Promise.all([
      fetchConfig(locale),
      fetchFormLabels(locale as Locale),
    ]);
    config = story?.content as ConfigBlok;
    formLabels = labels;
  } catch {
    // Config story or datasource might not exist yet
  }

  return (
    <LocaleProvider locale={locale as Locale}>
      <FormLabelsProvider labels={formLabels}>
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
      </FormLabelsProvider>
    </LocaleProvider>
  );
}
