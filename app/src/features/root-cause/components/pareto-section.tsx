import Link from "next/link";
import { ChartBarIcon } from "@phosphor-icons/react/dist/ssr/ChartBar";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import { Card, SectionHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/cn";
import { HOME_PATH } from "@/lib/routes";
import { Term } from "@/features/glossary/term";
import { PARETO_WINDOWS, buildPareto, type ParetoWindow } from "../domain/pareto";
import type { ParetoTriggerDto } from "../types";
import { DiagnoseButton } from "./diagnose-button";
import { ParetoChart } from "./pareto-chart";

const WINDOW_LABELS: Record<ParetoWindow, string> = { week: "This week", month: "Last 30 days" };

/** Basic Tool: the Pareto diagram. Ranks this period's blockers and calls out the Vital Few. */
export function ParetoSection({
  triggers,
  window,
  basePath,
  problemKey,
}: {
  triggers: ParetoTriggerDto[];
  window: ParetoWindow;
  basePath: string;
  /** Fishbone currently open, kept in the toggle links so switching the window doesn't close it. */
  problemKey: string | null;
}) {
  const pareto = buildPareto(triggers);
  const byId = new Map(triggers.map((t) => [t.id, t]));
  const rangeQuery = window === "month" ? "&range=month" : "";
  const hrefForWindow = (w: ParetoWindow) => {
    const params = new URLSearchParams();
    if (w === "month") params.set("range", "month");
    if (problemKey) params.set("problem", problemKey);
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <Card>
      <SectionHeader
        eyebrow={<>Basic tool · <Term k="pareto">Pareto chart</Term></>}
        tone="terracotta"
        title="What causes most of your slips"
        description={<>Separate the <Term k="vital-few">vital few</Term> blockers from the trivial many, and fix those first.</>}
        action={
          <div className="inline-flex bg-stone p-1 rounded-xl border border-stoneDark">
            {PARETO_WINDOWS.map((w) => (
              <Link
                key={w}
                href={hrefForWindow(w)}
                scroll={false}
                aria-current={w === window ? "true" : undefined}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition",
                  w === window ? "bg-ivory text-espresso shadow-sm" : "text-slateWarm hover:text-espresso",
                )}
              >
                {WINDOW_LABELS[w]}
              </Link>
            ))}
          </div>
        }
      />

      {pareto.total === 0 ? (
        <EmptyState
          icon={<ChartBarIcon size={22} />}
          title={triggers.length === 0 ? "Nothing to rank yet" : `No slips tallied ${window === "week" ? "this week" : "in the last 30 days"}`}
          description="The chart builds itself from the blockers you tally on the Daily Check Sheet. A few days of honest counting is enough to see a pattern."
        >
          <Link
            href={HOME_PATH}
            className="px-4 py-2.5 text-sm font-medium rounded-xl bg-espresso text-ivory hover:bg-espresso/90 shadow-sm transition"
          >
            Go tally a blocker
          </Link>
        </EmptyState>
      ) : (
        <>
          <div className="bg-ochreLight border border-ochre/30 px-4 py-2.5 rounded-xl flex items-center gap-2.5 mb-5 w-fit max-w-full">
            <WarningCircleIcon size={20} weight="fill" className="text-ochre shrink-0" />
            <p className="text-xs">
              <span className="font-semibold text-espresso">Vital few found: </span>
              <span className="text-slateWarm">
                {pareto.vitalCount === 1 ? "1 blocker accounts" : `${pareto.vitalCount} blockers account`} for {pareto.vitalPct}% of your{" "}
                {pareto.total} slips. Solve {pareto.vitalCount === 1 ? "it" : "these"} first.
              </span>
            </p>
          </div>

          <ParetoChart pareto={pareto} />

          <div className="mt-4 pt-3 border-t border-stone flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slateWarm">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-terracotta inline-block" /> Vital few (up to 80%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-stoneDark inline-block" /> Trivial many</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-espresso inline-block" /> Running total %</span>
            <span className="flex items-center gap-1.5"><span className="w-4 border-b border-dashed border-ochre inline-block" /> 80% line</span>
          </div>

          <ol className="mt-5 space-y-2">
            {pareto.bars.map((bar, index) => {
              const trigger = byId.get(bar.id);
              if (!trigger) return null;
              return (
                <li key={bar.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-paper border border-stoneDark">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn("font-mono text-[11px] w-5 shrink-0", bar.isVital ? "text-terracotta font-semibold" : "text-slateWarm")}>
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-espresso truncate">{bar.name}</div>
                      <div className="font-mono text-[11px] text-slateWarm">
                        {bar.count} slip{bar.count === 1 ? "" : "s"} · {Math.round((bar.count / pareto.total) * 100)}% of total
                      </div>
                    </div>
                  </div>
                  <DiagnoseButton triggerId={trigger.id} problemKey={trigger.problemKey} basePath={basePath} rangeQuery={rangeQuery} />
                </li>
              );
            })}
          </ol>
        </>
      )}
    </Card>
  );
}
