import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EngagementCTA from "@/components/marketing/EngagementCTA";
import { caseStudies } from "@/data/case-studies";
import { projects } from "@/data/projects";
import { marketingMetadata } from "@/lib/marketing-metadata";

type Props = { params: Promise<{ id: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return [
    ...new Set([...caseStudies.map((p) => p.id), ...projects.map((p) => p.id)]),
  ].map((id) => ({ id }));
}
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const project =
    caseStudies.find((p) => p.id === id) ?? projects.find((p) => p.id === id);
  if (!project) return { title: "Project not found | LeoTheTechGuy" };
  return marketingMetadata(
    "name" in project ? `${project.name} Case Study` : project.title,
    "summary" in project ? project.summary : project.description,
    `/portfolio/${id}`,
  );
}
export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const study = caseStudies.find((p) => p.id === id);
  const project = projects.find((p) => p.id === id);
  if (!study && !project) notFound();
  const name = study?.name ?? project!.title;
  return (
    <div className="marketing-site">
      <Navbar />
      <main id="main-content">
        <section className="marketing-page-hero border-b border-slate-200 bg-slate-50">
          <div className="marketing-container">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm text-slate-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to the work
            </Link>
            <p className="marketing-eyebrow mt-10">
              {study?.category ?? project!.category} ·{" "}
              {study?.engagement ?? project!.status}
            </p>
            <h1 className="marketing-heading mt-5 max-w-4xl !text-[clamp(2.5rem,5vw,4.5rem)]">
              {study?.title ?? name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              {study?.summary ?? project!.description}
            </p>
          </div>
        </section>
        {study ? (
          <section className="marketing-section">
            <div className="marketing-container grid gap-12 lg:grid-cols-[1fr_320px]">
              <div className="space-y-12">
                {[
                  {
                    label: "01 / THE BUSINESS PROBLEM",
                    title: "The work that needed a better system.",
                    text: study.problem,
                  },
                  {
                    label: "02 / THE SOLUTION",
                    title: "Software shaped around the workflow.",
                    text: study.solution,
                  },
                  {
                    label: "03 / THE ENGINEERING",
                    title: "My involvement.",
                    text: study.involvement,
                  },
                  {
                    label: "04 / THE BUSINESS APPLICATION",
                    title: "What the platform brings together.",
                    text: study.delivery,
                  },
                ].map((section) => (
                  <section key={section.label}>
                    <p className="marketing-eyebrow">{section.label}</p>
                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                      {section.title}
                    </h2>
                    <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
                      {section.text}
                    </p>
                  </section>
                ))}
                <p className="border-l-2 border-emerald-600 pl-5 text-sm leading-relaxed text-slate-500">
                  {study.scopeNote}
                </p>
              </div>
              <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50 p-7">
                <p className="marketing-eyebrow">{name}</p>
                <h2 className="mt-4 text-lg font-semibold">
                  Workflow coverage
                </h2>
                <ul className="mt-6 space-y-4">
                  {study.capabilities.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-sm text-slate-600"
                    >
                      <Check className="h-4 w-4 shrink-0 text-emerald-700" />
                      {item}
                    </li>
                  ))}
                </ul>
                <h3 className="mt-9 text-sm font-semibold">Relevant for</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {study.audience}.
                </p>
                <Link
                  href={`/contact?project=${encodeURIComponent(name)}&source=case-study`}
                  className="marketing-button button-dark mt-8 w-full"
                >
                  Discuss a similar project <ArrowUpRight className="h-4 w-4" />
                </Link>
              </aside>
            </div>
          </section>
        ) : (
          <section className="marketing-section">
            <div className="marketing-container max-w-3xl">
              <p className="marketing-eyebrow">PROJECT OVERVIEW</p>
              <h2 className="marketing-heading mt-4">{name}</h2>
              <p className="mt-6 leading-relaxed text-slate-600">
                {project!.description}
              </p>
              <p className="mt-4 text-sm text-slate-600">
                Published project status: <strong>{project!.status}</strong>
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {project!.tags.map((tag) => (
                  <span
                    className="rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-600"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {(project!.liveUrl ?? project!.link) && (
                <a
                  href={project!.liveUrl ?? project!.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="marketing-button button-dark mt-9"
                >
                  Visit project website <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
              <p className="mt-6 text-sm text-slate-500">
                The linked website may show the current product beyond the scope
                of this portfolio entry.
              </p>
            </div>
          </section>
        )}
        <EngagementCTA />
      </main>
      <Footer />
    </div>
  );
}
