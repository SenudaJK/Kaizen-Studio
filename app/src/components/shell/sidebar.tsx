import { Suspense } from "react";
import { CapabilityCard, CapabilityCardSkeleton } from "@/features/check-sheet/components/capability-card";
import { BeltBadge, BeltBadgeSkeleton } from "./belt-badge";
import { SidebarNav } from "./nav-links";
import { UserMenu, UserMenuSkeleton } from "./user-menu";

/** Desktop navigation rail. On small screens navigation moves to the bottom tab bar. */
export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col justify-between bg-ivory border-r border-stoneDark h-screen sticky top-0 z-30">
      <div className="overflow-y-auto">
        <div className="p-6 pb-5 border-b border-stoneDark flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-terracotta inline-block" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-slateWarm font-medium">DMAIC Life OS</span>
            </div>
            <div className="font-serif text-3xl tracking-tight text-espresso mt-0.5">Kaizen Studio</div>
          </div>
          <Suspense fallback={<BeltBadgeSkeleton />}>
            <BeltBadge />
          </Suspense>
        </div>

        <div className="px-6 py-3.5 bg-stone/60 border-b border-stoneDark">
          <p className="text-slateWarm italic font-serif text-[15px] leading-snug">
            &ldquo;We don&apos;t question what we don&apos;t measure. Reduce variation, not just effort.&rdquo;
          </p>
        </div>

        <SidebarNav />
      </div>

      <div>
        <Suspense fallback={<CapabilityCardSkeleton />}>
          <CapabilityCard />
        </Suspense>
        <Suspense fallback={<UserMenuSkeleton />}>
          <UserMenu />
        </Suspense>
      </div>
    </aside>
  );
}
