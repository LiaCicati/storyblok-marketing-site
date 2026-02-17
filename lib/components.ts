import Page from "@/components/bloks/Page";
import Hero from "@/components/bloks/Hero";
import FeatureGrid from "@/components/bloks/FeatureGrid";
import FeatureCard from "@/components/bloks/FeatureCard";
import TextWithImage from "@/components/bloks/TextWithImage";
import Testimonials from "@/components/bloks/Testimonials";
import TestimonialCard from "@/components/bloks/TestimonialCard";
import CallToAction from "@/components/bloks/CallToAction";
import PricingTable from "@/components/bloks/PricingTable";
import PricingCard from "@/components/bloks/PricingCard";
import ContactForm from "@/components/bloks/ContactForm";
import LogoCloud from "@/components/bloks/LogoCloud";
import FAQ from "@/components/bloks/FAQ";
import RichTextBlock from "@/components/bloks/RichTextBlock";
import BlogPost from "@/components/bloks/BlogPost";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const blokComponents: Record<string, React.ElementType<any>> = {
  page: Page,
  hero: Hero,
  feature_grid: FeatureGrid,
  feature_card: FeatureCard,
  text_with_image: TextWithImage,
  testimonials: Testimonials,
  testimonial_card: TestimonialCard,
  call_to_action: CallToAction,
  pricing_table: PricingTable,
  pricing_card: PricingCard,
  contact_form: ContactForm,
  logo_cloud: LogoCloud,
  faq: FAQ,
  rich_text_block: RichTextBlock,
  blog_post: BlogPost,
};
