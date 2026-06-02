// src/app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4 } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/ui/Providers";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "My Akhirah Project",
    template: "%s | My Akhirah Project",
  },
  description:
    "Connecting investors with communities in Northern Ghana. Every contribution delivers essential items to those who need them most.",
  keywords: ["charity", "Ghana", "northern Ghana", "donation", "Islamic charity", "akhirah", "sadaqah"],
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: "https://myakhirahproject.org",
    siteName: "My Akhirah Project",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSerif.variable}`}>
      <body className="font-body bg-sand-50 text-earth-900 antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "var(--font-body)",
                borderRadius: "8px",
                background: "#fdf6ee",
                color: "#572e19",
                border: "1px solid #e6aa5a",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
