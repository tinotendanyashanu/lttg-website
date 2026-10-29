import type { Metadata } from "next";

export function marketingMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title: `${title} | LeoTheTechGuy`,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | LeoTheTechGuy`,
      description,
      url: path,
      type: "website",
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | LeoTheTechGuy`,
      description,
      images: ["/opengraph-image"],
    },
  };
}
