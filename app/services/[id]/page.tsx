import { notFound } from "next/navigation";
import { services, getServiceById } from "@/data/services";
import ServiceDetailClient from "@/components/ServiceDetailClient";
import { businessServices } from "@/data/business-services";
import BusinessServicePage from "@/components/marketing/BusinessServicePage";
import { marketingMetadata } from "@/lib/marketing-metadata";

export const dynamicParams = false;

// Generate static params for all services
export function generateStaticParams() {
  return [...services, ...businessServices].map((service) => ({
    id: service.id,
  }));
}

// Generate metadata for each service page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const businessService = businessServices.find((service) => service.id === id);
  if (businessService)
    return marketingMetadata(
      businessService.title,
      businessService.description,
      `/services/${id}`,
    );
  const service = getServiceById(id);

  if (!service) {
    return {
      title: "Service Not Found | LeoTheTechGuy",
    };
  }

  return {
    title: `${service.title} | Leo The Tech Guy`,
    description: service.description,
    alternates: { canonical: `/services/${id}` },
    openGraph: {
      title: `${service.title} | Leo The Tech Guy`,
      description: service.description,
      url: `https://leothetechguy.com/services/${service.id}`,
      images: [{ url: service.image, alt: service.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.title} | Leo The Tech Guy`,
      description: service.description,
      images: [service.image],
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const businessService = businessServices.find((service) => service.id === id);
  if (businessService) return <BusinessServicePage service={businessService} />;
  const service = getServiceById(id);

  if (!service) {
    notFound();
  }

  return <ServiceDetailClient service={service} />;
}
