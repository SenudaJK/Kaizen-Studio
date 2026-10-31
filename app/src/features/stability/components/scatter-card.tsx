"use client";

import { useMemo, useState } from "react";
import { Card, SectionHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/field";
import { Term } from "@/features/glossary/term";
import { cn } from "@/lib/cn";
import { MIN_PAIRS, describeCorrelation, directionOf, formatR, linearFit, pairByDate, strengthOf } from "../domain/correlation";
import type { SpcMetricDto } from "../types";
import { ScatterChart } from "./scatter-chart";

const label = (m: SpcMetricDto) => (m.unit ? `${m.name} (${m.unit})` : m.name);

const STRENGTH_LABEL = { strong: "Strong", moderate: "Moderate", weak: "Weak", none: "No clear link" } as const;

/** Basic tool: the scatter diagram. Pairs two metrics by day and shows whether they move together. */
export function ScatterCard({ metrics }: { metrics: SpcMetricDto[] }) {
  const [xId, setXId] = useState(metrics[0]?.id);
  const [yId, setYId] = useState(metrics[1]?.id);

  const x = metrics.find((m) => m.id === xId) ?? metrics[0];
  // Comparing a metric with itself is meaningless, so Y always falls back to a different one.
  const y = metrics.find((m) => m.id === yId && m.id !== x?.id) ?? metrics.find((m) => m.id !== x?.id);

  const pairs = useMemo(() => (x && y ? pairByDate(x.readings, y.readings) : []), [x, y]);
  const fit = useMemo(() => linearFit(pairs), [pairs]);

  const header = (
    <SectionHeader
      eyebrow={<>Basic tool · <Term k="scatter">Scatter diagram</Term></>}
      tone="terracotta"
      title="Does one thing move another?"
      description="Pick two numbers. Each dot is a day. If the dots form a line, one may be worth changing to improve the other."
    />
  );

  if (metrics.length < 2 || !x || !y) {
    return (
      <Card>
        {header}
        <EmptyState
          icon={<span className="font-mono text-sm">r</span>}
          title="Track two numbers to compare them"
          description="Add a second metric above, log both on the same days, and the scatter diagram appears here."
        />
      </Card>
    );
  }

  const strength = fit ? strengthOf(fit.r) : null;
  const direction = fit ? directionOf(fit.r) : null;
  const tone = strength === null || strength === "none" ? "slate" : direction === "positive" ? "sage" : "terracotta";
  const takeaway = fit ? describeCorrelation({ fit, xName: x.name, yName: y.name, xUnit: x.unit, yUnit: y.unit }) : null;

  return (
    <Card>
      {header}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <label className="flex items-center gap-2 text-xs font-semibold text-espresso">
          X
          <Select value={x.id} onChange={(e) => setXId(e.target.value)} className="py-2! text-xs font-semibold w-auto" aria-label="Metric on the X axis">
            {metrics.map((m) => <option key={m.id} value={m.id}>{label(m)}</option>)}
          </Select>
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold text-espresso">
          Y
          <Select value={y.id} onChange={(e) => setYId(e.target.value)} className="py-2! text-xs font-semibold w-auto" aria-label="Metric on the Y axis">
            {metrics.filter((m) => m.id !== x.id).map((m) => <option key={m.id} value={m.id}>{label(m)}</option>)}
          </Select>
        </label>
        {fit && strength && (
          <span
            className={cn(
              "font-mono text-xs font-semibold px-3 py-2 rounded-xl border",
              tone === "sage" && "bg-sageLight text-sage border-sage/20",
              tone === "terracotta" && "bg-terracottaLight text-terracotta border-terracotta/20",
              tone === "slate" && "bg-stone text-slateWarm border-stoneDark",
            )}
          >
            <Term k="correlation">r</Term> = {formatR(fit.r)} · {strength === "none" ? STRENGTH_LABEL.none : `${STRENGTH_LABEL[strength]} ${direction}`}
          </span>
        )}
      </div>

      {pairs.length === 0 ? (
        <EmptyState
          icon={<span className="font-mono text-sm">0</span>}
          title="No shared days yet"
          description={`Log ${x.name} and ${y.name} on the same days. You need at least ${MIN_PAIRS} days with both.`}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 w-full min-w-0">
            <ScatterChart pairs={pairs} fit={fit} xLabel={label(x)} yLabel={label(y)} tone={tone} />
          </div>
          <div className="lg:col-span-4 bg-paper p-5 rounded-2xl border border-stoneDark space-y-3">
            <div className="font-mono text-[11px] uppercase tracking-wider text-slateWarm">What it says</div>
            {takeaway ? (
              <>
                <h3 className="font-serif text-2xl text-espresso leading-snug">{takeaway.title}</h3>
                <p className="text-xs text-slateWarm leading-relaxed">{takeaway.detail}</p>
              </>
            ) : (
              <p className="text-xs text-slateWarm leading-relaxed">
                {pairs.length < MIN_PAIRS
                  ? `${MIN_PAIRS - pairs.length} more shared day${MIN_PAIRS - pairs.length === 1 ? "" : "s"} and we can say whether they move together.`
                  : `One of these numbers hasn't changed across your shared days, so there's nothing to compare yet.`}
              </p>
            )}
            <div className="pt-3 border-t border-stoneDark flex items-center justify-between text-[11px] font-mono text-slateWarm">
              <span>{pairs.length} shared days</span>
              {fit && <span>R² = {fit.rSquared.toFixed(2)}</span>}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
