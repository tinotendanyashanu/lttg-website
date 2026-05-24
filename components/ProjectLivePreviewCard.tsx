"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, Maximize2, RefreshCcw } from "lucide-react";

import { Project } from "@/data/projects";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ProjectLivePreviewCardProps {
  project: Project;
}

function getDisplayHost(url?: string) {
  if (!url) {
    return "Preview unavailable";
  }

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function ProjectLivePreviewCard({
  project,
}: ProjectLivePreviewCardProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const liveUrl = project.liveUrl ?? project.link;
  const previewUrl = project.previewUrl ?? liveUrl;
  const canEmbed = Boolean(previewUrl && project.previewEmbeddable !== false);
  const host = useMemo(() => getDisplayHost(liveUrl), [liveUrl]);
  const isLarge = project.size === "large";

  const statusClassName =
    project.status === "Live"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : project.status === "Prototype" || project.status === "Pilot"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35 }}
      className={cn(isLarge && "md:col-span-2")}
    >
      <Card className="group h-full overflow-hidden border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-200/70">
        <CardHeader className="gap-4 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-slate-700",
                  project.gradient
                )}
              >
                <project.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold tracking-tight text-slate-950">
                  {project.title}
                </h3>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {project.category}
                </p>
              </div>
            </div>

            <Badge className={cn("shrink-0", statusClassName)}>
              {project.status}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 text-sm text-slate-500">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span className="align-middle">{host}</span>
            </div>

            <div className="flex items-center gap-2">
              {canEmbed && (
                <button
                  type="button"
                  aria-label={`Reload ${project.title} preview`}
                  onClick={() => {
                    setIsLoaded(false);
                    setRefreshKey((current) => current + 1);
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
              )}

              {liveUrl && (
                <Link
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${project.title} live site`}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  <span>Open</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="border-b border-slate-200 bg-slate-100 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <div className="ml-2 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                <span className="block truncate">{previewUrl ?? host}</span>
              </div>
              {liveUrl && (
                <Link
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Expand ${project.title}`}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white hover:text-slate-950"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>

          <div
            className={cn(
              "relative bg-slate-950",
              isLarge ? "aspect-[16/9]" : "aspect-[4/3]"
            )}
          >
            {canEmbed && previewUrl ? (
              <>
                {!isLoaded && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950 text-sm text-white/70">
                    Loading live preview...
                  </div>
                )}
                <iframe
                  key={`${project.id}-${refreshKey}`}
                  title={`${project.title} live preview`}
                  src={previewUrl}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  sandbox="allow-downloads allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                  onLoad={() => setIsLoaded(true)}
                  className="h-full w-full bg-white"
                />
              </>
            ) : (
              <div
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br p-6 text-center",
                  project.gradient
                )}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/85 text-slate-800 shadow-sm">
                  <project.icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-950">
                    Open the live project
                  </p>
                  <p className="mt-1 max-w-sm text-sm text-slate-600">
                    This site blocks embedded frames, but the live version is
                    available to launch and interact with.
                  </p>
                </div>
                {liveUrl && (
                  <Link
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-950 shadow-sm transition-colors hover:bg-slate-50"
                  >
                    Open live site
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
