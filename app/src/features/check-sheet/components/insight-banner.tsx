import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { WORKSPACES } from "@/components/shell/workspaces";
import type { TopTrigger } from "../domain/insight";
import type { WeekSummary } from "../domain/summary";

const rootCause = WORKSPACES.find((w) => w.key === "root-cause");

/**
 * One data-driven observation about the week. Names the biggest blocker when there is one,
 * celebrates a strong week when there isn't, and stays out of the way otherwise.
 */
export function InsightBanner({ top, summary }: { top: TopTrigger | null; summary: WeekSummary }) {
  if (top) {
    return (
      <div className="bg-terracottaLight/90 border border-terracotta/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-terracotta text-ivory flex items-center justify-center shrink-0 mt-0.5">
            <SparkleIcon size={20} weight="fill" />
          </div>
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-terracotta">
              Insight · Management by fact
            </span>
            <h2 className="text-sm font-semibold text-espresso mt-0.5">
              “{top.name}” caused {top.sharePct}% of your slips this week.
            </h2>
            <p className="text-xs text-slateWarm mt-0.5">
              Instead of relying on willpower, inspect the process. Finding the root cause often reveals a simple fix.
            </p>
          </div>
        </div>
        {rootCause?.available ? (
          <Link
            href={rootCause.href}
            className="shrink-0 bg-espresso text-ivory hover:bg-espresso/90 text-xs font-medium px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition"
          >
            Find the root cause <ArrowRightIcon size={14} weight="bold" />
          </Link>
        ) : (
          <span className="shrink-0 font-mono text-[11px] text-slateWarm bg-ivory/70 border border-stoneDark px-3 py-2 rounded-xl">
            Root-Cause Studio · coming soon
          </span>
        )}
      </div>
    );
  }

  if (summary.ratio !== null && summary.ratio >= 0.85 && summary.yield.opportunities >= 5) {
    return (
      <div className="bg-sageLight border border-sage/25 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-sage text-ivory flex items-center justify-center shrink-0">
          <SparkleIcon size={20} weight="fill" />
        </div>
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-sage">Insight · Stable process</span>
          <h2 className="text-sm font-semibold text-espresso mt-0.5">
            You&apos;re {Math.round(summary.ratio * 100)}% consistent with no blockers logged.
          </h2>
          <p className="text-xs text-slateWarm mt-0.5">That&apos;s a stable routine. Keep it boring; boring is the goal.</p>
        </div>
      </div>
    );
  }

  return null;
}
