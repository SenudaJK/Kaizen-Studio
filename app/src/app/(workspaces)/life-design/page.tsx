import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/card";
import { requireUserId } from "@/lib/session";
import { ArrowSection } from "@/features/life-design/components/arrow-section";
import { PdpcSection } from "@/features/life-design/components/pdpc-section";
import { getArrowNodes, getLifeGoal, getPdpcPillars } from "@/features/life-design/queries";

export const metadata: Metadata = { title: "Life Design & Pre-Mortem · Kaizen Studio" };

/**
 * Workspace 4. This file only gathers data and arranges sections; coverage and critical-path
 * numbers are derived in features/life-design/domain.
 */
export default async function LifeDesignPage() {
  const userId = await requireUserId();
  const [goal, pillars, nodes] = await Promise.all([getLifeGoal(userId), getPdpcPillars(userId), getArrowNodes(userId)]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-stoneDark pb-6">
        <Eyebrow tone="sage">04 / Pre-mortem &amp; arrow diagram</Eyebrow>
        <h1 className="font-serif text-4xl lg:text-5xl text-espresso tracking-tight mt-1">Life Design &amp; Pre-Mortem</h1>
        <p className="text-slateWarm text-sm mt-1.5 max-w-2xl">
          Plan before you start: predict what could go wrong and choose your backup moves, then sequence the milestones and see which ones can&apos;t slip.
        </p>
      </div>

      <PdpcSection objective={goal.pdpcObjective} pillars={pillars} />
      <ArrowSection goal={goal.arrowGoal} nodes={nodes} />
    </div>
  );
}
