"use client";

import { useContainerWidth } from "@/hooks/use-container-width";
import { PARETO_CUTOFF_PCT, type ParetoResult } from "../domain/pareto";

const LEFT = 50;
const TOP = 25;
const BOTTOM = 205;
const HEIGHT = BOTTOM - TOP;

const DESIGN_WIDTH = 760;
/** Space right of the plot for the 0–100% axis labels. */
const RIGHT_MARGIN = 60;
const MIN_WIDTH = 320;

const truncate = (name: string, max: number) => (name.length > max ? `${name.slice(0, Math.max(1, max - 1))}…` : name);

/**
 * Dual-axis Pareto chart: bars are slip counts (left axis), the line is the running share of
 * all slips (right axis). A pure SVG so it renders on the server with no client JS.
 */
export function ParetoChart({ pareto }: { pareto: ParetoResult }) {
  const [frame, measured] = useContainerWidth<HTMLDivElement>(DESIGN_WIDTH);
  const width = Math.max(measured, MIN_WIDTH);
  const RIGHT = width - RIGHT_MARGIN;
  const WIDTH = RIGHT - LEFT;
  const { bars, total } = pareto;
  const maxCount = Math.max(...bars.map((b) => b.count), 5);
  const slot = WIDTH / bars.length;
  const barWidth = Math.min(68, slot * 0.56);
  // Roughly 6px per character at 11px: fit the name to its slot so neighbours never overlap.
  const labelChars = Math.max(4, Math.floor((slot - 6) / 6));
  const yFor = (pct: number) => BOTTOM - (pct / 100) * HEIGHT;
  const y80 = yFor(PARETO_CUTOFF_PCT);

  const points = bars.map((bar, index) => ({ x: LEFT + index * slot + slot / 2, y: yFor(bar.cumulativePct), pct: Math.round(bar.cumulativePct) }));

  return (
    <div ref={frame} className="w-full">
      <div>
        <svg
          width={width}
          height={270}
          viewBox={`0 0 ${width} 270`}
          role="img"
          aria-label={`Pareto chart of ${total} slips. ${pareto.vitalCount} blocker${pareto.vitalCount === 1 ? "" : "s"} account for ${pareto.vitalPct}% of them: ${bars.map((b) => `${b.name} ${b.count}`).join(", ")}.`}
          className="block max-w-none overflow-visible"
        >
          <line x1={LEFT} y1={BOTTOM} x2={RIGHT} y2={BOTTOM} className="stroke-stoneDark" strokeWidth="1.5" />
          <line x1={LEFT} y1={TOP} x2={RIGHT} y2={TOP} className="stroke-stone" strokeWidth="1" />

          {/* 80% cutoff */}
          <line x1={LEFT} y1={y80} x2={RIGHT} y2={y80} className="stroke-ochre" strokeWidth="1.5" strokeDasharray="5 4" />
          <rect x={RIGHT - 102} y={y80 - 18} width="98" height="16" rx="4" className="fill-ochreLight" />
          <text x={RIGHT - 53} y={y80 - 7} textAnchor="middle" className="fill-ochre font-mono" fontSize="9.5" fontWeight="600">
            80% CUTOFF RULE
          </text>

          {/* Left axis: slip count */}
          <text x={LEFT - 10} y={TOP + 4} textAnchor="end" className="fill-slateWarm font-mono" fontSize="10">{maxCount}</text>
          <text x={LEFT - 10} y={BOTTOM} textAnchor="end" className="fill-slateWarm font-mono" fontSize="10">0</text>
          <text
            x="14"
            y={(TOP + BOTTOM) / 2}
            textAnchor="middle"
            transform={`rotate(-90 14 ${(TOP + BOTTOM) / 2})`}
            className="fill-slateWarm font-mono"
            fontSize="10"
          >
            SLIP COUNT
          </text>

          {/* Right axis: cumulative share */}
          <text x={RIGHT + 10} y={TOP + 4} className="fill-slateWarm font-mono" fontSize="10">100%</text>
          <text x={RIGHT + 10} y={y80 + 3} className="fill-ochre font-mono" fontSize="10" fontWeight="600">80%</text>
          <text x={RIGHT + 10} y={BOTTOM} className="fill-slateWarm font-mono" fontSize="10">0%</text>

          {bars.map((bar, index) => {
            const xCenter = points[index].x;
            const barHeight = (bar.count / maxCount) * HEIGHT;
            return (
              <g key={bar.id}>
                <rect
                  x={xCenter - barWidth / 2}
                  y={BOTTOM - barHeight}
                  width={barWidth}
                  height={barHeight}
                  rx="6"
                  className={bar.isVital ? "fill-terracotta" : "fill-stoneDark"}
                />
                <text x={xCenter} y={BOTTOM - barHeight - 7} textAnchor="middle" className="fill-espresso font-mono" fontSize="11" fontWeight="600">
                  {bar.count}
                </text>
                <text x={xCenter} y={BOTTOM + 20} textAnchor="middle" className="fill-espresso" fontSize="11" fontWeight="500">
                  {truncate(bar.name, labelChars)}
                </text>
              </g>
            );
          })}

          <polyline fill="none" className="stroke-espresso" strokeWidth="2.25" points={points.map((p) => `${p.x},${p.y}`).join(" ")} />
          {points.map((p) => (
            <g key={p.x}>
              <circle cx={p.x} cy={p.y} r="4.5" className="fill-espresso stroke-ivory" strokeWidth="2" />
              <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-slateWarm font-mono" fontSize="10" fontWeight="600">
                {p.pct}%
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
