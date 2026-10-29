import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { primaryServices } from "@/data/case-studies";

export default function PrimaryServices() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {primaryServices.map((service) => (
        <article key={service.id} className="service-panel" id={service.id}>
          <span className="font-mono text-sm text-emerald-700">
            /{service.number}
          </span>
          <h3 className="mt-8 text-2xl font-semibold tracking-tight text-slate-950">
            <Link href={service.href}>{service.name}</Link>
          </h3>
          <p className="mt-4 leading-relaxed text-slate-600">
            {service.description}
          </p>
          <ul className="my-7 space-y-3">
            {service.items.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-slate-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-slate-950"
            href={service.href}
          >
            Explore this service <ArrowUpRight className="h-4 w-4" />
          </Link>
        </article>
      ))}
    </div>
  );
}
