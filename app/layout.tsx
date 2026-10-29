import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeoTheTechGuy | Custom Business Software & Automation",
  description:
    "Custom business software, web and mobile products, and practical AI automation. Work directly with Leo in Warsaw, Poland, serving businesses worldwide.",
  metadataBase: new URL("https://leothetechguy.com"),
  openGraph: {
    title: "LeoTheTechGuy | Software that makes your business work better",
    description:
      "Custom platforms, mobile apps and automation built around the way your business works.",
    siteName: "LeoTheTechGuy",
    type: "website",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
    creator: "@LeoTheTechGuy",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "LeoTheTechGuy",
  alternateName: "Tinotenda Nyashanu",
  url: "https://leothetechguy.com",
  image: "https://leothetechguy.com/images/leos-portrait.png",
  sameAs: [
    "https://instagram.com/leothetechguy",
    "https://x.com/LeoTheTechGuy",
    "https://www.youtube.com/@LeoTheTechGuy",
    "https://discord.gg/6rW46Cdf",
  ],
  jobTitle: "Software Engineer",
  worksFor: {
    "@type": "Organization",
    name: "LeoTheTechGuy",
  },
  knowsAbout: [
    "Artificial Intelligence",
    "Cybersecurity",
    "Software Engineering",
    "Full Stack Development",
    "Automation",
  ],
  description:
    "LeoTheTechGuy is a technologist driven by one core principle: technology must work in the real world. Rather than chasing trends or titles, he focuses on understanding problems deeply and building systems designed to last.",
};

import AnalyticsTracker from "@/components/AnalyticsTracker";
import CookieConsent from "@/components/CookieConsent";
import ChatWidget from "@/components/ChatWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.className} bg-zinc-50 text-slate-800 relative overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900`}
        suppressHydrationWarning
      >
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <React.Suspense fallback={null}>
          <AnalyticsTracker />
        </React.Suspense>
        <CookieConsent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
