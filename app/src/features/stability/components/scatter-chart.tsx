"use client";

import { useContainerWidth } from "@/hooks/use-container-width";
import { formatShortDate } from "@/lib/dates";
import type { Fit, Pair } from "../domain/correlation";

const LEFT = 56;
const TOP = 16;
const BOTTOM = 200;
const DESIGN_WIDTH = 540;
const MIN_WIDTH = 300;
const RIGHT_MARGIN = 20;
const HEIGHT = BOTTOM - TOP;

const fmt = (value: number) => (Math.abs(value) >= 100 ? value.toFixed(0) : Number(value.toFixed(1)).toString());

/** Scatter diagram with the best-fit line when there is one. Pure SVG, server-rendered. */
export function ScatterChart({
  pairs,
  fit,
  xLabel,
  yLabel,
  tone,
}: {
  pairs: Pair[];
  fit: Fit | null;
  xLabel: string;
  yLabel: string;
  tone: "sage" | "terracotta" | "slate";
}) {
  const [frame, measured] = useContainerWidth<HTMLDivElement>(DESIGN_WIDTH);
  const width = Math.max(measured, MIN_WIDTH);
  const RIGHT = width - RIGHT_MARGIN;
  const WIDTH = RIGHT - LEFT;
  const xs = pairs.map((p) => p.x);
  const ys = pairs.map((p) => p.y);
  const padFor = (lo: number, hi: number) => Math.max((hi - lo) * 0.1, 0.5);
  const minX = Math.min(...xs) - padFor(Math.min(...xs), Math.max(...xs));
  const maxX = Math.max(...xs) + padFor(Math.min(...xs), Math.max(...xs));
  const minY = Math.min(...ys) - padFor(Math.min(...ys), Math.max(...ys));
  const maxY = Math.max(...ys) + padFor(Math.min(...ys), Math.max(...ys));

  const xFor = (v: number) => LEFT + ((v - minX) / (maxX - minX)) * WIDTH;
  const yFor = (v: number) => BOTTOM - ((v - minY) / (maxY - minY)) * HEIGHT;

  const dot = tone === "terracotta" ? "fill-terracotta" : tone === "sage" ? "fill-sage" : "fill-slateWarm";
  const line = tone === "terracotta" ? "stroke-terracotta" : tone === "sage" ? "stroke-sage" : "stroke-slateWarm";

  return (
    <div ref={frame} className="w-full">
    <svg
      width={width}
      height={260}
      viewBox={`0 0 ${width} 260`}
      role="img"
      aria-label={`Scatter diagram of ${pairs.length} days: ${xLabel} against ${yLabel}.${fit ? ` Correlation ${fit.r.toFixed(2)}.` : ""}`}
      className="block max-w-none overflow-visible"
    >
      <line x1={LEFT} y1={BOTTOM} x2={RIGHT} y2={BOTTOM} className="stroke-stoneDark" strokeWidth="1.5" />
      <line x1={LEFT} y1={TOP} x2={LEFT} y2={BOTTOM} className="stroke-stoneDark" strokeWidth="1.5" />

      <text x={LEFT} y={BOTTOM + 16} textAnchor="middle" className="fill-slateWarm font-mono" fontSize="10">{fmt(minX)}</text>
      <text x={RIGHT} y={BOTTOM + 16} textAnchor="middle" className="fill-slateWarm font-mono" fontSize="10">{fmt(maxX)}</text>
      <text x={LEFT - 8} y={BOTTOM + 3} textAnchor="end" className="fill-slateWarm font-mono" fontSize="10">{fmt(minY)}</text>
      <text x={LEFT - 8} y={TOP + 4} textAnchor="end" className="fill-slateWarm font-mono" fontSize="10">{fmt(maxY)}</text>

      <text x={(LEFT + RIGHT) / 2} y={BOTTOM + 38} textAnchor="middle" className="fill-espresso font-mono" fontSize="10" fontWeight="600">
        {xLabel.toUpperCase()}
      </text>
      <text
        x="12"
        y={(TOP + BOTTOM) / 2}
        textAnchor="middle"
        transform={`rotate(-90 12 ${(TOP + BOTTOM) / 2})`}
        className="fill-espresso font-mono"
        fontSize="10"
        fontWeight="600"
      >
        {yLabel.toUpperCase()}
      </text>

      {fit && (
        <line
          x1={xFor(minX)}
          y1={yFor(fit.slope * minX + fit.intercept)}
          x2={xFor(maxX)}
          y2={yFor(fit.slope * maxX + fit.intercept)}
          className={line}
          strokeWidth="1.75"
          strokeDasharray="6 4"
          // The line can run past the plot area when the fit is steep; clip it to the axes.
          clipPath="url(#scatter-clip)"
        />
      )}
      <clipPath id="scatter-clip">
        <rect x={LEFT} y={TOP} width={WIDTH} height={HEIGHT} />
      </clipPath>

      {pairs.map((p) => (
        <circle key={p.date} cx={xFor(p.x)} cy={yFor(p.y)} r="5" className={`${dot} stroke-ivory`} strokeWidth="1.75" fillOpacity="0.85">
          <title>{`${formatShortDate(p.date)}: ${fmt(p.x)} → ${fmt(p.y)}`}</title>
        </circle>
      ))}
    </svg>
    </div>
  );
}
