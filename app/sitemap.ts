import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { caseStudies } from "@/data/case-studies";
import { services } from "@/data/services";
import { businessServices } from "@/data/business-services";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/about",
    "/services",
    "/portfolio",
    "/how-i-work",
    "/contact",
    "/book",
    ...new Set(
      [...caseStudies, ...projects].map(
        (project) => `/portfolio/${project.id}`,
      ),
    ),
    ...new Set(
      [...services, ...businessServices].map(
        (service) => `/services/${service.id}`,
      ),
    ),
  ];
  return paths.map((path) => ({
    url: `https://leothetechguy.com${path}`,
    changeFrequency: "monthly",
    priority:
      path === ""
        ? 1
        : path.includes("/services/") || path.includes("/portfolio/")
          ? 0.7
          : 0.8,
  }));
}
