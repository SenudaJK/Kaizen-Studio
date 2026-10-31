import { startOfWeek } from "@/lib/dates";
import { requireUserId } from "@/lib/session";
import { getToday, getUserTimeZone } from "@/lib/timezone";
import { Term } from "@/features/glossary/term";
import { beltFor } from "../domain/belt";
import { yieldForSigma } from "../domain/sigma";
import { getLifetimeCheckIns, getWeekSummary } from "../queries";

/** Sidebar card: this week's reliability score, blocker count and progress to the next belt. */
export async function CapabilityCard() {
  const [userId, today, timeZone] = await Promise.all([requireUserId(), getToday(), getUserTimeZone()]);
  const [summary, checkIns] = await Promise.all([
    getWeekSummary(userId, startOfWeek(today), today, timeZone),
    getLifetimeCheckIns(userId),
  ]);
  const belt = beltFor(checkIns);

  const nextSigma = summary.sigma === null || summary.sigma >= 6 ? null : Math.floor(summary.sigma) + 1;

  return (
    <div className="p-5 m-3 rounded-xl bg-stone/80 border border-stoneDark">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slateWarm">This week</span>
        <span className="font-mono text-xs font-semibold text-sage bg-sageLight px-2 py-0.5 rounded">
          {summary.sigma === null ? "—" : `${summary.sigma.toFixed(1)}σ`}
        </span>
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-mono text-2xl font-semibold text-espresso">
            {summary.ratio === null ? "—" : `${Math.round(summary.ratio * 100)}%`}
          </div>
          <div className="text-[11px] text-slateWarm">
            <Term k="yield">Consistency</Term> · <Term k="sigma">Sigma level</Term>
          </div>
        </div>
        <svg className="w-16 h-10 overflow-visible" viewBox="0 0 60 32" aria-hidden="true">
          <line x1="8" y1="2" x2="8" y2="30" strokeWidth="1" strokeDasharray="2 2" className="stroke-ochre" />
          <line x1="52" y1="2" x2="52" y2="30" strokeWidth="1" strokeDasharray="2 2" className="stroke-ochre" />
          <path
            d="M 2 30 C 14 30, 20 4, 30 4 C 40 4, 46 30, 58 30"
            strokeWidth="1.75"
            className="fill-sage/10 stroke-sage"
          />
        </svg>
      </div>

      <p className="text-[11px] text-slateWarm mt-2 leading-snug">
        {nextSigma !== null
          ? `Next milestone: ${nextSigma}σ, which means ${(yieldForSigma(nextSigma) * 100).toFixed(1)}% consistent.`
          : "Check in on a few more days to unlock your reliability score."}
      </p>

      <div className="mt-3 pt-2.5 border-t border-stoneDark/80 space-y-2.5 text-[11px] text-slateWarm">
        <div className="flex items-center justify-between">
          <span>Blockers logged</span>
          <span className="font-mono font-semibold text-terracotta">{summary.blockerCount}</span>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <Term k="belt">{belt.current.name}</Term>
            <span className="font-mono">{belt.next ? `${belt.checkInsToNext} to ${belt.next.name}` : "Top rank"}</span>
          </div>
          <div
            role="progressbar"
            aria-label="Progress to next belt"
            aria-valuenow={belt.progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 rounded-full bg-stoneDark overflow-hidden"
          >
            <div className="h-full bg-sage rounded-full transition-all duration-500" style={{ width: `${belt.progressPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CapabilityCardSkeleton() {
  return <div aria-hidden="true" className="animate-shimmer p-5 m-3 rounded-xl bg-stone/80 border border-stoneDark h-48" />;
}
