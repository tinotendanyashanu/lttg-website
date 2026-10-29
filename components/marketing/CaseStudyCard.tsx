import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CaseStudy } from "@/data/case-studies";

export default function CaseStudyCard({
  study,
  index = 0,
}: {
  study: CaseStudy;
  index?: number;
}) {
  return (
    <Link
      href={`/portfolio/${study.id}`}
      className={`case-card case-${study.color} group`}
    >
      <div className="case-cover">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="case-type">{study.category}</span>
          <span className="font-mono opacity-60">0{index + 1}</span>
        </div>
        <div className="case-wordmark">
          {study.name}
          <span aria-hidden="true">↗</span>
        </div>
        <div className="case-flow" aria-label="Project capabilities">
          {study.capabilities.slice(0, 3).map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
      <div className="p-6 sm:p-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {study.engagement}
        </p>
        <h3 className="text-xl font-semibold leading-snug tracking-tight text-slate-950">
          {study.title}
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          {study.summary}
        </p>
        <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
          Read the case study{" "}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
