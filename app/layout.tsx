import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Leo The Tech Guy | AI & Digital Infrastructure Architect",
  description: "Leo The Tech Guy designs AI-powered business systems, builds scalable SaaS platforms, and deploys enterprise-grade infrastructure. The strategic partner for SMEs, Startups, and Enterprises.",
  keywords: ["AI Architect", "Digital Infrastructure", "SaaS Development", "Enterprise AI", "Cloud Architecture", "System Automation", "Leo The Tech Guy", "Tinotenda Nyashanu"],
  metadataBase: new URL("https://leothetechguy.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Leo The Tech Guy | AI & Digital Infrastructure Architect",
    description: "Building scalable AI systems and digital infrastructure for forward-thinking businesses. From MVP to Enterprise.",
    url: "https://leothetechguy.com",
    siteName: "Leo The Tech Guy",
    type: "website",
    images: [
      {
        url: "/images/linkimage.png",
        width: 1200,
        height: 630,
        alt: "Leo The Tech Guy - AI & Digital Infrastructure Architect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Leo The Tech Guy | AI & Digital Infrastructure Architect",
    description: "Building scalable AI systems and digital infrastructure for forward-thinking businesses.",
    images: ["/images/linkimage.png"],
    creator: "@LeoTheTechGuy",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "LeoTheTechGuy",
  "alternateName": "Tinotenda Nyashanu",
  "url": "https://leothetechguy.com",
  "image": "https://leothetechguy.com/images/linkimage.png",
  "sameAs": [
    "https://instagram.com/leothetechguy",
    "https://x.com/LeoTheTechGuy",
    "https://www.youtube.com/@LeoTheTechGuy"
  ],
  "jobTitle": "Creative Technologist",
  "worksFor": {
    "@type": "Organization",
    "name": "LeoTheTechGuy"
  },
  "knowsAbout": ["Artificial Intelligence", "Cybersecurity", "Software Engineering", "Full Stack Development", "Automation"],
  "description": "LeoTheTechGuy is a technologist driven by one core principle: technology must work in the real world. Rather than chasing trends or titles, he focuses on understanding problems deeply and building systems designed to last."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} bg-zinc-50 text-slate-800 relative overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
