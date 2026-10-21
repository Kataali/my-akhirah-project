// src/app/(public)/privacy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how My Akhira Foundation collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-earth-400 mb-3">
        Legal & Trust
      </p>
      <h1 className="section-heading mb-6">Privacy Policy</h1>

      <div className="prose prose-earth max-w-none text-earth-600 leading-relaxed space-y-5">
        <p className="text-lg text-earth-700">
          At My Akhira Foundation, we respect your privacy and are committed to
          protecting the personal information you share with us when supporting
          communities across Northern Ghana.
        </p>

        <h2 className="font-display text-2xl font-bold text-earth-800 mt-8 mb-3">
          1. Information We Collect
        </h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            <strong className="text-earth-700">Account Information:</strong>{" "}
            When you create an investor account, we collect your email address
            and optional profile details (such as your full name and phone
            number).
          </li>
          <li>
            <strong className="text-earth-700">Contribution Details:</strong>{" "}
            When you contribute to a campaign (as a signed-in user or guest), we
            record the campaign supported, contribution amount, payment
            reference, and optional message of encouragement.
          </li>
        </ul>

        <h2 className="font-display text-2xl font-bold text-earth-800 mt-8 mb-3">
          2. Payment Security
        </h2>
        <p>
          All online payments (cards and mobile money) are processed securely by{" "}
          <strong className="text-earth-700">Paystack</strong>. My Akhira
          Foundation does not store your credit/debit card numbers or mobile
          money PINs on our servers.
        </p>

        <h2 className="font-display text-2xl font-bold text-earth-800 mt-8 mb-3">
          3. How We Use Your Information
        </h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>To send instant email receipts for your contributions.</li>
          <li>
            To notify you when a campaign you supported is completed and its
            Impact Report is published.
          </li>
          <li>
            To display your personal contribution history inside your Investor
            Dashboard.
          </li>
        </ul>

        <h2 className="font-display text-2xl font-bold text-earth-800 mt-8 mb-3">
          4. Anonymous Contributions
        </h2>
        <p>
          If you choose to contribute anonymously or as a guest without a name,
          your identity will never be displayed publicly. Your email is used
          solely to deliver your transactional donation receipt and impact
          updates.
        </p>

        <h2 className="font-display text-2xl font-bold text-earth-800 mt-8 mb-3">
          5. Contact Us
        </h2>
        <p>
          If you have any questions about this Privacy Policy or wish to request
          deletion of your account data, please contact us at{" "}
          <a
            href="mailto:info@myakhirahproject.org"
            className="text-earth-700 font-semibold underline"
          >
            info@myakhirahproject.org
          </a>
          .
        </p>
      </div>
    </div>
  );
}
