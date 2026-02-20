/**
 * Storyblok Setup Script
 *
 * Creates all component blueprints (bloks) and seed content in your Storyblok space.
 * Configures i18n with English (default) and Romanian.
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

  // Handle empty responses (e.g., DELETE or some PUT calls)
  const text = await res.text();
  if (!text) return {};
  return JSON.parse(text);
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
  translatable?: boolean;
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
  // --- Nav Link (nestable, self-referencing for nested navigation) ---
  {
    name: "nav_link",
    display_name: "Nav Link",
    is_nestable: true,
    schema: {
      label: { type: "text", pos: 0, display_name: "Label", required: true, translatable: true },
      link: { type: "multilink", pos: 1, display_name: "Link" },
      children: {
        type: "bloks",
        pos: 2,
        display_name: "Dropdown Items",
        restrict_type: "groups",
        restrict_components: true,
        component_whitelist: ["nav_link"],
        description: "Add child links to create a dropdown menu",
      },
    },
  },
  // --- Footer Column (nestable) ---
  {
    name: "footer_column",
    display_name: "Footer Column",
    is_nestable: true,
    schema: {
      title: { type: "text", pos: 0, display_name: "Title", translatable: true },
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
      site_name: { type: "text", pos: 0, display_name: "Site Name", default_value: "Storyblok Site", translatable: true },
      header_nav: {
        type: "bloks",
        pos: 1,
        display_name: "Header Navigation",
        restrict_type: "groups",
        restrict_components: true,
        component_whitelist: ["nav_link"],
      },
      header_cta_label: { type: "text", pos: 2, display_name: "Header CTA Label", translatable: true },
      header_cta_link: { type: "multilink", pos: 3, display_name: "Header CTA Link" },
      footer_tagline: { type: "text", pos: 4, display_name: "Footer Tagline", translatable: true },
      footer_columns: {
        type: "bloks",
        pos: 5,
        display_name: "Footer Columns",
        restrict_type: "groups",
        restrict_components: true,
        component_whitelist: ["footer_column"],
      },
      social_links: {
        type: "bloks",
        pos: 6,
        display_name: "Social Links",
        restrict_type: "groups",
        restrict_components: true,
        component_whitelist: ["social_link"],
      },
      copyright_text: { type: "text", pos: 7, display_name: "Copyright Text", translatable: true },
    },
  },
  // --- Hero Button (nestable) ---
  {
    name: "hero_button",
    display_name: "Hero Button",
    is_nestable: true,
    schema: {
      label: { type: "text", pos: 0, display_name: "Label", required: true, translatable: true },
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
      headline: { type: "text", pos: 0, display_name: "Headline", required: true, translatable: true },
      subheadline: { type: "text", pos: 1, display_name: "Subheadline", translatable: true },
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
      title: { type: "text", pos: 1, display_name: "Title", required: true, translatable: true },
      description: { type: "textarea", pos: 2, display_name: "Description", translatable: true },
    },
  },
  // --- Feature Grid ---
  {
    name: "feature_grid",
    display_name: "Feature Grid",
    is_nestable: true,
    schema: {
      title: { type: "text", pos: 0, display_name: "Title", translatable: true },
      subtitle: { type: "text", pos: 1, display_name: "Subtitle", translatable: true },
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
      title: { type: "text", pos: 0, display_name: "Title", translatable: true },
      content: { type: "richtext", pos: 1, display_name: "Content", translatable: true },
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
      quote: { type: "textarea", pos: 0, display_name: "Quote", required: true, translatable: true },
      author_name: { type: "text", pos: 1, display_name: "Author Name" },
      author_role: { type: "text", pos: 2, display_name: "Author Role", translatable: true },
      avatar: { type: "asset", pos: 3, display_name: "Avatar", filetypes: ["images"] },
    },
  },
  // --- Testimonials ---
  {
    name: "testimonials",
    display_name: "Testimonials",
    is_nestable: true,
    schema: {
      title: { type: "text", pos: 0, display_name: "Title", translatable: true },
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
      headline: { type: "text", pos: 0, display_name: "Headline", required: true, translatable: true },
      body: { type: "textarea", pos: 1, display_name: "Body", translatable: true },
      button_label: { type: "text", pos: 2, display_name: "Button Label", translatable: true },
      button_link: { type: "multilink", pos: 3, display_name: "Button Link" },
    },
  },
  // --- Pricing Card (nestable) ---
  {
    name: "pricing_card",
    display_name: "Pricing Card",
    is_nestable: true,
    schema: {
      plan_name: { type: "text", pos: 0, display_name: "Plan Name", required: true, translatable: true },
      price: { type: "text", pos: 1, display_name: "Price", translatable: true },
      period: { type: "text", pos: 2, display_name: "Period", default_value: "month", translatable: true },
      features: { type: "textarea", pos: 3, display_name: "Features (one per line)", translatable: true },
      button_label: { type: "text", pos: 4, display_name: "Button Label", translatable: true },
      button_link: { type: "multilink", pos: 5, display_name: "Button Link" },
      is_popular: { type: "boolean", pos: 6, display_name: "Popular Badge", default_value: false },
      popular_badge_text: { type: "text", pos: 7, display_name: "Popular Badge Text", default_value: "Most Popular", translatable: true },
    },
  },
  // --- Pricing Table ---
  {
    name: "pricing_table",
    display_name: "Pricing Table",
    is_nestable: true,
    schema: {
      title: { type: "text", pos: 0, display_name: "Title", translatable: true },
      subtitle: { type: "text", pos: 1, display_name: "Subtitle", translatable: true },
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
  // --- Form Field (nestable) ---
  {
    name: "form_field",
    display_name: "Form Field",
    is_nestable: true,
    schema: {
      label: { type: "text", pos: 0, display_name: "Label", required: true, translatable: true },
      name: { type: "text", pos: 1, display_name: "Field Name", required: true, description: "HTML name attribute (e.g. 'email', 'company'). Must be unique within the form." },
      type: {
        type: "option",
        pos: 2,
        display_name: "Field Type",
        options: [
          { name: "Text", value: "text" },
          { name: "Email", value: "email" },
          { name: "Phone", value: "tel" },
          { name: "Number", value: "number" },
          { name: "URL", value: "url" },
          { name: "Textarea", value: "textarea" },
          { name: "Select", value: "select" },
          { name: "Checkbox", value: "checkbox" },
        ],
        default_value: "text",
      },
      placeholder: { type: "text", pos: 3, display_name: "Placeholder", translatable: true },
      required: { type: "boolean", pos: 4, display_name: "Required", default_value: false },
      width: {
        type: "option",
        pos: 5,
        display_name: "Width",
        options: [
          { name: "Full Width", value: "full" },
          { name: "Half Width", value: "half" },
        ],
        default_value: "full",
      },
      options: {
        type: "textarea",
        pos: 6,
        display_name: "Options (for Select)",
        description: "One option per line. Only used when Field Type is 'Select'.",
        translatable: true,
      },
    },
  },
  // --- Contact Form ---
  {
    name: "contact_form",
    display_name: "Contact Form",
    is_nestable: true,
    schema: {
      title: { type: "text", pos: 0, display_name: "Title", translatable: true },
      subtitle: { type: "text", pos: 1, display_name: "Subtitle", translatable: true },
      fields: {
        type: "bloks",
        pos: 2,
        display_name: "Form Fields",
        restrict_type: "groups",
        restrict_components: true,
        component_whitelist: ["form_field"],
        description: "Add and configure form fields. Drag to reorder.",
      },
      submit_label: { type: "text", pos: 3, display_name: "Submit Button Label", default_value: "Send Message", translatable: true },
      success_title: { type: "text", pos: 4, display_name: "Success Title", default_value: "Thank you!", translatable: true },
      success_message: { type: "text", pos: 5, display_name: "Success Message", default_value: "Your message has been received.", translatable: true },
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
      title: { type: "text", pos: 0, display_name: "Title", translatable: true },
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
      question: { type: "text", pos: 0, display_name: "Question", required: true, translatable: true },
      answer: { type: "richtext", pos: 1, display_name: "Answer", translatable: true },
    },
  },
  // --- FAQ ---
  {
    name: "faq",
    display_name: "FAQ",
    is_nestable: true,
    schema: {
      title: { type: "text", pos: 0, display_name: "Title", translatable: true },
      subtitle: { type: "text", pos: 1, display_name: "Subtitle", translatable: true },
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
      content: { type: "richtext", pos: 0, display_name: "Content", translatable: true },
    },
  },
  // --- Blog Post (root) ---
  {
    name: "blog_post",
    display_name: "Blog Post",
    is_root: true,
    schema: {
      title: { type: "text", pos: 0, display_name: "Title", required: true, translatable: true },
      excerpt: { type: "textarea", pos: 1, display_name: "Excerpt", translatable: true },
      featured_image: { type: "asset", pos: 2, display_name: "Featured Image", filetypes: ["images"] },
      content: { type: "richtext", pos: 3, display_name: "Content", translatable: true },
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
      title: { type: "text", pos: 0, display_name: "Page Title", translatable: true },
      description: { type: "text", pos: 1, display_name: "Meta Description", translatable: true },
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
  header_cta_label: "Get Started",
  header_cta_link: { id: "", url: "/contact", linktype: "url", fieldtype: "multilink", cached_url: "/contact" },
  footer_tagline: "Building extraordinary digital experiences for ambitious companies worldwide.",
  header_nav: [
    { _uid: uid(), component: "nav_link", label: "Home", link: { id: "", url: "/", linktype: "url", fieldtype: "multilink", cached_url: "/" }, children: [] },
    {
      _uid: uid(), component: "nav_link", label: "Services", link: { id: "", url: "/services", linktype: "url", fieldtype: "multilink", cached_url: "/services" },
      children: [
        { _uid: uid(), component: "nav_link", label: "Web Development", link: { id: "", url: "/services", linktype: "url", fieldtype: "multilink", cached_url: "/services" }, children: [] },
        { _uid: uid(), component: "nav_link", label: "Digital Strategy", link: { id: "", url: "/services", linktype: "url", fieldtype: "multilink", cached_url: "/services" }, children: [] },
        { _uid: uid(), component: "nav_link", label: "Cloud Infrastructure", link: { id: "", url: "/services", linktype: "url", fieldtype: "multilink", cached_url: "/services" }, children: [] },
        { _uid: uid(), component: "nav_link", label: "Security Audits", link: { id: "", url: "/services", linktype: "url", fieldtype: "multilink", cached_url: "/services" }, children: [] },
      ],
    },
    { _uid: uid(), component: "nav_link", label: "About", link: { id: "", url: "/about", linktype: "url", fieldtype: "multilink", cached_url: "/about" }, children: [] },
    { _uid: uid(), component: "nav_link", label: "Blog", link: { id: "", url: "/blog", linktype: "url", fieldtype: "multilink", cached_url: "/blog" }, children: [] },
    { _uid: uid(), component: "nav_link", label: "Contact", link: { id: "", url: "/contact", linktype: "url", fieldtype: "multilink", cached_url: "/contact" }, children: [] },
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
      submit_label: "Send Message",
      success_title: "Thank you!",
      success_message: "Your message has been received. We'll get back to you within one business day.",
      fields: [
        { _uid: uid(), component: "form_field", label: "Name", name: "name", type: "text", placeholder: "Your name", required: true, width: "half", options: "" },
        { _uid: uid(), component: "form_field", label: "Email", name: "email", type: "email", placeholder: "you@example.com", required: true, width: "half", options: "" },
        { _uid: uid(), component: "form_field", label: "Subject", name: "subject", type: "select", placeholder: "", required: false, width: "full", options: "General Inquiry\nProject Quote\nSupport\nPartnership" },
        { _uid: uid(), component: "form_field", label: "Message", name: "message", type: "textarea", placeholder: "How can we help?", required: true, width: "full", options: "" },
      ],
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

// Stories that live at the root level
const rootStories = [
  { name: "Config", slug: "config", content: configContent },
  { name: "Home", slug: "home", content: homeContent },
];

// Stories that live inside the "pages" folder for clear hierarchy
const pageStories = [
  { name: "Services", slug: "services", content: servicesContent },
  { name: "About", slug: "about", content: aboutContent },
  { name: "Contact", slug: "contact", content: contactContent },
  { name: "Blog", slug: "blog", content: blogContent },
];

// ---------- Romanian Translations ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const romanianTranslations: Record<string, any> = {
  config: {
    site_name: "Nexus Digital",
    header_cta_label: "\u00CEncepe Acum",
    footer_tagline: "Construim experien\u021Be digitale extraordinare pentru companii ambi\u021Bioase din \u00EEntreaga lume.",
    copyright_text: "\u00A9 2025 Nexus Digital. Toate drepturile rezervate.",
    header_nav: [
      { _uid: uid(), component: "nav_link", label: "Acasă", link: { id: "", url: "/", linktype: "url", fieldtype: "multilink", cached_url: "/" }, children: [] },
      {
        _uid: uid(), component: "nav_link", label: "Servicii", link: { id: "", url: "/services", linktype: "url", fieldtype: "multilink", cached_url: "/services" },
        children: [
          { _uid: uid(), component: "nav_link", label: "Dezvoltare Web", link: { id: "", url: "/services", linktype: "url", fieldtype: "multilink", cached_url: "/services" }, children: [] },
          { _uid: uid(), component: "nav_link", label: "Strategie Digitală", link: { id: "", url: "/services", linktype: "url", fieldtype: "multilink", cached_url: "/services" }, children: [] },
          { _uid: uid(), component: "nav_link", label: "Infrastructură Cloud", link: { id: "", url: "/services", linktype: "url", fieldtype: "multilink", cached_url: "/services" }, children: [] },
          { _uid: uid(), component: "nav_link", label: "Audituri de Securitate", link: { id: "", url: "/services", linktype: "url", fieldtype: "multilink", cached_url: "/services" }, children: [] },
        ],
      },
      { _uid: uid(), component: "nav_link", label: "Despre Noi", link: { id: "", url: "/about", linktype: "url", fieldtype: "multilink", cached_url: "/about" }, children: [] },
      { _uid: uid(), component: "nav_link", label: "Blog", link: { id: "", url: "/blog", linktype: "url", fieldtype: "multilink", cached_url: "/blog" }, children: [] },
      { _uid: uid(), component: "nav_link", label: "Contact", link: { id: "", url: "/contact", linktype: "url", fieldtype: "multilink", cached_url: "/contact" }, children: [] },
    ],
    footer_columns: [
      {
        _uid: uid(),
        component: "footer_column",
        title: "Companie",
        links: [
          { _uid: uid(), component: "nav_link", label: "Despre Noi", link: { id: "", url: "/about", linktype: "url", fieldtype: "multilink", cached_url: "/about" } },
          { _uid: uid(), component: "nav_link", label: "Servicii", link: { id: "", url: "/services", linktype: "url", fieldtype: "multilink", cached_url: "/services" } },
          { _uid: uid(), component: "nav_link", label: "Blog", link: { id: "", url: "/blog", linktype: "url", fieldtype: "multilink", cached_url: "/blog" } },
        ],
      },
      {
        _uid: uid(),
        component: "footer_column",
        title: "Asisten\u021B\u0103",
        links: [
          { _uid: uid(), component: "nav_link", label: "Contact", link: { id: "", url: "/contact", linktype: "url", fieldtype: "multilink", cached_url: "/contact" } },
          { _uid: uid(), component: "nav_link", label: "\u00CEntreb\u0103ri Frecvente", link: { id: "", url: "/contact", linktype: "url", fieldtype: "multilink", cached_url: "/contact" } },
        ],
      },
      {
        _uid: uid(),
        component: "footer_column",
        title: "Legal",
        links: [
          { _uid: uid(), component: "nav_link", label: "Politica de Confiden\u021Bialitate", link: { id: "", url: "#", linktype: "url", fieldtype: "multilink", cached_url: "#" } },
          { _uid: uid(), component: "nav_link", label: "Termeni \u0219i Condi\u021Bii", link: { id: "", url: "#", linktype: "url", fieldtype: "multilink", cached_url: "#" } },
        ],
      },
    ],
  },
  home: {
    title: "Acas\u0103",
    description: "Bine a\u021Bi venit la Nexus Digital - Construim viitorul experien\u021Belor digitale",
    body: [
      {
        _uid: uid(),
        component: "hero",
        headline: "Construie\u0219te Ceva Extraordinar",
        subheadline: "Ajut\u0103m companiile ambi\u021Bioase s\u0103 creeze experien\u021Be digitale care \u00EEncânt\u0103 utilizatorii \u0219i stimuleaz\u0103 cre\u0219terea. De la strategie la lansare, suntem partenerul t\u0103u \u00EEn inova\u021Bie.",
        size: "large",
        background_image: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" },
        buttons: [
          { _uid: uid(), component: "hero_button", label: "\u00CEncepe Acum", variant: "primary", link: { id: "", url: "/contact", linktype: "url", fieldtype: "multilink", cached_url: "/contact" } },
          { _uid: uid(), component: "hero_button", label: "Afl\u0103 Mai Multe", variant: "secondary", link: { id: "", url: "/services", linktype: "url", fieldtype: "multilink", cached_url: "/services" } },
        ],
      },
      {
        _uid: uid(),
        component: "logo_cloud",
        title: "De \u00EEncredere pentru companii inovatoare din \u00EEntreaga lume",
      },
      {
        _uid: uid(),
        component: "feature_grid",
        title: "De Ce Ne Aleg Echipele",
        subtitle: "Combin\u0103m expertiza tehnic\u0103 profund\u0103 cu un focus neobi\u0219nuit pe experien\u021Ba utilizatorului.",
        features: [
          { _uid: uid(), component: "feature_card", icon: "rocket", title: "Rapid ca Fulgerul", description: "Site-urile noastre se \u00EEncarc\u0103 \u00EEn mai pu\u021Bin de o secund\u0103, asigur\u00E2nd c\u0103 vizitatorii r\u0103m\u00E2n implica\u021Bi \u0219i ratele de conversie cresc." },
          { _uid: uid(), component: "feature_card", icon: "shield", title: "Securitate Enterprise", description: "Practici de securitate de nivel bancar integrate \u00EEn fiecare strat, astfel \u00EEnc\u00E2t datele tale \u0219i ale clien\u021Bilor t\u0103i s\u0103 fie \u00EEn siguran\u021B\u0103." },
          { _uid: uid(), component: "feature_card", icon: "chart", title: "Analize Bazate pe Date", description: "Analitice \u0219i rapoarte integrate care te ajut\u0103 s\u0103 iei decizii informate \u0219i s\u0103 optimizezi prezen\u021Ba digital\u0103." },
          { _uid: uid(), component: "feature_card", icon: "globe", title: "Scalare Global\u0103", description: "Implementare pe re\u021Bele edge la nivel mondial. Site-ul t\u0103u func\u021Bioneaz\u0103 excelent indiferent dac\u0103 utilizatorii sunt locali sau globali." },
          { _uid: uid(), component: "feature_card", icon: "code", title: "Tehnologie Modern\u0103", description: "Folosim tehnologie de ultim\u0103 genera\u021Bie \u2014 React, Next.js \u0219i CMS headless \u2014 pentru solu\u021Bii u\u0219or de \u00EEntre\u021Binut \u0219i pregătite pentru viitor." },
          { _uid: uid(), component: "feature_card", icon: "users", title: "Suport Dedicat", description: "Echipa noastr\u0103 este disponibil\u0103 c\u00E2nd ai nevoie de noi. De la onboarding la optimizare continu\u0103, suntem al\u0103turi de tine." },
        ],
      },
      {
        _uid: uid(),
        component: "text_with_image",
        title: "O Abordare Modern\u0103 a Digitalului",
        content: richtext("Credem c\u0103 produsele digitale extraordinare \u00EEncep cu \u00EEn\u021Belegerea utilizatorilor. Echipa noastr\u0103 combin\u0103 g\u00E2ndirea de design cu excelen\u021Ba tehnic\u0103 pentru a crea site-uri web care nu arat\u0103 doar frumos \u2014 ci performeaz\u0103. Fiecare proiect pe care \u00EEl prelu\u0103m este o oportunitate de a dep\u0103\u0219i limitele \u0219i de a livra rezultate care dep\u0103\u0219esc a\u0219tept\u0103rile."),
      },
      {
        _uid: uid(),
        component: "testimonials",
        title: "Ce Spun Clien\u021Bii No\u0219tri",
        items: [
          { _uid: uid(), component: "testimonial_card", quote: "Colaborarea cu Nexus Digital ne-a transformat prezen\u021Ba online. Rata noastr\u0103 de conversie a crescut cu 40% \u00EEn prima lun\u0103 de la lansarea noului site.", author_name: "Sarah Chen", author_role: "VP Marketing, TechCorp" },
          { _uid: uid(), component: "testimonial_card", quote: "Aten\u021Bia la detalii \u0219i expertiza tehnic\u0103 a echipei este de ne\u00EEn\u021Beles. Au livrat o solu\u021Bie care se scaleaz\u0103 cu cre\u0219terea noastr\u0103 \u0219i \u00EEncânt\u0103 utilizatorii.", author_name: "Marcus Rodriguez", author_role: "CTO, FutureScale" },
          { _uid: uid(), component: "testimonial_card", quote: "Profesioni\u0219ti, receptivi \u0219i incredibil de talenta\u021Bi. Nexus Digital este mai mult dec\u00E2t un furnizor \u2014 sunt un partener adev\u0103rat \u00EEn transformarea noastr\u0103 digital\u0103.", author_name: "Emily Watson", author_role: "CEO, Innovate Inc" },
        ],
      },
      {
        _uid: uid(),
        component: "call_to_action",
        headline: "Gata S\u0103-\u021Bi Transformi Prezen\u021Ba Digital\u0103?",
        body: "Hai s\u0103 discut\u0103m cum te putem ajuta s\u0103 construie\u0219ti ceva extraordinar. Contacteaz\u0103-ne pentru o consulta\u021Bie gratuit\u0103.",
        button_label: "\u00CEncepe o Conversa\u021Bie",
      },
    ],
  },
  services: {
    title: "Servicii",
    description: "Exploreaz\u0103 gama noastr\u0103 complet\u0103 de servicii digitale",
    body: [
      {
        _uid: uid(),
        component: "hero",
        headline: "Serviciile Noastre",
        subheadline: "Solu\u021Bii digitale complete adaptate nevoilor afacerii tale. De la strategie la execu\u021Bie, livr\u0103m rezultate.",
        size: "medium",
        background_image: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" },
        buttons: [],
      },
      {
        _uid: uid(),
        component: "feature_grid",
        title: "Ce Oferim",
        subtitle: "Servicii digitale end-to-end concepute pentru a accelera afacerea ta.",
        features: [
          { _uid: uid(), component: "feature_card", icon: "code", title: "Dezvoltare Web", description: "Site-uri web \u0219i aplica\u021Bii web personalizate construite cu framework-uri moderne. Rapide, accesibile \u0219i frumos realizate." },
          { _uid: uid(), component: "feature_card", icon: "globe", title: "Strategie Digital\u0103", description: "Strategii bazate pe date care aliniaz\u0103 prezen\u021Ba ta digital\u0103 cu obiectivele de afaceri \u0219i publicul \u021Bint\u0103." },
          { _uid: uid(), component: "feature_card", icon: "lightning", title: "Optimizare Performan\u021B\u0103", description: "Accelereaz\u0103 site-ul existent cu optimizarea Core Web Vitals, strategii de caching \u0219i \u00EEmp\u0103r\u021Birea codului." },
          { _uid: uid(), component: "feature_card", icon: "cloud", title: "Infrastructur\u0103 Cloud", description: "Arhitectur\u0103 cloud scalabil\u0103 \u0219i fiabil\u0103 care cre\u0219te odat\u0103 cu afacerea ta. Expertiz\u0103 AWS, Azure \u0219i GCP." },
          { _uid: uid(), component: "feature_card", icon: "lock", title: "Audituri de Securitate", description: "Evalu\u0103ri complete de securitate \u0219i teste de penetrare pentru a proteja activele digitale \u0219i datele utilizatorilor." },
          { _uid: uid(), component: "feature_card", icon: "chart", title: "Analitic\u0103 \u0219i Raportare", description: "Dashboarduri personalizate \u0219i solu\u021Bii de raportare care \u00EE\u021Bi ofer\u0103 vizibilitate \u00EEn timp real asupra performan\u021Bei digitale." },
        ],
      },
      {
        _uid: uid(),
        component: "pricing_table",
        title: "Pre\u021Buri Simple \u0219i Transparente",
        subtitle: "Alege planul potrivit nevoilor tale. Toate planurile includ o perioad\u0103 de prob\u0103 gratuit\u0103 de 14 zile.",
        plans: [
          {
            _uid: uid(),
            component: "pricing_card",
            plan_name: "Starter",
            price: "$999",
            period: "lun\u0103",
            features: "5 pagini\nDesign responsiv\nSEO de baz\u0103\nFormular de contact\nRaport lunar de analitic\u0103",
            button_label: "\u00CEncepe Acum",
            is_popular: false,
            popular_badge_text: "",
          },
          {
            _uid: uid(),
            component: "pricing_card",
            plan_name: "Profesional",
            price: "$2,499",
            period: "lun\u0103",
            features: "15 pagini\nSistem de design personalizat\nSEO avansat\nIntegrare CMS\nPreg\u0103tit pentru e-commerce\nAnalitic\u0103 s\u0103pt\u0103m\u00E2nal\u0103\nSuport prioritar",
            button_label: "\u00CEncepe Acum",
            is_popular: true,
            popular_badge_text: "Cel Mai Popular",
          },
          {
            _uid: uid(),
            component: "pricing_card",
            plan_name: "Enterprise",
            price: "Personalizat",
            period: "proiect",
            features: "Pagini nelimitate\nDezvoltare complet personalizat\u0103\nIntegr\u0103ri API\nSuport multi-limb\u0103\nManager de cont dedicat\nGaran\u021Bie SLA\nSuport 24/7",
            button_label: "Contacteaz\u0103 V\u00E2nz\u0103rile",
            is_popular: false,
            popular_badge_text: "",
          },
        ],
      },
      {
        _uid: uid(),
        component: "call_to_action",
        headline: "Nu E\u0219ti Sigur Care Plan Este Potrivit?",
        body: "Echipa noastr\u0103 te va ajuta s\u0103 g\u0103se\u0219ti solu\u021Bia perfect\u0103 pentru nevoile \u0219i bugetul t\u0103u.",
        button_label: "Programeaz\u0103 o Consulta\u021Bie",
      },
    ],
  },
  about: {
    title: "Despre Noi",
    description: "Afl\u0103 despre echipa, misiunea \u0219i valorile noastre",
    body: [
      {
        _uid: uid(),
        component: "hero",
        headline: "Despre Nexus Digital",
        subheadline: "Suntem o echip\u0103 de designeri, dezvoltatori \u0219i strategi pasiona\u021Bi de construirea unor experien\u021Be digitale remarcabile.",
        size: "medium",
        background_image: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" },
        buttons: [],
      },
      {
        _uid: uid(),
        component: "text_with_image",
        title: "Povestea Noastr\u0103",
        content: richtext("Fondat \u00EEn 2018, Nexus Digital a \u00EEnceput cu o convingere simpl\u0103: fiecare afacere merit\u0103 o prezen\u021B\u0103 digital\u0103 de clas\u0103 mondial\u0103. Ceea ce a \u00EEnceput ca un studio de dou\u0103 persoane a crescut \u00EEntr-o agen\u021Bie digital\u0103 complet\u0103 care deserve\u0219te clien\u021Bi din \u00EEntreaga lume. Am ajutat peste 200 de companii s\u0103-\u0219i transforme prezen\u021Ba online, gener\u00E2nd rezultate m\u0103surabile \u0219i parteneriate durabile."),
      },
      {
        _uid: uid(),
        component: "feature_grid",
        title: "Valorile Noastre",
        subtitle: "Aceste principii ghideaz\u0103 tot ceea ce facem.",
        features: [
          { _uid: uid(), component: "feature_card", icon: "heart", title: "Utilizatorul Pe Primul Loc", description: "Fiecare decizie pe care o lu\u0103m \u00EEncepe cu utilizatorul final. Design\u0103m pentru oameni, nu doar pentru pixeli." },
          { _uid: uid(), component: "feature_card", icon: "star", title: "Excelen\u021B\u0103", description: "Ne \u021Binem la cele mai \u00EEnalte standarde de calitate \u00EEn design, cod \u0219i comunicare." },
          { _uid: uid(), component: "feature_card", icon: "lightning", title: "Inova\u021Bie", description: "R\u0103m\u00E2nem \u00EEn fruntea tehnologiei, explor\u00E2nd mereu modalit\u0103\u021Bi mai bune de a rezolva probleme." },
          { _uid: uid(), component: "feature_card", icon: "users", title: "Colaborare", description: "Lucr\u0103m ca o extensie a echipei tale, promov\u00E2nd comunicarea deschis\u0103 \u0219i responsabilitatea comun\u0103." },
          { _uid: uid(), component: "feature_card", icon: "shield", title: "Integritate", description: "Sfaturi oneste, pre\u021Buri transparente \u0219i f\u0103r\u0103 surprize. Construim \u00EEncredere prin consecven\u021B\u0103." },
          { _uid: uid(), component: "feature_card", icon: "globe", title: "Impact", description: "M\u0103sur\u0103m succesul prin rezultatele tangibile pe care le livr\u0103m clien\u021Bilor no\u0219tri \u0219i utilizatorilor lor." },
        ],
      },
      {
        _uid: uid(),
        component: "testimonials",
        title: "De \u00CEncredere pentru Lideri din Industrie",
        items: [
          { _uid: uid(), component: "testimonial_card", quote: "Nexus Digital nu ne-a construit doar un site web \u2014 ne-au ajutat s\u0103 reg\u00E2ndim \u00EEntreaga strategie digital\u0103. Rezultatele vorbesc de la sine.", author_name: "David Park", author_role: "Fondator, DataFlow" },
          { _uid: uid(), component: "testimonial_card", quote: "Cea mai colaborativ\u0103 agen\u021Bie cu care am lucrat vreodat\u0103. Au devenit cu adev\u0103rat parte din echipa noastr\u0103 \u0219i au livrat dincolo de a\u0219tept\u0103rile noastre.", author_name: "Lisa Thompson", author_role: "COO, CloudNine" },
          { _uid: uid(), component: "testimonial_card", quote: "De la concept la lansare, echipa Nexus a fost excep\u021Bional\u0103. \u0218i-au luat timp s\u0103 \u00EEn\u021Beleag\u0103 viziunea noastr\u0103 \u0219i au adus-o la via\u021B\u0103 impecabil.", author_name: "James Mitchell", author_role: "Director, GreenLeaf" },
        ],
      },
    ],
  },
  contact: {
    title: "Contact",
    description: "Ia leg\u0103tura cu echipa noastr\u0103",
    body: [
      {
        _uid: uid(),
        component: "hero",
        headline: "Contacteaz\u0103-ne",
        subheadline: "Ai un proiect \u00EEn minte? Ne-ar pl\u0103cea s\u0103 auzim despre el. Completeaz\u0103 formularul de mai jos \u0219i \u00EE\u021Bi vom r\u0103spunde \u00EEn 24 de ore.",
        size: "small",
        background_image: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" },
        buttons: [],
      },
      {
        _uid: uid(),
        component: "contact_form",
        title: "Trimite-ne un Mesaj",
        subtitle: "Completează formularul de mai jos și echipa noastră va răspunde în termen de o zi lucrătoare.",
        submit_label: "Trimite Mesajul",
        success_title: "Mulțumim!",
        success_message: "Mesajul tău a fost primit. Îți vom răspunde în termen de o zi lucrătoare.",
        fields: [
          { _uid: uid(), component: "form_field", label: "Nume", name: "name", type: "text", placeholder: "Numele tău", required: true, width: "half", options: "" },
          { _uid: uid(), component: "form_field", label: "Email", name: "email", type: "email", placeholder: "tu@exemplu.com", required: true, width: "half", options: "" },
          { _uid: uid(), component: "form_field", label: "Subiect", name: "subject", type: "select", placeholder: "", required: false, width: "full", options: "Întrebare generală\nCerere de ofertă\nSuport\nParteneriat" },
          { _uid: uid(), component: "form_field", label: "Mesaj", name: "message", type: "textarea", placeholder: "Cum te putem ajuta?", required: true, width: "full", options: "" },
        ],
      },
      {
        _uid: uid(),
        component: "faq",
        title: "\u00CEntreb\u0103ri Frecvente",
        subtitle: "Nu g\u0103se\u0219ti ce cau\u021Bi? Contacteaz\u0103-ne direct.",
        items: [
          { _uid: uid(), component: "faq_item", question: "C\u00E2t dureaz\u0103 un proiect tipic?", answer: richtext("Majoritatea proiectelor dureaz\u0103 \u00EEntre 6-12 s\u0103pt\u0103m\u00E2ni de la \u00EEncepere p\u00E2n\u0103 la lansare, \u00EEn func\u021Bie de complexitate. Vom oferi un calendar detaliat \u00EEn timpul consulta\u021Biei ini\u021Biale.") },
          { _uid: uid(), component: "faq_item", question: "Lucra\u021Bi cu afaceri mici?", answer: richtext("Absolut! Lucr\u0103m cu afaceri de toate dimensiunile. Planul nostru Starter este conceput special pentru afacerile mici care doresc s\u0103 stabileasc\u0103 o prezen\u021B\u0103 online puternic\u0103.") },
          { _uid: uid(), component: "faq_item", question: "Ce tehnologii folosi\u021Bi?", answer: richtext("Lucr\u0103m \u00EEn principal cu React, Next.js \u0219i platforme CMS headless precum Storyblok. Pentru nevoile de backend, folosim Node.js, PostgreSQL \u0219i servicii cloud precum AWS \u0219i Vercel.") },
          { _uid: uid(), component: "faq_item", question: "Oferi\u021Bi suport continuu?", answer: richtext("Da! Toate planurile noastre includ suport \u0219i \u00EEntre\u021Binere continu\u0103. Oferim \u0219i pachete de suport dedicat pentru clien\u021Bii care au nevoie de asisten\u021B\u0103 prioritar\u0103 \u0219i actualiz\u0103ri regulate.") },
          { _uid: uid(), component: "faq_item", question: "Pute\u021Bi ajuta cu un site web existent?", answer: richtext("Desigur. Oferim audituri de performan\u021B\u0103, redesign-uri \u0219i \u00EEmbun\u0103t\u0103\u021Biri incrementale pentru site-urile existente. Vom evalua configura\u021Bia actual\u0103 \u0219i vom recomanda cea mai bun\u0103 cale de urmat.") },
        ],
      },
    ],
  },
  blog: {
    title: "Blog",
    description: "Perspective, tutoriale \u0219i nout\u0103\u021Bi de la echipa Nexus Digital",
    body: [
      {
        _uid: uid(),
        component: "hero",
        headline: "Blogul Nostru",
        subheadline: "Perspective, tutoriale \u0219i nout\u0103\u021Bi din industrie de la echipa noastr\u0103 de exper\u021Bi digitali.",
        size: "small",
        background_image: { id: null, alt: "", name: "", focus: "", title: "", filename: "", copyright: "", fieldtype: "asset" },
        buttons: [],
      },
      {
        _uid: uid(),
        component: "feature_grid",
        title: "Ultimele Articole",
        subtitle: "",
        features: [
          { _uid: uid(), component: "feature_card", icon: "rocket", title: "Viitorul CMS Headless", description: "Exploreaz\u0103 de ce arhitectura CMS headless devine standardul pentru dezvoltarea web modern\u0103 \u0219i cum beneficiaz\u0103 echipa ta." },
          { _uid: uid(), component: "feature_card", icon: "lightning", title: "Optimizarea Core Web Vitals", description: "Un ghid practic pentru m\u0103surarea \u0219i \u00EEmbun\u0103t\u0103\u021Birea Core Web Vitals pentru o experien\u021B\u0103 de utilizare mai bun\u0103 \u0219i clasament SEO superior." },
          { _uid: uid(), component: "feature_card", icon: "code", title: "Next.js 15: Ce Este Nou", description: "O analiz\u0103 aprofundat\u0103 a celor mai recente func\u021Bionalit\u0103\u021Bi Next.js 15, inclusiv Server Components, rutare \u00EEmbun\u0103t\u0103\u021Bit\u0103 \u0219i c\u00E2\u0219tiguri de performan\u021B\u0103." },
          { _uid: uid(), component: "feature_card", icon: "shield", title: "Bune Practici de Securitate Web", description: "Practici esen\u021Biale de securitate pe care fiecare dezvoltator web ar trebui s\u0103 le implementeze pentru a proteja datele utilizatorilor." },
          { _uid: uid(), component: "feature_card", icon: "chart", title: "Decizii de Design Bazate pe Date", description: "Cum s\u0103 folose\u0219ti analitica \u0219i cercetarea utilizatorilor pentru a lua decizii de design care \u00EEmbun\u0103t\u0103\u021Besc engagement-ul \u0219i ratele de conversie." },
          { _uid: uid(), component: "feature_card", icon: "globe", title: "Globalizare: i18n \u00EEn Next.js", description: "Un ghid complet pentru implementarea interna\u021Bionaliz\u0103rii \u00EEn aplica\u021Bia ta Next.js pentru o audien\u021B\u0103 global\u0103." },
        ],
      },
    ],
  },
};

// ---------- i18n Merge Helper ----------
// Storyblok field-level translations use __i18n__<lang> suffix on field names.
// This function takes an English content object and a Romanian translation object
// (with the same structure) and merges them so that each translated field appears
// as fieldname__i18n__ro alongside the English fieldname in the same object.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeTranslations(en: any, ro: any, lang = "ro"): any {
  if (!ro) return en;
  if (Array.isArray(en) && Array.isArray(ro)) {
    // For arrays (e.g., body bloks, buttons, features), merge element by element
    return en.map((enItem: any, i: number) => {
      const roItem = ro[i];
      if (!roItem) return enItem;
      return mergeTranslations(enItem, roItem, lang);
    });
  }
  if (typeof en === "object" && en !== null && typeof ro === "object" && ro !== null && !Array.isArray(en)) {
    const result: any = { ...en };
    for (const key of Object.keys(ro)) {
      if (key === "_uid" || key === "component" || key === "fieldtype" || key === "linktype") {
        // Keep structural fields from English, skip from Romanian
        continue;
      }
      if (Array.isArray(en[key]) && Array.isArray(ro[key])) {
        // Recurse into arrays (nested bloks)
        result[key] = mergeTranslations(en[key], ro[key], lang);
      } else if (typeof en[key] === "object" && en[key] !== null && typeof ro[key] === "object" && ro[key] !== null && !Array.isArray(en[key])) {
        // For richtext objects, treat as a translated value (not recursive merge)
        if (en[key].type === "doc" || ro[key].type === "doc") {
          result[`${key}__i18n__${lang}`] = ro[key];
        } else {
          // Other objects: recurse
          result[key] = mergeTranslations(en[key], ro[key], lang);
        }
      } else {
        // Scalar field: add __i18n__ro variant
        result[`${key}__i18n__${lang}`] = ro[key];
      }
    }
    return result;
  }
  return en;
}

// ---------- Datasource: Form Labels ----------
// Reusable key-value pairs for form UI. Editors change these in one place
// and every page that uses a contact form picks them up automatically.

const formLabelsEntries: { name: string; value: string; ro: string }[] = [
  { name: "form_name_label", value: "Name", ro: "Nume" },
  { name: "form_name_placeholder", value: "Your name", ro: "Numele tău" },
  { name: "form_email_label", value: "Email", ro: "Email" },
  { name: "form_email_placeholder", value: "you@example.com", ro: "tu@exemplu.com" },
  { name: "form_message_label", value: "Message", ro: "Mesaj" },
  { name: "form_message_placeholder", value: "How can we help you?", ro: "Cum te putem ajuta?" },
  { name: "form_button_label", value: "Send Message", ro: "Trimite Mesajul" },
  { name: "form_success_title", value: "Thank you!", ro: "Mulțumim!" },
  { name: "form_success_message", value: "Your message has been received. We'll get back to you within one business day.", ro: "Mesajul tău a fost primit. Îți vom răspunde în termen de o zi lucrătoare." },
];

// ---------- Main ----------

async function main() {
  console.log("=== Storyblok Setup Script ===\n");

  // Step 0: Configure i18n on the Storyblok space
  console.log("[0/3] Configuring i18n (English + Romanian)...");
  try {
    await apiSafe("", "PUT", {
      space: {
        languages: [
          { code: "ro", name: "Romanian" },
        ],
      },
    });
    console.log("  \u2713 i18n configured: English (default) + Romanian\n");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`  Warning: Could not configure i18n: ${message}`);
    console.log("  This may already be configured. Continuing...\n");
  }
  await sleep(300);

  // Step 0.5: Create "form_labels" datasource with Romanian dimension
  console.log("[0.5/6] Creating form_labels datasource...");
  let datasourceId: number | null = null;
  let roDimensionId: number | null = null;

  // Check for existing datasource
  try {
    const { datasources } = await apiSafe("/datasources");
    for (const ds of datasources) {
      if (ds.slug === "form-labels") {
        datasourceId = ds.id;
        // Find Romanian dimension
        if (ds.dimensions) {
          for (const dim of ds.dimensions) {
            if (dim.entry_value === "ro") {
              roDimensionId = dim.id;
            }
          }
        }
        console.log(`  Datasource "form-labels" already exists (id: ${datasourceId})`);
      }
    }
  } catch {
    // No datasources yet
  }

  if (!datasourceId) {
    console.log("  Creating datasource: form-labels...");
    const dsRes = await apiSafe("/datasources", "POST", {
      datasource: {
        name: "Form Labels",
        slug: "form-labels",
        dimensions_attributes: [
          { name: "Romanian", entry_value: "ro" },
        ],
      },
    });
    datasourceId = dsRes.datasource.id;
    // Get dimension ID from created datasource
    if (dsRes.datasource.dimensions) {
      for (const dim of dsRes.datasource.dimensions) {
        if (dim.entry_value === "ro") {
          roDimensionId = dim.id;
        }
      }
    }
    console.log(`  ✓ Created datasource (id: ${datasourceId}, ro dim: ${roDimensionId})`);
    await sleep(300);
  }

  // If dimension not found, add it
  if (!roDimensionId && datasourceId) {
    console.log("  Adding Romanian dimension to datasource...");
    const dsUpdated = await apiSafe(`/datasources/${datasourceId}`, "PUT", {
      datasource: {
        dimensions_attributes: [
          { name: "Romanian", entry_value: "ro" },
        ],
      },
    });
    if (dsUpdated.datasource.dimensions) {
      for (const dim of dsUpdated.datasource.dimensions) {
        if (dim.entry_value === "ro") {
          roDimensionId = dim.id;
        }
      }
    }
    console.log(`  ✓ Romanian dimension id: ${roDimensionId}`);
    await sleep(300);
  }

  // Create/update datasource entries
  console.log("  Seeding form label entries...");

  // Fetch existing entries
  const existingEntries = new Map<string, number>();
  try {
    const { datasource_entries: entries } = await apiSafe(`/datasource_entries?datasource_id=${datasourceId}`);
    for (const entry of entries) {
      existingEntries.set(entry.name, entry.id);
    }
  } catch {
    // No entries yet
  }

  for (const entry of formLabelsEntries) {
    const existingEntryId = existingEntries.get(entry.name);

    if (existingEntryId) {
      // Update existing entry with default value
      console.log(`    Updating: ${entry.name} = "${entry.value}"`);
      await apiSafe(`/datasource_entries/${existingEntryId}`, "PUT", {
        datasource_entry: {
          name: entry.name,
          value: entry.value,
        },
      });
    } else {
      // Create new entry
      console.log(`    Creating: ${entry.name} = "${entry.value}"`);
      const entryRes = await apiSafe("/datasource_entries", "POST", {
        datasource_entry: {
          datasource_id: datasourceId,
          name: entry.name,
          value: entry.value,
        },
      });
      existingEntries.set(entry.name, entryRes.datasource_entry.id);
    }
    await sleep(200);

    // Set Romanian translation
    const entryId = existingEntries.get(entry.name)!;
    console.log(`    Setting RO: ${entry.name} = "${entry.ro}"`);
    await apiSafe(`/datasource_entries/${entryId}`, "PUT", {
      datasource_entry: {
        name: entry.name,
        value: entry.value,
        dimension_value: entry.ro,
      },
      dimension_id: roDimensionId,
    });
    await sleep(200);
  }
  console.log(`  ✓ ${formLabelsEntries.length} form label entries seeded with Romanian translations\n`);

  // Step 1: Fetch/create components
  console.log("[1/6] Fetching existing components...");
  const { components: existing } = await apiSafe("/components");
  const existingMap = new Map<string, number>();
  for (const comp of existing) {
    existingMap.set(comp.name, comp.id);
  }

  console.log("[2/3] Creating components with translatable fields...\n");
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
    await sleep(200);
  }

  // Step 3: Delete old flat stories that will move into folders
  console.log("\n[3/5] Cleaning up old flat stories...\n");

  const { stories: existingStoriesAll } = await apiSafe("/stories");
  const existingSlugsAll = new Map<string, { id: number; full_slug: string }>();
  for (const s of existingStoriesAll) {
    existingSlugsAll.set(s.slug, { id: s.id, full_slug: s.full_slug });
  }

  // Delete old flat stories that should now live in folders
  for (const story of pageStories) {
    const existing = existingSlugsAll.get(story.slug);
    if (existing && !existing.full_slug.startsWith("pages/")) {
      console.log(`  Deleting flat story: ${story.name} (/${story.slug}) → will recreate in pages/`);
      await apiSafe(`/stories/${existing.id}`, "DELETE");
      await sleep(300);
    }
  }

  // Step 4: Create "pages" folder for site hierarchy
  console.log("\n[4/5] Creating folder hierarchy...\n");

  // Check if pages folder already exists
  let pagesFolderId: number | null = null;
  try {
    const { stories: allStories } = await apiSafe("/stories?is_folder=1");
    for (const s of allStories) {
      if (s.slug === "pages" && s.is_folder) {
        pagesFolderId = s.id;
        console.log(`  📁 pages/ folder already exists (id: ${pagesFolderId})`);
      }
    }
  } catch {
    // No folders yet
  }

  if (!pagesFolderId) {
    console.log("  Creating 📁 pages/ folder...");
    const folderRes = await apiSafe("/stories", "POST", {
      story: {
        name: "Pages",
        slug: "pages",
        is_folder: true,
        default_root: "page",
      },
    });
    pagesFolderId = folderRes.story.id;
    console.log(`  ✓ Created pages/ folder (id: ${pagesFolderId})`);
    await sleep(300);
  }

  // Step 5: Create stories in their proper locations
  console.log("\n[5/5] Creating seed content with folder hierarchy (English + Romanian)...\n");

  // Re-fetch stories after deletions
  const { stories: currentStories } = await apiSafe("/stories");
  const currentSlugMap = new Map<string, { id: number; full_slug: string }>();
  for (const s of currentStories) {
    currentSlugMap.set(s.full_slug, { id: s.id, full_slug: s.full_slug });
  }

  // Create root-level stories (Config, Home)
  for (const story of rootStories) {
    const roTranslation = romanianTranslations[story.slug];
    const mergedContent = roTranslation
      ? mergeTranslations(story.content, roTranslation)
      : story.content;

    const payload = {
      story: {
        name: story.name,
        slug: story.slug,
        content: mergedContent,
      },
      publish: 1,
    };

    const existing = currentSlugMap.get(story.slug);
    if (existing) {
      console.log(`  Updating: ${story.name} (/${story.slug})`);
      await apiSafe(`/stories/${existing.id}`, "PUT", payload);
    } else {
      console.log(`  Creating: ${story.name} (/${story.slug})`);
      await apiSafe("/stories", "POST", payload);
    }
    await sleep(300);
  }

  // Create stories inside the pages/ folder
  for (const story of pageStories) {
    const roTranslation = romanianTranslations[story.slug];
    const mergedContent = roTranslation
      ? mergeTranslations(story.content, roTranslation)
      : story.content;

    const fullSlug = `pages/${story.slug}`;
    const payload = {
      story: {
        name: story.name,
        slug: story.slug,
        parent_id: pagesFolderId,
        content: mergedContent,
        // Clear any custom path so Storyblok uses full_slug for preview
        // Middleware handles stripping the pages/ prefix
        path: "",
      },
      publish: 1,
    };

    const existing = currentSlugMap.get(fullSlug);
    if (existing) {
      console.log(`  Updating: ${story.name} (/${fullSlug})`);
      await apiSafe(`/stories/${existing.id}`, "PUT", payload);
    } else {
      console.log(`  Creating: ${story.name} (/${fullSlug}) [in 📁 pages/]`);
      await apiSafe("/stories", "POST", payload);
    }
    await sleep(300);
  }

  console.log("\n✅ Setup complete! Your Storyblok space is ready with folder hierarchy + English + Romanian.");
  console.log("   Content structure:");
  console.log("   📁 Root");
  console.log("   ├── Config (settings)");
  console.log("   ├── Home (homepage)");
  console.log("   └── 📁 Pages");
  console.log("       ├── Services");
  console.log("       ├── About");
  console.log("       ├── Contact");
  console.log("       └── Blog");
  console.log("   Open the Storyblok editor to see your content.\n");
}

main().catch((err) => {
  console.error("\n\u274C Setup failed:", err.message);
  process.exit(1);
});
