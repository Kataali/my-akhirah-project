// src/app/(public)/about/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about My Akhirah Project and our mission to serve communities in Northern Ghana.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-earth-400 mb-3">Our story</p>
      <h1 className="section-heading mb-6">About My Akhirah Project</h1>

      <div className="prose prose-earth max-w-none text-earth-600 leading-relaxed space-y-5">
        <p className="text-lg text-earth-700">
          My Akhirah Project was born from a simple belief: that our actions in this world are seeds planted for the next. Every act of giving is an investment — not just in a community, but in one's own hereafter.
        </p>

        <p>
          We operate in Northern Ghana, one of the most underserved regions in the country. Remote villages here often lack access to clean water, adequate food, basic medicines, and educational materials. My Akhirah Project bridges this gap by connecting investors with specific, tangible campaigns.
        </p>

        <h2 className="font-display text-2xl font-bold text-earth-800 mt-8 mb-3">How we work</h2>
        <p>
          We identify communities with critical needs and build a detailed campaign around each one — specifying exactly what items are required, their cost, the number of beneficiaries, and the delivery timeline. Investors contribute to reach the funding goal, and we handle all logistics: procurement, transportation, and delivery to the community.
        </p>
        <p>
          Once a campaign is completed, we publish a full impact report with photos and details of what was delivered. Every contributor is notified. There are no black boxes — only transparent, verified impact.
        </p>

        <h2 className="font-display text-2xl font-bold text-earth-800 mt-8 mb-3">Our values</h2>
        <ul className="space-y-2">
          <li><strong className="text-earth-700">Transparency:</strong> Every campaign shows a detailed breakdown of costs. Every completed campaign has a public impact report.</li>
          <li><strong className="text-earth-700">Accountability:</strong> Funds go only to the campaign they were collected for.</li>
          <li><strong className="text-earth-700">Dignity:</strong> We treat every beneficiary community with the respect they deserve.</li>
          <li><strong className="text-earth-700">Continuity:</strong> Sadaqah jariyah — we design for lasting change, not one-time relief.</li>
        </ul>
      </div>
    </div>
  );
}
