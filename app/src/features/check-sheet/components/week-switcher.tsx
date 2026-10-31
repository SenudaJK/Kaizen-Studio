import Link from "next/link";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { addDays, formatWeekRange, type IsoDate } from "@/lib/dates";

const linkClass =
  "w-7 h-7 rounded-lg border border-stoneDark bg-ivory hover:bg-stone text-slateWarm flex items-center justify-center transition";

/** Previous / next week arrows around the date range. Week lives in the URL so it's shareable and back-button friendly. */
export function WeekSwitcher({ weekStart, isCurrentWeek }: { weekStart: IsoDate; isCurrentWeek: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Link href={`/today?week=${addDays(weekStart, -7)}`} aria-label="Previous week" className={linkClass} scroll={false}>
        <CaretLeftIcon size={14} weight="bold" />
      </Link>
      <span className="font-mono text-xs text-slateWarm bg-stone px-2.5 py-1 rounded-md min-w-32 text-center">
        {isCurrentWeek ? "This week" : formatWeekRange(weekStart)}
      </span>
      {isCurrentWeek ? (
        <span aria-hidden="true" className={`${linkClass} opacity-30`}>
          <CaretRightIcon size={14} weight="bold" />
        </span>
      ) : (
        <Link href={`/today?week=${addDays(weekStart, 7)}`} aria-label="Next week" className={linkClass} scroll={false}>
          <CaretRightIcon size={14} weight="bold" />
        </Link>
      )}
    </div>
  );
}
