"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/data/projects";

export default function ProjectGallery() {
  const [category, setCategory] = useState("All");
  const secondary = projects.filter((project) => project.id !== "swipee");
  const categories = [
    "All",
    ...new Set(secondary.map((project) => project.category)),
  ];
  return (
    <section className="marketing-section border-t border-slate-200 bg-slate-50">
      <div className="marketing-container">
        <p className="marketing-eyebrow">MORE FROM THE PORTFOLIO</p>
        <h2 className="marketing-heading mt-4">
          Products, platforms & experiments.
        </h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-slate-600">
          A broader selection of work. Each project retains its published
          status, including pilots, prototypes and demonstrations.
        </p>
        <div
          className="my-9 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter projects by category"
        >
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              className={`min-h-11 rounded-full border px-4 py-2 text-xs font-medium ${category === item ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-500"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {secondary
            .filter(
              (project) => category === "All" || category === project.category,
            )
            .map((project) => (
              <Link
                href={`/portfolio/${project.id}`}
                className="rounded-xl border border-slate-200 bg-white p-7 transition-colors hover:border-emerald-600"
                key={project.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <project.icon className="h-5 w-5 text-emerald-700" />
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {project.status}
                  </span>
                </div>
                <h3 className="mt-7 text-xl font-semibold text-slate-950">
                  {project.title}
                </h3>
                <p className="mt-2 text-xs text-emerald-700">
                  {project.category}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {project.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold">
                  Explore project <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}
