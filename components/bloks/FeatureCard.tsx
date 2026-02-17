import { storyblokEditable } from "@storyblok/react/rsc";
import type { FeatureCardBlok } from "@/lib/types";

const iconMap: Record<string, string> = {
  rocket: "🚀",
  shield: "🛡️",
  chart: "📊",
  globe: "🌍",
  lightning: "⚡",
  heart: "❤️",
  star: "⭐",
  gear: "⚙️",
  users: "👥",
  lock: "🔒",
  code: "💻",
  cloud: "☁️",
};

export default function FeatureCard({ blok }: { blok: FeatureCardBlok }) {
  const icon = iconMap[blok.icon] || blok.icon || "✨";

  return (
    <div
      {...storyblokEditable(blok)}
      className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200"
    >
      <div className="text-4xl mb-4" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{blok.title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{blok.description}</p>
    </div>
  );
}
