"use client";

import { useContainerWidth } from "@/hooks/use-container-width";
import { formatShortDate } from "@/lib/dates";
import type { ControlLimits, ChartPoint, SpecDirection } from "../domain/control-limits";

const LEFT = 52;
const TOP = 22;
const BOTTOM = 220;
const HEIGHT = BOTTOM - TOP;

const DESIGN_WIDTH = 760;
const MIN_WIDTH = 320;
/** Space right of the plot for the UCL / X̄ / LCL labels. */
const RIGHT_MARGIN = 65;
/** Horizontal room each x-axis date needs, and each value label needs. */
const DATE_SLOT = 56;
const VALUE_SLOT = 34;

const fmt = (value: number) => (Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1));

/**
 * Individuals control chart. Dashed lines are the control limits (what your process normally does),
 * the amber line is your own target. Pure SVG: renders on the server with no client JS.
 * Special Causes are marked with a ring and a label, not by colour alone.
 */
export function ControlChart({
  points,
  limits,
  specLimit,
  specDirection,
  unit,
  metricName,
}: {
  points: ChartPoint[];
  limits: ControlLimits | null;
  specLimit: number;
  specDirection: SpecDirection;
  unit: string;
  metricName: string;
}) {
  const [frame, measured] = useContainerWidth<HTMLDivElement>(DESIGN_WIDTH);
  const width = Math.max(measured, MIN_WIDTH);
  const RIGHT = width - RIGHT_MARGIN;
  const WIDTH = RIGHT - LEFT;
  const values = points.map((p) => p.value);
  const extent = [...values, specLimit, ...(limits ? [limits.ucl, limits.lcl] : [])];
  const lo = Math.min(...extent);
  const hi = Math.max(...extent);
  const pad = Math.max((hi - lo) * 0.12, 0.5);
  const minVal = Math.max(0, lo - pad);
  const maxVal = hi + pad;

  const yFor = (v: number) => BOTTOM - ((v - minVal) / (maxVal - minVal)) * HEIGHT;
  const stepX = WIDTH / Math.max(1, points.length - 1);
  // A single reading sits in the middle instead of hugging the axis.
  const xFor = (i: number) => (points.length === 1 ? LEFT + WIDTH / 2 : LEFT + i * stepX);
  const coords = points.map((p, i) => ({ ...p, x: xFor(i), y: yFor(p.value) }));

  const labelEvery = Math.max(1, Math.ceil(points.length / Math.floor(WIDTH / DATE_SLOT)));
  // Value labels only while they fit; past that only Special Causes are labelled.
  const labelValues = points.length * VALUE_SLOT <= WIDTH;
  const specText = `${specDirection === "MIN" ? "TARGET ≥" : "TARGET ≤"} ${fmt(specLimit)} ${unit}`.trim();
  const specTop = yFor(specLimit);
  const specBoxY = specTop - 17 < TOP - 8 ? specTop + 3 : specTop - 17;

  const specialCount = points.filter((p) => p.isSpecialCause).length;

  return (
    <div ref={frame} className="w-full">
      <div>
        <svg
          width={width}
          height={260}
          viewBox={`0 0 ${width} 260`}
          role="img"
          aria-label={`Control chart of ${metricName}: ${points.length} readings${
            limits ? `, normal range ${fmt(limits.lcl)} to ${fmt(limits.ucl)} ${unit}, average ${fmt(limits.mean)}` : ""
          }. ${specialCount} outside the normal range. Your target is ${specDirection === "MIN" ? "at least" : "at most"} ${fmt(specLimit)} ${unit}.`}
          className="block max-w-none overflow-visible"
        >
          {limits && (
            <>
              <rect x={LEFT} y={yFor(limits.ucl)} width={WIDTH} height={Math.max(0, yFor(limits.lcl) - yFor(limits.ucl))} rx="4" className="fill-sage/10" />
              <line x1={LEFT} y1={yFor(limits.ucl)} x2={RIGHT} y2={yFor(limits.ucl)} className="stroke-slateWarm" strokeWidth="1.25" strokeDasharray="5 4" />
              <text x={RIGHT + 8} y={yFor(limits.ucl) + 4} className="fill-slateWarm font-mono" fontSize="10" fontWeight="600">UCL {fmt(limits.ucl)}</text>
              <line x1={LEFT} y1={yFor(limits.mean)} x2={RIGHT} y2={yFor(limits.mean)} className="stroke-sage" strokeWidth="1.5" />
              <text x={RIGHT + 8} y={yFor(limits.mean) + 4} className="fill-sage font-mono" fontSize="10" fontWeight="600">X̄ {fmt(limits.mean)}</text>
              <line x1={LEFT} y1={yFor(limits.lcl)} x2={RIGHT} y2={yFor(limits.lcl)} className="stroke-slateWarm" strokeWidth="1.25" strokeDasharray="5 4" />
              <text x={RIGHT + 8} y={yFor(limits.lcl) + 4} className="fill-slateWarm font-mono" fontSize="10" fontWeight="600">LCL {fmt(limits.lcl)}</text>
            </>
          )}

          {/* Your own target */}
          <line x1={LEFT} y1={specTop} x2={RIGHT} y2={specTop} className="stroke-ochre" strokeWidth="1.75" />
          <rect x={LEFT + 8} y={specBoxY} width={specText.length * 6.2 + 14} height="15" rx="3" className="fill-ochreLight" />
          <text x={LEFT + 15} y={specBoxY + 11} className="fill-ochre font-mono" fontSize="9" fontWeight="600">{specText}</text>

          <polyline fill="none" className="stroke-espresso" strokeWidth="2" points={coords.map((c) => `${c.x},${c.y}`).join(" ")} />

          {coords.map((c, i) => (
            <g key={c.id}>
              <title>{`${formatShortDate(c.date)}: ${c.value} ${unit}${c.note ? ` (${c.note})` : ""}${c.isSpecialCause ? ", outside your normal range" : ""}`}</title>
              {c.isSpecialCause ? (
                <>
                  <circle cx={c.x} cy={c.y} r="11" className="fill-terracotta/25 motion-safe:animate-pulse" />
                  <circle cx={c.x} cy={c.y} r="5.5" className="fill-terracotta stroke-ivory" strokeWidth="2" />
                  <text x={c.x} y={c.y - 14} textAnchor="middle" className="fill-terracotta font-mono" fontSize="10" fontWeight="600">
                    {fmt(c.value)} · outlier
                  </text>
                </>
              ) : (
                <>
                  <circle cx={c.x} cy={c.y} r="4.5" className="fill-sage stroke-ivory" strokeWidth="1.75" />
                  {labelValues && (
                    <text x={c.x} y={c.y - 9} textAnchor="middle" className="fill-slateWarm font-mono" fontSize="9.5">{fmt(c.value)}</text>
                  )}
                </>
              )}
              {(i % labelEvery === 0 || i === coords.length - 1) && (
                <text x={c.x} y={BOTTOM + 20} textAnchor="middle" className="fill-slateWarm font-mono" fontSize="10">
                  {formatShortDate(c.date)}
                </text>
              )}
            </g>
          ))}

          <line x1={LEFT} y1={BOTTOM} x2={RIGHT} y2={BOTTOM} className="stroke-stoneDark" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}
