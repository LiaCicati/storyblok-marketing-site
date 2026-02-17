# Storyblok Marketing Site

A fully featured marketing website built with **Next.js 15** (App Router, Server Components) and **Storyblok** headless CMS, styled with **Tailwind CSS 4**.

## Features

- Catch-all dynamic routing resolves any Storyblok slug
- ISR with 60-second revalidation for near-instant content updates
- Storyblok Visual Editor / Bridge support via draft mode
- 15+ reusable, nestable blok components
- Mobile-first responsive design with accessible markup
- Global navigation from a Storyblok config story
- Automated setup script that creates all bloks and seed content

## Tech Stack

| Layer     | Technology                           |
| --------- | ------------------------------------ |
| Framework | Next.js 15 (App Router, TypeScript)  |
| CMS       | Storyblok (headless, visual editing) |
| Styling   | Tailwind CSS 4                       |
| Runtime   | React 19 (Server Components)         |

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Storyblok space

1. Sign up at [app.storyblok.com](https://app.storyblok.com)
2. Create a new space (select the US or EU region — the setup defaults to US)
3. Go to **Settings > Access Tokens** and copy your **Preview** token
4. Go to **Settings > General** and note your **Space ID**
5. Generate a **Personal Access Token** at [app.storyblok.com/#/me/account?tab=token](https://app.storyblok.com/#/me/account?tab=token)

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```
STORYBLOK_API_TOKEN=your_preview_token
STORYBLOK_PERSONAL_TOKEN=your_personal_access_token
STORYBLOK_SPACE_ID=your_space_id
```

Also add the preview token as a public env var for the client-side bridge:

```
NEXT_PUBLIC_STORYBLOK_API_TOKEN=your_preview_token
```

### 4. Run the setup script

This creates all component blueprints and seed content in your Storyblok space:

```bash
npm run setup-storyblok
```

The script will:

- Create 20+ component definitions (bloks) in your space
- Create seed content for Home, Services, About, Contact, and Blog pages
- Create a global Config story with navigation and footer data
- Publish all content automatically

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your site.

## Enabling the Visual Editor

To use Storyblok's real-time visual editing:

1. In your Storyblok space, go to **Settings > Visual Editor**
2. Set the **Preview URL** to: `https://localhost:3000/`
3. For local development, you may need to use an HTTPS proxy or configure the Storyblok preview to accept HTTP
4. Open any story in Storyblok and click **Visual Editor** — you'll see your Next.js site with live editing overlays

### Draft Mode

The app includes draft mode routes:

- **Enable**: `GET /draft?slug=/your-page`
- **Disable**: `GET /disable-draft?slug=/your-page`

When draft mode is active, content is fetched in "draft" version, showing unpublished changes.

## Project Structure

```
storyblok-marketing-site/
├── app/
│   ├── [[...slug]]/
│   │   └── page.tsx          # Catch-all dynamic route
│   ├── draft/
│   │   └── route.ts          # Enable draft mode
│   ├── disable-draft/
│   │   └── route.ts          # Disable draft mode
│   ├── globals.css            # Tailwind imports & theme
│   ├── layout.tsx             # Root layout (fetches config)
│   └── not-found.tsx          # 404 page
├── components/
│   ├── bloks/                 # One file per Storyblok blok
│   │   ├── BlogPost.tsx
│   │   ├── CallToAction.tsx
│   │   ├── ContactForm.tsx
│   │   ├── FAQ.tsx
│   │   ├── FeatureCard.tsx
│   │   ├── FeatureGrid.tsx
│   │   ├── Hero.tsx
│   │   ├── LogoCloud.tsx
│   │   ├── Page.tsx
│   │   ├── PricingCard.tsx
│   │   ├── PricingTable.tsx
│   │   ├── RichTextBlock.tsx
│   │   ├── TestimonialCard.tsx
│   │   ├── Testimonials.tsx
│   │   └── TextWithImage.tsx
│   ├── layout/
│   │   ├── Header.tsx         # Responsive header with mobile menu
│   │   └── Footer.tsx         # Multi-column footer
│   └── StoryblokProvider.tsx  # Client component, registers all bloks
├── lib/
│   ├── storyblok.ts           # API helpers (fetchStory, fetchConfig, etc.)
│   └── types.ts               # TypeScript interfaces for all bloks
├── scripts/
│   └── setup-storyblok.ts     # Creates bloks & seed content via Management API
├── .env.example
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## Blok Components

| Blok             | Description                                    |
| ---------------- | ---------------------------------------------- |
| `hero`           | Headline, subheadline, CTA buttons, background |
| `feature_grid`   | Title + grid of feature cards                  |
| `feature_card`   | Icon, title, description (nestable)            |
| `text_with_image` | Rich text + image, configurable layout        |
| `testimonials`   | Title + grid of testimonial cards              |
| `testimonial_card` | Quote, author, role, avatar (nestable)       |
| `call_to_action` | Headline, body, CTA button                     |
| `pricing_table`  | Title + grid of pricing cards                  |
| `pricing_card`   | Plan name, price, features, CTA (nestable)     |
| `contact_form`   | Name, email, message fields (client-side)      |
| `logo_cloud`     | Title + array of partner logos                 |
| `faq`            | Title + accordion of Q&A items                 |
| `rich_text_block` | Renders Storyblok richtext content            |
| `blog_post`      | Full blog post with featured image             |

## Pages (Seed Content)

| Page       | URL         | Bloks Used                                              |
| ---------- | ----------- | ------------------------------------------------------- |
| Home       | `/`         | Hero, LogoCloud, FeatureGrid, TextWithImage, Testimonials, CTA |
| Services   | `/services` | Hero, FeatureGrid, PricingTable, CTA                    |
| About      | `/about`    | Hero, TextWithImage, FeatureGrid, Testimonials          |
| Contact    | `/contact`  | Hero, ContactForm, FAQ                                  |
| Blog       | `/blog`     | Hero, FeatureGrid (as post stubs)                       |

## Region Configuration

The Storyblok SDK defaults to the **US** region. If your space is in the EU region, update the `region` in `lib/storyblok.ts`:

```ts
apiOptions: {
  region: "eu", // change from "us" to "eu"
},
```

## Customization

- **Colors**: Edit the theme variables in `app/globals.css` under `@theme`
- **Components**: Each blok is self-contained in `components/bloks/` — modify or add new ones
- **Navigation**: Edit the Config story in Storyblok to update header/footer links
- **New pages**: Create new stories with the `page` content type in Storyblok — they'll automatically render via the catch-all route
