import { Suspense } from "react";
import { isoWeekNumber } from "@/lib/dates";
import { getToday } from "@/lib/timezone";
import { QuickLog } from "@/features/check-sheet/components/quick-log";
import { GlossaryDialog } from "@/features/glossary/glossary-dialog";
import { CapabilityCard, CapabilityCardSkeleton } from "@/features/check-sheet/components/capability-card";
import { AccountPopover } from "./account-popover";
import { ContextHint } from "./context-hint";
import { UserMenu, UserMenuSkeleton } from "./user-menu";

async function WeekBadge() {
  const week = String(isoWeekNumber(await getToday())).padStart(2, "0");
  return (
    <span className="font-mono text-xs text-slateWarm bg-stone px-2.5 py-1 rounded-md border border-stoneDark whitespace-nowrap">
      WEEK {week}
    </span>
  );
}

/** Sticky header: where you are on the left, the two always-available actions on the right. */
export function TopBar() {
  return (
    <header className="bg-paper/90 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 lg:px-10 py-3 lg:py-4 border-b border-stoneDark flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="lg:hidden font-serif text-xl text-espresso whitespace-nowrap">Kaizen Studio</span>
        <Suspense fallback={<span className="hidden lg:block h-6 w-16 rounded-md bg-stone animate-shimmer" />}>
          <div className="hidden lg:block">
            <WeekBadge />
          </div>
        </Suspense>
        <ContextHint />
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <GlossaryDialog />
        <Suspense fallback={<div className="h-8 w-28 rounded-lg bg-stone animate-shimmer" />}>
          <QuickLog />
        </Suspense>
        <AccountPopover>
          <Suspense fallback={<CapabilityCardSkeleton />}>
            <CapabilityCard />
          </Suspense>
          <Suspense fallback={<UserMenuSkeleton />}>
            <UserMenu />
          </Suspense>
        </AccountPopover>
      </div>
    </header>
  );
}
