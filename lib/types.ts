import type { SbBlokData } from "@storyblok/react/rsc";
import type { ISbRichtext } from "@storyblok/react/rsc";

export interface LinkBlok {
  id: string;
  url: string;
  linktype: string;
  fieldtype: string;
  cached_url: string;
}

export interface AssetBlok {
  id: number;
  alt: string;
  name: string;
  focus: string;
  title: string;
  filename: string;
  copyright: string;
  fieldtype: string;
}

export interface NavLinkBlok extends SbBlokData {
  label: string;
  link: LinkBlok;
  children?: NavLinkBlok[];
}

export interface ConfigBlok extends SbBlokData {
  component: "config";
  site_name: string;
  header_nav: NavLinkBlok[];
  header_cta_label: string;
  header_cta_link: LinkBlok;
  footer_tagline: string;
  footer_columns: FooterColumnBlok[];
  social_links: SocialLinkBlok[];
  copyright_text: string;
}

export interface FooterColumnBlok extends SbBlokData {
  title: string;
  links: NavLinkBlok[];
}

export interface SocialLinkBlok extends SbBlokData {
  platform: string;
  link: LinkBlok;
}

export interface PageBlok extends SbBlokData {
  component: "page";
  body: SbBlokData[];
  title: string;
  description: string;
}

export interface HeroBlok extends SbBlokData {
  component: "hero";
  headline: string;
  subheadline: string;
  background_image: AssetBlok;
  buttons: HeroButtonBlok[];
  size: "large" | "medium" | "small";
}

export interface HeroButtonBlok extends SbBlokData {
  label: string;
  link: LinkBlok;
  variant: "primary" | "secondary";
}

export interface FeatureGridBlok extends SbBlokData {
  component: "feature_grid";
  title: string;
  subtitle: string;
  features: FeatureCardBlok[];
}

export interface FeatureCardBlok extends SbBlokData {
  component: "feature_card";
  icon: string;
  title: string;
  description: string;
}

export interface TextWithImageBlok extends SbBlokData {
  component: "text_with_image";
  title: string;
  content: ISbRichtext;
  image: AssetBlok;
  image_position: "left" | "right";
}

export interface TestimonialsBlok extends SbBlokData {
  component: "testimonials";
  title: string;
  items: TestimonialCardBlok[];
}

export interface TestimonialCardBlok extends SbBlokData {
  component: "testimonial_card";
  quote: string;
  author_name: string;
  author_role: string;
  avatar: AssetBlok;
}

export interface CallToActionBlok extends SbBlokData {
  component: "call_to_action";
  headline: string;
  body: string;
  button_label: string;
  button_link: LinkBlok;
}

export interface PricingTableBlok extends SbBlokData {
  component: "pricing_table";
  title: string;
  subtitle: string;
  plans: PricingCardBlok[];
}

export interface PricingCardBlok extends SbBlokData {
  component: "pricing_card";
  plan_name: string;
  price: string;
  period: string;
  features: string;
  button_label: string;
  button_link: LinkBlok;
  is_popular: boolean;
  popular_badge_text: string;
}

export interface ContactFormBlok extends SbBlokData {
  component: "contact_form";
  title: string;
  subtitle: string;
  // Labels & placeholders come from the "form-labels" datasource
}

export interface LogoCloudBlok extends SbBlokData {
  component: "logo_cloud";
  title: string;
  logos: LogoItemBlok[];
}

export interface LogoItemBlok extends SbBlokData {
  component: "logo_item";
  name: string;
  logo: AssetBlok;
  link: LinkBlok;
}

export interface FAQBlok extends SbBlokData {
  component: "faq";
  title: string;
  subtitle: string;
  items: FAQItemBlok[];
}

export interface FAQItemBlok extends SbBlokData {
  component: "faq_item";
  question: string;
  answer: ISbRichtext;
}

export interface RichTextBlockBlok extends SbBlokData {
  component: "rich_text_block";
  content: ISbRichtext;
}

export interface BlogPostBlok extends SbBlokData {
  component: "blog_post";
  title: string;
  excerpt: string;
  featured_image: AssetBlok;
  content: ISbRichtext;
  author: string;
  published_date: string;
}
