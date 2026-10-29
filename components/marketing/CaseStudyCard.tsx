import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { CaseStudy } from "@/data/case-studies";

export default function CaseStudyCard({
  study,
  index = 0,
  columns = 3,
}: {
  study: CaseStudy;
  index?: number;
  columns?: 2 | 3;
}) {
  return (
    <Link
      href={`/portfolio/${study.id}`}
      className={`case-card case-${study.color} group`}
    >
      <div className="case-cover">
        <Image
          src={study.image.src}
          alt={study.image.alt}
          fill
          sizes={
            columns === 2
              ? "(min-width: 1280px) 588px, (min-width: 768px) 47vw, 94vw"
              : "(min-width: 1280px) 384px, (min-width: 1024px) 32vw, 94vw"
          }
          className="case-cover-image object-cover"
          quality={80}
        />
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="case-type">{study.category}</span>
          <span className="case-index" aria-hidden="true">
            0{index + 1}
          </span>
        </div>
        <div className="case-wordmark">
          {study.name}
          <ArrowUpRight aria-hidden="true" className="h-7 w-7" />
        </div>
        <p className="case-context">Industry illustration</p>
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
