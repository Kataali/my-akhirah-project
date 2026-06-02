// src/components/layout/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-earth-900 text-earth-200">
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <p className="font-display text-xl font-bold text-white mb-3">My Akhirah Project</p>
          <p className="text-sm text-earth-300 leading-relaxed">
            Connecting generous investors with communities in Northern Ghana. Every contribution is a sadaqah jariyah — a charity that keeps giving.
          </p>
        </div>

        <div>
          <p className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Explore</p>
          <ul className="space-y-2 text-sm">
            {[
              ["Campaigns", "/campaigns"],
              ["Impact Reports", "/impact"],
              ["About Us", "/about"],
              ["Invest Now", "/campaigns"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="text-earth-300 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Contact</p>
          <ul className="space-y-2 text-sm text-earth-300">
            <li>info@myakhirahproject.org</li>
            <li>Northern Ghana, GH</li>
          </ul>
          <p className="mt-6 text-xs text-earth-500">
            © {new Date().getFullYear()} My Akhirah Project. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
