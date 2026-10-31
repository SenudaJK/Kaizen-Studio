import { MedalIcon } from "@phosphor-icons/react/dist/ssr/Medal";
import { requireUserId } from "@/lib/session";
import { beltFor } from "@/features/check-sheet/domain/belt";
import { getLifetimeCheckIns } from "@/features/check-sheet/queries";

export async function BeltBadge() {
  const belt = beltFor(await getLifetimeCheckIns(await requireUserId()));
  const title = belt.next
    ? `${belt.checkInsToNext} more check-ins to reach ${belt.next.name}`
    : "You've reached the top rank";

  return (
    <div title={title} className="bg-sageLight border border-sage/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
      <MedalIcon size={14} weight="fill" className="text-sage" />
      <span className="font-mono text-[11px] font-semibold text-sage whitespace-nowrap">{belt.current.name}</span>
    </div>
  );
}

export function BeltBadgeSkeleton() {
  return <div aria-hidden="true" className="animate-shimmer h-6 w-24 rounded-full bg-stone" />;
}
