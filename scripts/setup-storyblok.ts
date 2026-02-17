/**
 * Storyblok Setup Script
 *
 * Creates all component blueprints (bloks) and seed content in your Storyblok space.
 *
 * Usage:
 *   1. Set STORYBLOK_PERSONAL_TOKEN and STORYBLOK_SPACE_ID in your .env
 *   2. Run: npm run setup-storyblok
 */

import "dotenv/config";

const PERSONAL_TOKEN = process.env.STORYBLOK_PERSONAL_TOKEN;
const SPACE_ID = process.env.STORYBLOK_SPACE_ID;
const BASE_URL = `https://mapi.storyblok.com/v1/spaces/${SPACE_ID}`;

if (!PERSONAL_TOKEN || !SPACE_ID) {
  console.error("Missing STORYBLOK_PERSONAL_TOKEN or STORYBLOK_SPACE_ID in .env");
  process.exit(1);
}

const headers = {
  Authorization: PERSONAL_TOKEN,
  "Content-Type": "application/json",
};

// ---------- Helpers ----------

async function api(path: string, method: string = "GET", body?: unknown) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} failed (${res.status}): ${text}`);
  }

  return res.json();
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Rate-limit-aware wrapper
async function apiSafe(path: string, method: string = "GET", body?: unknown) {
  try {
    return await api(path, method, body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("429")) {
      console.log("  Rate limited, waiting 1s...");
      await sleep(1000);
      return api(path, method, body);
    }
    throw err;
  }
}

// ---------- Component Definitions ----------

interface ComponentField {
  type: string;
  pos?: number;
  display_name?: string;
  keys?: string[];
  restrict_type?: string;
  restrict_components?: boolean;
  component_whitelist?: string[];
  options?: { name: string; value: string }[];
  default_value?: string | boolean;
  maximum?: number;
  required?: boolean;
  description?: string;
  [key: string]: unknown;
}

interface ComponentDef {
  name: string;
  display_name: string;
  is_root?: boolean;
  is_nestable?: boolean;
  schema: Record<string, ComponentField>;
}

const components: ComponentDef[] = [
  // --- Nav Link (nestable) ---
  {
    name: "nav_link",
    display_name: "Nav Link",
    is_nestable: true,
    schema: {
      label: { type: "text", pos: 0, display_name: "Label", required: true },
      link: { type: "multilink", pos: 1, display_name: "Link" },
    },
  },
  // --- Footer Column (nestable) ---
  {
    name: "footer_column",
    display_name: "Footer Column",
    is_nestable: true,
    schema: {
      title: { type: "text", pos: 0, display_name: "Title" },
      links: {
        type: "bloks",
        pos: 1,
        display_name: "Links",
        restrict_type: "groups",
        restrict_components: true,
        component_whitelist: ["nav_link"],
      },
    },
  },
  // --- Social Link (nestable) ---
  {
    name: "social_link",
    display_name: "Social Link",
    is_nestable: true,
    schema: {
      platform: {
        type: "option",
        pos: 0,
        display_name: "Platform",
        options: [
          { name: "Twitter", value: "twitter" },
          { name: "LinkedIn", value: "linkedin" },
          { name: "GitHub", value: "github" },
        ],
      },
      link: { type: "multilink", pos: 1, display_name: "Link" },
    },
  },
  // --- Config (root, singleton) ---
  {
    name: "config",
    display_name: "Config",
    is_root: true,
    schema: {
      site_name: { type: "text", pos: 0, display_name: "Site Name", default_value: "Storyblok Site" },
      header_nav: {
        type: "bloks",
        pos: 1,
        display_name: "Header Navigation",
        restrict_type: "groups",
        restrict_components: true,
        component_whitelist: ["nav_link"],
      },
      footer_columns: {
        type: "bloks",
        pos: 2,
        display_name: "Footer Columns",
        restrict_type: "groups",
        restrict_components: true,
        component_whitelist: ["footer_column"],
      },
      social_links: {
        type: "bloks",
        pos: 3,
        display_name: "Social Links",
        restrict_type: "groups",
        restrict_components: true,
        component_whitelist: ["social_link"],
      },
      footer_tagline: { type: "text", pos: 4, display_name: "Footer Tagline" },
      copyright_text: { type: "text", pos: 5, display_name: "Copyright Text" },
    },
  },
  // --- Hero Button (nestable) ---
  {
    name: "hero_button",
    display_name: "Hero Button",
    is_nestable: true,
    schema: {
      label: { type: "text", pos: 0, display_name: "Label", required: true },
      link: { type: "multilink", pos: 1, display_name: "Link" },
      variant: {
        type: "option",
        pos: 2,
        display_name: "Variant",
        options: [
          { name: "Primary", value: "primary" },
          { name: "Secondary", value: "secondary" },
        ],
        default_value: "primary",
      },
    },
  },
  // --- Hero ---
  {
    name: "hero",
    display_name: "Hero",
    is_nestable: true,
    schema: {
      headline: { type: "text", pos: 0, display_name: "Headline", required: true },
      subheadline: { type: "text", pos: 1, display_name: "Subheadline" },
      background_image: { type: "asset", pos: 2, display_name: "Background Image", filetypes: ["images"] },
      buttons: {
        type: "bloks",
        pos: 3,
        display_name: "Buttons",
        restrict_type: "groups",
        restrict_components: true,
        component_whitelist: ["hero_button"],
      },
      size: {
        type: "option",
        pos: 4,
        display_name: "Size",
        options: [
          { name: "Large", value: "large" },
          { name: "Medium", value: "medium" },
          { name: "Small", value: "small" },
        ],
        default_value: "large",
      },
    },
  },
  // --- Feature Card (nestable) ---
  {
    name: "feature_card",
    display_name: "Feature Card",
    is_nestable: true,
    schema: {
      icon: {
        type: "option",
        pos: 0,
        display_name: "Icon",
        options: [
          { name: "Rocket", value: "rocket" },
          { name: "Shield", value: "shield" },
          { name: "Chart", value: "chart" },
          { name: "Globe", value: "globe" },
          { name: "Lightning", value: "lightning" },
          { name: "Heart", value: "heart" },
          { name: "Star", value: "star" },
          { name: "Gear", value: "gear" },
          { name: "Users", value: "users" },
          { name: "Lock", value: "lock" },
          { name: "Code", value: "code" },
          { name: "Cloud", value: "cloud" },
        ],
      },
      title: { type: "text", pos: 1, display_name: "Title", required: true },
      description: { type: "textarea", pos: 2, display_name: "Description" },
    },
  },
  // --- Feature Grid ---
  {
    name: "feature_grid",
    display_name: "Feature Grid",
    is_nestable: true,
    schema: {
      title: { type: "text", pos: 0, display_name: "Title" },
      subtitle: { type: "text", pos: 1, display_name: "Subtitle" },
      features: {
        type: "bloks",
        pos: 2,
        display_name: "Features",
        restrict_type: "groups",
        restrict_components: true,
        component_whitelist: ["feature_card"],
      },
    },
  },
  // --- Text with Image ---
  {
    name: "text_with_image",
    display_name: "Text with Image",
    is_nestable: true,
    schema: {
      title: { type: "text", pos: 0, display_name: "Title" },
      content: { type: "richtext", pos: 1, display_name: "Content" },
      image: { type: "asset", pos: 2, display_name: "Image", filetypes: ["images"] },
      image_position: {
        type: "option",
        pos: 3,
        display_name: "Image Position",
        options: [
          { name: "Left", value: "left" },
          { name: "Right", value: "right" },
        ],
        default_value: "right",
      },
    },
  },
  // --- Testimonial Card (nestable) ---
  {
    name: "testimonial_card",
    display_name: "Testimonial Card",
    is_nestable: true,
    schema: {
      quote: { type: "textarea", pos: 0, display_name: "Quote", required: true },
      author_name: { type: "text", pos: 1, display_name: "Author Name" },
      author_role: { type: "text", pos: 2, display_name: "Author Role" },
      avatar: { type: "asset", pos: 3, display_name: "Avatar", filetypes: ["images"] },
    },
  },
  // --- Testimonials ---
  {
    name: "testimonials",
    display_name: "Testimonials",
    is_nestable: true,
    schema: {
      title: { type: "text", pos: 0, display_name: "Title" },
      items: {
        type: "bloks",
        pos: 1,
        display_name: "Testimonials",
        restrict_type: "groups",
        restrict_components: true,
        component_whitelist: ["testimonial_card"],
      },
    },
  },
  // --- Call to Action ---
  {
    name: "call_to_action",
    display_name: "Call to Action",
    is_nestable: true,
    schema: {
      headline: { type: "text", pos: 0, display_name: "Headline", required: true },
      body: { type: "textarea", pos: 1, display_name: "Body" },
      button_label: { type: "text", pos: 2, display_name: "Button Label" },
      button_link: { type: "multilink", pos: 3, display_name: "Button Link" },
    },
  },
  // --- Pricing Card (nestable) ---
  {
    name: "pricing_card",
    display_name: "Pricing Card",
    is_nestable: true,
    schema: {
      plan_name: { type: "text", pos: 0, display_name: "Plan Name", required: true },
      price: { type: "text", pos: 1, display_name: "Price" },
      period: { type: "text", pos: 2, display_name: "Period", default_value: "month" },
      features: { type: "textarea", pos: 3, display_name: "Features (one per line)" },
      button_label: { type: "text", pos: 4, display_name: "Button Label" },
      button_link: { type: "multilink", pos: 5, display_name: "Button Link" },
      is_popular: { type: "boolean", pos: 6, display_name: "Popular Badge", default_value: false },
      popular_badge_text: { type: "text", pos: 7, display_name: "Popular Badge Text", default_value: "Most Popular" },
    },
  },
  // --- Pricing Table ---
  {
    name: "pricing_table",
    display_name: "Pricing Table",
    is_nestable: true,
    schema: {
      title: { type: "text", pos: 0, display_name: "Title" },
      subtitle: { type: "text", pos: 1, display_name: "Subtitle" },
      plans: {
        type: "bloks",
        pos: 2,
        display_name: "Plans",
        restrict_type: "groups",
        restrict_components: true,
        component_whitelist: ["pricing_card"],
      },
    },
  },
  // --- Contact Form ---
  {
    name: "contact_form",
    display_name: "Contact Form",
    is_nestable: true,
    schema: {
      title: { type: "text", pos: 0, display_name: "Title" },
      subtitle: { type: "text", pos: 1, display_name: "Subtitle" },
      name_label: { type: "text", pos: 2, display_name: "Name Label", default_value: "Name" },
      name_placeholder: { type: "text", pos: 3, display_name: "Name Placeholder", default_value: "Your name" },
      email_label: { type: "text", pos: 4, display_name: "Email Label", default_value: "Email" },
      email_placeholder: { type: "text", pos: 5, display_name: "Email Placeholder", default_value: "you@example.com" },
      message_label: { type: "text", pos: 6, display_name: "Message Label", default_value: "Message" },
      message_placeholder: { type: "text", pos: 7, display_name: "Message Placeholder", default_value: "How can we help you?" },
      button_label: { type: "text", pos: 8, display_name: "Button Label", default_value: "Send Message" },
      success_title: { type: "text", pos: 9, display_name: "Success Title", default_value: "Thank you!" },
      success_message: { type: "text", pos: 10, display_name: "Success Message", default_value: "Your message has been received. We'll get back to you shortly." },
    },
  },
  // --- Logo Item (nestable) ---
  {
    name: "logo_item",
    display_name: "Logo Item",
    is_nestable: true,
    schema: {
      name: { type: "text", pos: 0, display_name: "Company Name" },
      logo: { type: "asset", pos: 1, display_name: "Logo", filetypes: ["images"] },
      link: { type: "multilink", pos: 2, display_name: "Link" },
    },
  },
  // --- Logo Cloud ---
  {
    name: "logo_cloud",
    display_name: "Logo Cloud",
    is_nestable: true,
    schema: {
      title: { type: "text", pos: 0, display_name: "Title" },
      logos: {
        type: "bloks",
        pos: 1,
        display_name: "Logos",
        restrict_type: "groups",
        restrict_components: true,
        component_whitelist: ["logo_item"],
      },
    },
  },
  // --- FAQ Item (nestable) ---
  {
    name: "faq_item",
    display_name: "FAQ Item",
    is_nestable: true,
    schema: {
      question: { type: "text", pos: 0, display_name: "Question", required: true },
      answer: { type: "richtext", pos: 1, display_name: "Answer" },
    },
  },
  // --- FAQ ---
  {
    name: "faq",
    display_name: "FAQ",
    is_nestable: true,
    schema: {
      title: { type: "text", pos: 0, display_name: "Title" },
      subtitle: { type: "text", pos: 1, display_name: "Subtitle" },
      items: {
        type: "bloks",
        pos: 2,
        display_name: "Questions",
        restrict_type: "groups",
        restrict_components: true,
        component_whitelist: ["faq_item"],
      },
    },
  },
  // --- Rich Text Block ---
  {
    name: "rich_text_block",
    display_name: "Rich Text Block",
    is_nestable: true,
    schema: {
      content: { type: "richtext", pos: 0, display_name: "Content" },
    },
  },
  // --- Blog Post (root) ---
  {
    name: "blog_post",
    display_name: "Blog Post",
    is_root: true,
    schema: {
      title: { type: "text", pos: 0, display_name: "Title", required: true },
      excerpt: { type: "textarea", pos: 1, display_name: "Excerpt" },
      featured_image: { type: "asset", pos: 2, display_name: "Featured Image", filetypes: ["images"] },
      content: { type: "richtext", pos: 3, display_name: "Content" },
      author: { type: "text", pos: 4, display_name: "Author" },
      published_date: { type: "datetime", pos: 5, display_name: "Published Date" },
    },
  },
  // --- Page (root) ---
  {
    name: "page",
    display_name: "Page",
    is_root: true,
    schema: {
      title: { type: "text", pos: 0, display_name: "Page Title" },
      description: { type: "text", pos: 1, display_name: "Meta Description" },
      body: {
        type: "bloks",
        pos: 2,
        display_name: "Body",
        restrict_type: "groups",
        restrict_components: true,
        component_whitelist: [
          "hero",
          "feature_grid",
          "text_with_image",
          "testimonials",
          "call_to_action",
          "pricing_table",
          "contact_form",
          "logo_cloud",
          "faq",
          "rich_text_block",
        ],
      },
    },
  },
];

// ---------- Seed Content ----------

function richtext(text: string) {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  };
}

function uid() {
  return Math.random().toString(36).substring(2, 15);
}

const configContent = {
  component: "config",
  site_name: "Nexus Digital",
  footer_tagline: "Building extraordinary digital experiences for ambitious companies worldwide.",
  header_nav: [
    { _uid: uid(), component: "nav_link", label: "Home", link: { id: "", url: "/", linktype: "url", fieldtype: "multilink", cached_url: "/" } },
    { _uid: uid(), component: "nav_link", label: "Services", link: { id: "", url: "/services", linktype: "url", fieldtype: "multilink", cached_url: "/services" } },
    { _uid: uid(), component: "nav_link", label: "About", link: { id: "", url: "/about", linktype: "url", fieldtype: "multilink", cached_url: "/about" } },
    { _uid: uid(), component: "nav_link", label: "Blog", link: { id: "", url: "/blog", linktype: "url", fieldtype: "multilink", cached_url: "/blog" } },
    { _uid: uid(), component: "nav_link", label: "Contact", link: { id: "", url: "/contact", linktype: "url", fieldtype: "multilink", cached_url: "/contact" } },
  ],
  footer_columns: [
    {
      _uid: uid(),
      component: "footer_column",
      title: "Company",
      links: [
        { _uid: uid(), component: "nav_link", label: "About", link: { id: "", url: "/about", linktype: "url", fieldtype: "multilink", cached_url: "/about" } },
        { _uid: uid(), component: "nav_link", label: "Services", link: { id: "", url: "/services", linktype: "url", fieldtype: "multilink", cached_url: "/services" } },
        { _uid: uid(), component: "nav_link", label: "Blog", link: { id: "", url: "/blog", linktype: "url", fieldtype: "multilink", cached_url: "/blog" } },
      ],
    },
    {
      _uid: uid(),
      component: "footer_column",
      title: "Support",
      links: [
        { _uid: uid(), component: "nav_link", label: "Contact", link: { id: "", url: "/contact", linktype: "url", fieldtype: "multilink", cached_url: "/contact" } },
        { _uid: uid(), component: "nav_link", label: "FAQ", link: { id: "", url: "/contact", linktype: "url", fieldtype: "multilink", cached_url: "/contact" } },
      ],
    },
    {
      _uid: uid(),
      component: "footer_column",
      title: "Legal",
      links: [
        { _uid: uid(), component: "nav_link", label: "Privacy Policy", link: { id: "", url: "#", linktype: "url", fieldtype: "multilink", cached_url: "#" } },
        { _uid: uid(), component: "nav_link", label: "Terms of Service", link: { id: "", url: "#", linktype: "url", fieldtype: "multilink", cached_url: "#" } },
      ],
    },
  ],
  social_links: [
    { _uid: uid(), component: "social_link", platform: "twitter", link: { id: "", url: "https://twitter.com", linktype: "url", fieldtype: "multilink", cached_url: "https://twitter.com" } },
    { _uid: uid(), component: "social_link", platform: "linkedin", link: { id: "", url: "https://linkedin.com", linktype: "url", fieldtype: "multilink", cached_url: "https://linkedin.com" } },
    { _uid: uid(), component: "social_link", platform: "github", link: { id: "", url: "https://github.com", linktype: "url", fieldtype: "multilink", cached_url: "https://github.com" } },
  ],
  copyright_text: "\u00A9 2025 Nexus Digital. All rights reserved.",
};

const homeContent = {
  component: "page",
  title: "Home",
  description: "Welcome to Nexus Digital - Building the future of digital experiences",
  body: [
    {
      _uid: uid(),
      component: "hero",
      headline: "Build Something Extraordinary",
      subheadline: "We help ambitious companies craft digital experiences that delight users and drive growth. From strategy to launch, we're your partner in innovation.",
      size: "large",
      background_image: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" },
      buttons: [
        { _uid: uid(), component: "hero_button", label: "Get Started", variant: "primary", link: { id: "", url: "/contact", linktype: "url", fieldtype: "multilink", cached_url: "/contact" } },
        { _uid: uid(), component: "hero_button", label: "Learn More", variant: "secondary", link: { id: "", url: "/services", linktype: "url", fieldtype: "multilink", cached_url: "/services" } },
      ],
    },
    {
      _uid: uid(),
      component: "logo_cloud",
      title: "Trusted by innovative companies worldwide",
      logos: [
        { _uid: uid(), component: "logo_item", name: "TechCorp", logo: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" }, link: { id: "", url: "#", linktype: "url", fieldtype: "multilink", cached_url: "#" } },
        { _uid: uid(), component: "logo_item", name: "Innovate Inc", logo: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" }, link: { id: "", url: "#", linktype: "url", fieldtype: "multilink", cached_url: "#" } },
        { _uid: uid(), component: "logo_item", name: "FutureScale", logo: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" }, link: { id: "", url: "#", linktype: "url", fieldtype: "multilink", cached_url: "#" } },
        { _uid: uid(), component: "logo_item", name: "DataFlow", logo: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" }, link: { id: "", url: "#", linktype: "url", fieldtype: "multilink", cached_url: "#" } },
        { _uid: uid(), component: "logo_item", name: "CloudNine", logo: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" }, link: { id: "", url: "#", linktype: "url", fieldtype: "multilink", cached_url: "#" } },
      ],
    },
    {
      _uid: uid(),
      component: "feature_grid",
      title: "Why Teams Choose Us",
      subtitle: "We combine deep technical expertise with a relentless focus on user experience.",
      features: [
        { _uid: uid(), component: "feature_card", icon: "rocket", title: "Lightning Fast", description: "Our websites load in under a second, ensuring your visitors stay engaged and your conversion rates soar." },
        { _uid: uid(), component: "feature_card", icon: "shield", title: "Enterprise Security", description: "Bank-grade security practices built into every layer, so your data and your customers' data stays safe." },
        { _uid: uid(), component: "feature_card", icon: "chart", title: "Data-Driven Insights", description: "Built-in analytics and reporting help you make informed decisions and optimize your digital presence." },
        { _uid: uid(), component: "feature_card", icon: "globe", title: "Global Scale", description: "Deploy to edge networks worldwide. Your site performs brilliantly whether your users are local or global." },
        { _uid: uid(), component: "feature_card", icon: "code", title: "Modern Stack", description: "We use cutting-edge technology — React, Next.js, and headless CMS — for maintainable, future-proof solutions." },
        { _uid: uid(), component: "feature_card", icon: "users", title: "Dedicated Support", description: "Our team is available when you need us. From onboarding to ongoing optimization, we've got your back." },
      ],
    },
    {
      _uid: uid(),
      component: "text_with_image",
      title: "A Modern Approach to Digital",
      content: richtext("We believe great digital products start with understanding your users. Our team combines design thinking with technical excellence to create websites that don't just look beautiful — they perform. Every project we take on is an opportunity to push boundaries and deliver results that exceed expectations."),
      image: { id: null, alt: "Team collaboration", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" },
      image_position: "right",
    },
    {
      _uid: uid(),
      component: "testimonials",
      title: "What Our Clients Say",
      items: [
        { _uid: uid(), component: "testimonial_card", quote: "Working with Nexus Digital transformed our online presence. Our conversion rate increased by 40% within the first month of launching the new site.", author_name: "Sarah Chen", author_role: "VP of Marketing, TechCorp", avatar: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" } },
        { _uid: uid(), component: "testimonial_card", quote: "The team's attention to detail and technical expertise is unmatched. They delivered a solution that scales with our growth and delights our users.", author_name: "Marcus Rodriguez", author_role: "CTO, FutureScale", avatar: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" } },
        { _uid: uid(), component: "testimonial_card", quote: "Professional, responsive, and incredibly talented. Nexus Digital is more than a vendor — they're a true partner in our digital transformation.", author_name: "Emily Watson", author_role: "CEO, Innovate Inc", avatar: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" } },
      ],
    },
    {
      _uid: uid(),
      component: "call_to_action",
      headline: "Ready to Transform Your Digital Presence?",
      body: "Let's discuss how we can help you build something extraordinary. Get in touch for a free consultation.",
      button_label: "Start a Conversation",
      button_link: { id: "", url: "/contact", linktype: "url", fieldtype: "multilink", cached_url: "/contact" },
    },
  ],
};

const servicesContent = {
  component: "page",
  title: "Services",
  description: "Explore our comprehensive range of digital services",
  body: [
    {
      _uid: uid(),
      component: "hero",
      headline: "Our Services",
      subheadline: "Comprehensive digital solutions tailored to your business needs. From strategy to execution, we deliver results.",
      size: "medium",
      background_image: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" },
      buttons: [],
    },
    {
      _uid: uid(),
      component: "feature_grid",
      title: "What We Offer",
      subtitle: "End-to-end digital services designed to accelerate your business.",
      features: [
        { _uid: uid(), component: "feature_card", icon: "code", title: "Web Development", description: "Custom websites and web applications built with modern frameworks. Fast, accessible, and beautifully crafted." },
        { _uid: uid(), component: "feature_card", icon: "globe", title: "Digital Strategy", description: "Data-driven strategies that align your digital presence with your business objectives and target audience." },
        { _uid: uid(), component: "feature_card", icon: "lightning", title: "Performance Optimization", description: "Speed up your existing site with core web vitals optimization, caching strategies, and code splitting." },
        { _uid: uid(), component: "feature_card", icon: "cloud", title: "Cloud Infrastructure", description: "Scalable, reliable cloud architecture that grows with your business. AWS, Azure, and GCP expertise." },
        { _uid: uid(), component: "feature_card", icon: "lock", title: "Security Audits", description: "Comprehensive security reviews and penetration testing to protect your digital assets and user data." },
        { _uid: uid(), component: "feature_card", icon: "chart", title: "Analytics & Reporting", description: "Custom dashboards and reporting solutions that give you real-time visibility into your digital performance." },
      ],
    },
    {
      _uid: uid(),
      component: "pricing_table",
      title: "Simple, Transparent Pricing",
      subtitle: "Choose the plan that fits your needs. All plans include a 14-day free trial.",
      plans: [
        {
          _uid: uid(),
          component: "pricing_card",
          plan_name: "Starter",
          price: "$999",
          period: "month",
          features: "5 pages\nResponsive design\nBasic SEO\nContact form\nMonthly analytics report",
          button_label: "Get Started",
          button_link: { id: "", url: "/contact", linktype: "url", fieldtype: "multilink", cached_url: "/contact" },
          is_popular: false,
          popular_badge_text: "",
        },
        {
          _uid: uid(),
          component: "pricing_card",
          plan_name: "Professional",
          price: "$2,499",
          period: "month",
          features: "15 pages\nCustom design system\nAdvanced SEO\nCMS integration\nE-commerce ready\nWeekly analytics\nPriority support",
          button_label: "Get Started",
          button_link: { id: "", url: "/contact", linktype: "url", fieldtype: "multilink", cached_url: "/contact" },
          is_popular: true,
          popular_badge_text: "Most Popular",
        },
        {
          _uid: uid(),
          component: "pricing_card",
          plan_name: "Enterprise",
          price: "Custom",
          period: "project",
          features: "Unlimited pages\nFull custom development\nAPI integrations\nMulti-language support\nDedicated account manager\nSLA guarantee\n24/7 support",
          button_label: "Contact Sales",
          button_link: { id: "", url: "/contact", linktype: "url", fieldtype: "multilink", cached_url: "/contact" },
          is_popular: false,
          popular_badge_text: "",
        },
      ],
    },
    {
      _uid: uid(),
      component: "call_to_action",
      headline: "Not Sure Which Plan Is Right for You?",
      body: "Our team will help you find the perfect solution for your needs and budget.",
      button_label: "Schedule a Consultation",
      button_link: { id: "", url: "/contact", linktype: "url", fieldtype: "multilink", cached_url: "/contact" },
    },
  ],
};

const aboutContent = {
  component: "page",
  title: "About Us",
  description: "Learn about our team, our mission, and our values",
  body: [
    {
      _uid: uid(),
      component: "hero",
      headline: "About Nexus Digital",
      subheadline: "We're a team of designers, developers, and strategists who are passionate about building remarkable digital experiences.",
      size: "medium",
      background_image: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" },
      buttons: [],
    },
    {
      _uid: uid(),
      component: "text_with_image",
      title: "Our Story",
      content: richtext("Founded in 2018, Nexus Digital started with a simple belief: every business deserves a world-class digital presence. What began as a two-person studio has grown into a full-service digital agency serving clients across the globe. We've helped over 200 companies transform their online presence, generating measurable results and lasting partnerships. Our approach blends creative design with technical rigor, ensuring every project we deliver is both beautiful and performant."),
      image: { id: null, alt: "Our team at work", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" },
      image_position: "right",
    },
    {
      _uid: uid(),
      component: "feature_grid",
      title: "Our Values",
      subtitle: "These principles guide everything we do.",
      features: [
        { _uid: uid(), component: "feature_card", icon: "heart", title: "User First", description: "Every decision we make starts with the end user. We design for people, not just pixels." },
        { _uid: uid(), component: "feature_card", icon: "star", title: "Excellence", description: "We hold ourselves to the highest standards of quality in design, code, and communication." },
        { _uid: uid(), component: "feature_card", icon: "lightning", title: "Innovation", description: "We stay at the forefront of technology, always exploring better ways to solve problems." },
        { _uid: uid(), component: "feature_card", icon: "users", title: "Collaboration", description: "We work as an extension of your team, fostering open communication and shared ownership." },
        { _uid: uid(), component: "feature_card", icon: "shield", title: "Integrity", description: "Honest advice, transparent pricing, and no surprises. We build trust through consistency." },
        { _uid: uid(), component: "feature_card", icon: "globe", title: "Impact", description: "We measure success by the tangible results we deliver for our clients and their users." },
      ],
    },
    {
      _uid: uid(),
      component: "testimonials",
      title: "Trusted by Industry Leaders",
      items: [
        { _uid: uid(), component: "testimonial_card", quote: "Nexus Digital didn't just build us a website — they helped us rethink our entire digital strategy. The results speak for themselves.", author_name: "David Park", author_role: "Founder, DataFlow", avatar: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" } },
        { _uid: uid(), component: "testimonial_card", quote: "The most collaborative agency we've ever worked with. They truly became part of our team and delivered beyond our expectations.", author_name: "Lisa Thompson", author_role: "COO, CloudNine", avatar: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" } },
        { _uid: uid(), component: "testimonial_card", quote: "From concept to launch, the Nexus team was exceptional. They took the time to understand our vision and brought it to life flawlessly.", author_name: "James Mitchell", author_role: "Director, GreenLeaf", avatar: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" } },
      ],
    },
  ],
};

const contactContent = {
  component: "page",
  title: "Contact",
  description: "Get in touch with our team",
  body: [
    {
      _uid: uid(),
      component: "hero",
      headline: "Get In Touch",
      subheadline: "Have a project in mind? We'd love to hear about it. Fill out the form below and we'll get back to you within 24 hours.",
      size: "small",
      background_image: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" },
      buttons: [],
    },
    {
      _uid: uid(),
      component: "contact_form",
      title: "Send Us a Message",
      subtitle: "Fill out the form below and our team will respond within one business day.",
      name_label: "Name",
      name_placeholder: "Your name",
      email_label: "Email",
      email_placeholder: "you@example.com",
      message_label: "Message",
      message_placeholder: "How can we help you?",
      button_label: "Send Message",
      success_title: "Thank you!",
      success_message: "Your message has been received. We'll get back to you within one business day.",
    },
    {
      _uid: uid(),
      component: "faq",
      title: "Frequently Asked Questions",
      subtitle: "Can't find what you're looking for? Reach out to us directly.",
      items: [
        { _uid: uid(), component: "faq_item", question: "How long does a typical project take?", answer: richtext("Most projects take between 6-12 weeks from kickoff to launch, depending on complexity. We'll provide a detailed timeline during our initial consultation.") },
        { _uid: uid(), component: "faq_item", question: "Do you work with small businesses?", answer: richtext("Absolutely! We work with businesses of all sizes. Our Starter plan is specifically designed for small businesses looking to establish a strong online presence.") },
        { _uid: uid(), component: "faq_item", question: "What technologies do you use?", answer: richtext("We primarily work with React, Next.js, and headless CMS platforms like Storyblok. For backend needs, we use Node.js, PostgreSQL, and cloud services like AWS and Vercel.") },
        { _uid: uid(), component: "faq_item", question: "Do you offer ongoing support?", answer: richtext("Yes! All our plans include ongoing support and maintenance. We also offer dedicated support packages for clients who need priority assistance and regular updates.") },
        { _uid: uid(), component: "faq_item", question: "Can you help with an existing website?", answer: richtext("Of course. We offer performance audits, redesigns, and incremental improvements for existing sites. We'll assess your current setup and recommend the best path forward.") },
      ],
    },
  ],
};

const blogContent = {
  component: "page",
  title: "Blog",
  description: "Insights, tutorials, and news from the Nexus Digital team",
  body: [
    {
      _uid: uid(),
      component: "hero",
      headline: "Our Blog",
      subheadline: "Insights, tutorials, and industry news from our team of digital experts.",
      size: "small",
      background_image: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" },
      buttons: [],
    },
    {
      _uid: uid(),
      component: "feature_grid",
      title: "Latest Posts",
      subtitle: "",
      features: [
        { _uid: uid(), component: "feature_card", icon: "rocket", title: "The Future of Headless CMS", description: "Explore why headless CMS architecture is becoming the standard for modern web development and how it benefits your team." },
        { _uid: uid(), component: "feature_card", icon: "lightning", title: "Optimizing Core Web Vitals", description: "A practical guide to measuring and improving your site's Core Web Vitals for better user experience and SEO rankings." },
        { _uid: uid(), component: "feature_card", icon: "code", title: "Next.js 15: What's New", description: "A deep dive into the latest features of Next.js 15, including Server Components, improved routing, and performance gains." },
        { _uid: uid(), component: "feature_card", icon: "shield", title: "Web Security Best Practices", description: "Essential security practices every web developer should implement to protect user data and prevent common vulnerabilities." },
        { _uid: uid(), component: "feature_card", icon: "chart", title: "Data-Driven Design Decisions", description: "How to leverage analytics and user research to make design decisions that improve engagement and conversion rates." },
        { _uid: uid(), component: "feature_card", icon: "globe", title: "Going Global: i18n in Next.js", description: "A comprehensive guide to implementing internationalization in your Next.js application for a global audience." },
      ],
    },
  ],
};

const stories = [
  { name: "Config", slug: "config", content: configContent },
  { name: "Home", slug: "home", content: homeContent },
  { name: "Services", slug: "services", content: servicesContent },
  { name: "About", slug: "about", content: aboutContent },
  { name: "Contact", slug: "contact", content: contactContent },
  { name: "Blog", slug: "blog", content: blogContent },
];

// ---------- Main ----------

async function main() {
  console.log("=== Storyblok Setup Script ===\n");

  // Step 1: Delete existing default "page" component if it exists with a different schema
  console.log("[1/3] Fetching existing components...");
  const { components: existing } = await apiSafe("/components");
  const existingMap = new Map<string, number>();
  for (const comp of existing) {
    existingMap.set(comp.name, comp.id);
  }

  // Step 2: Create/update components
  console.log("[2/3] Creating components...\n");
  for (const comp of components) {
    const existingId = existingMap.get(comp.name);

    const payload = {
      component: {
        name: comp.name,
        display_name: comp.display_name,
        is_root: comp.is_root ?? false,
        is_nestable: comp.is_nestable ?? false,
        schema: comp.schema,
      },
    };

    if (existingId) {
      console.log(`  Updating: ${comp.display_name} (${comp.name})`);
      await apiSafe(`/components/${existingId}`, "PUT", payload);
    } else {
      console.log(`  Creating: ${comp.display_name} (${comp.name})`);
      await apiSafe("/components", "POST", payload);
    }
    await sleep(200); // Be gentle with rate limits
  }

  // Step 3: Create stories
  console.log("\n[3/3] Creating seed content...\n");

  // First check for existing stories
  const { stories: existingStories } = await apiSafe("/stories");
  const existingSlugs = new Map<string, number>();
  for (const s of existingStories) {
    existingSlugs.set(s.slug, s.id);
  }

  for (const story of stories) {
    const payload = {
      story: {
        name: story.name,
        slug: story.slug,
        content: story.content,
      },
      publish: 1,
    };

    const existingId = existingSlugs.get(story.slug);
    if (existingId) {
      console.log(`  Updating: ${story.name} (/${story.slug})`);
      await apiSafe(`/stories/${existingId}`, "PUT", payload);
    } else {
      console.log(`  Creating: ${story.name} (/${story.slug})`);
      await apiSafe("/stories", "POST", payload);
    }
    await sleep(300);
  }

  console.log("\n✅ Setup complete! Your Storyblok space is ready.");
  console.log("   Open the Storyblok editor to see your content.\n");
}

main().catch((err) => {
  console.error("\n❌ Setup failed:", err.message);
  process.exit(1);
});
