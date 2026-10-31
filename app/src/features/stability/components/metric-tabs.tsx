"use client";

import Link from "next/link";
import { useState } from "react";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { cn } from "@/lib/cn";
import { AddMetricDialog } from "./add-metric-dialog";

/** Pill tabs for choosing which metric the control chart shows, plus the "add" entry point. */
export function MetricTabs({
  metrics,
  activeKey,
  basePath,
}: {
  metrics: ReadonlyArray<{ key: string; name: string; unit: string }>;
  activeKey: string;
  basePath: string;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2 self-start">
      <nav aria-label="Metrics" className="inline-flex flex-wrap bg-stone p-1 rounded-xl border border-stoneDark">
        {metrics.map((metric) => {
          const active = metric.key === activeKey;
          return (
            <Link
              key={metric.key}
              href={`${basePath}?metric=${encodeURIComponent(metric.key)}`}
              scroll={false}
              aria-current={active ? "true" : undefined}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition",
                active ? "bg-ivory text-espresso shadow-sm" : "text-slateWarm hover:text-espresso",
              )}
            >
              {metric.name}
              {metric.unit && <span className="text-slateWarm font-normal"> ({metric.unit})</span>}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-xl bg-ivory hover:bg-stone border border-stoneDark text-espresso transition"
      >
        <PlusIcon size={14} /> Track another
      </button>
      <AddMetricDialog open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}
