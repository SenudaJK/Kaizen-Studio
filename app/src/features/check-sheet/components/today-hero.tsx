import { FireIcon } from "@phosphor-icons/react/dist/ssr/Fire";
import { Eyebrow } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Stat } from "@/components/ui/stat";
import { formatLongDate, formatWeekRange, type IsoDate } from "@/lib/dates";
import { Term } from "@/features/glossary/term";
import { greetingFor } from "../domain/next-up";
import type { WeekSummary } from "../domain/summary";

/** Page header: a warm greeting, the one thing to do next, today's progress, and the week's key numbers. */
export function TodayHero({
  firstName,
  today,
  hour,
  weekStart,
  isCurrentWeek,
  summary,
  streak,
  habitsTotal,
  habitsDoneToday,
  nextUp,
}: {
  firstName: string | null;
  today: IsoDate;
  hour: number;
  weekStart: IsoDate;
  isCurrentWeek: boolean;
  summary: WeekSummary;
  streak: number;
  habitsTotal: number;
  habitsDoneToday: number;
  nextUp: string;
}) {
  const period = isCurrentWeek ? "This week" : formatWeekRange(weekStart);
  const allDone = habitsTotal > 0 && habitsDoneToday === habitsTotal;

  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-stoneDark pb-6">
      <div className="flex items-start gap-5">
        <ProgressRing
          value={habitsTotal === 0 ? 0 : habitsDoneToday / habitsTotal}
          label={`${habitsDoneToday} of ${habitsTotal} habits done today`}
        >
          <span className="font-mono text-sm font-semibold text-espresso">
            {habitsTotal === 0 ? "–" : `${habitsDoneToday}/${habitsTotal}`}
          </span>
        </ProgressRing>
        <div>
          <Eyebrow>
            01 / Daily check sheet · {formatLongDate(today)}
          </Eyebrow>
          <h1 className="font-serif text-4xl lg:text-5xl text-espresso tracking-tight mt-1">
            {greetingFor(hour)}
            {firstName && `, ${firstName}`}
          </h1>
          <p className="text-slateWarm text-sm mt-1.5 max-w-xl">
            {allDone ? "Every habit is done for today. Take the win." : nextUp}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 shrink-0">
        <Stat
          label={<Term k="yield">Consistency</Term>}
          value={summary.ratio === null ? "—" : `${Math.round(summary.ratio * 100)}%`}
          tone="sage"
          caption={period}
        />
        <Stat
          label={<Term k="sigma">Reliability</Term>}
          value={summary.sigma === null ? "—" : `${summary.sigma.toFixed(1)}σ`}
          caption={summary.sigma === null ? "Needs a few more days" : "Sigma level"}
        />
        <Stat
          label="Streak"
          value={
            <span className="inline-flex items-center gap-1">
              <FireIcon size={18} weight="fill" className={streak > 0 ? "text-terracotta" : "text-stoneDark"} />
              {streak}
            </span>
          }
          caption={streak === 1 ? "day at 80%+" : "days at 80%+"}
        />
      </div>
    </div>
  );
}
