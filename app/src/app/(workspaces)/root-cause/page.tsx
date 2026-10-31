import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/card";
import { requireUserId } from "@/lib/session";
import { getToday } from "@/lib/timezone";
import { FishboneSection } from "@/features/root-cause/components/fishbone-section";
import { ParetoSection } from "@/features/root-cause/components/pareto-section";
import { resolveWindow, windowRange } from "@/features/root-cause/domain/pareto";
import { getFishboneProblems, getParetoTriggers } from "@/features/root-cause/queries";

export const metadata: Metadata = { title: "Root-Cause Studio · Kaizen Studio" };

const BASE_PATH = "/root-cause";

/**
 * Workspace 2. This file only gathers data and arranges sections; the Pareto ranking and the
 * fishbone rules live in features/root-cause/domain.
 */
export default async function RootCausePage({ searchParams }: PageProps<"/root-cause">) {
  const [userId, today, params] = await Promise.all([requireUserId(), getToday(), searchParams]);

  const window = resolveWindow(params.range);
  const { from, to } = windowRange(window, today);
  const problemParam = typeof params.problem === "string" ? params.problem : null;

  const [triggers, problems] = await Promise.all([getParetoTriggers(userId, from, to), getFishboneProblems(userId)]);
  const activeKey = problems.find((p) => p.key === problemParam)?.key ?? problems[0]?.key ?? null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-stoneDark pb-6">
        <Eyebrow>02 / Pareto &amp; fishbone</Eyebrow>
        <h1 className="font-serif text-4xl lg:text-5xl text-espresso tracking-tight mt-1">Root-Cause Studio</h1>
        <p className="text-slateWarm text-sm mt-1.5 max-w-2xl">
          Find the few blockers behind most of your slips, then dig into why they happen and design a fix that doesn&apos;t rely on willpower.
        </p>
      </div>

      <ParetoSection triggers={triggers} window={window} basePath={BASE_PATH} problemKey={activeKey} />

      <FishboneSection
        problems={problems}
        activeKey={activeKey}
        basePath={BASE_PATH}
        rangeQuery={window === "month" ? "&range=month" : ""}
      />
    </div>
  );
}
