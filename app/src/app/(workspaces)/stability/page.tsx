import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/card";
import { requireUserId } from "@/lib/session";
import { getToday } from "@/lib/timezone";
import { ControlChartCard } from "@/features/stability/components/control-chart-card";
import { MetricTabs } from "@/features/stability/components/metric-tabs";
import { ScatterCard } from "@/features/stability/components/scatter-card";
import { StarterMetrics } from "@/features/stability/components/starter-metrics";
import { getSpcMetrics } from "@/features/stability/queries";

export const metadata: Metadata = { title: "Stability & Correlations · Kaizen Studio" };

const BASE_PATH = "/stability";

/**
 * Workspace 3. This file only gathers data and arranges sections; control limits and
 * correlations are derived in features/stability/domain from the logged readings.
 */
export default async function StabilityPage({ searchParams }: PageProps<"/stability">) {
  const [userId, today, params] = await Promise.all([requireUserId(), getToday(), searchParams]);
  const metrics = await getSpcMetrics(userId);

  const metricParam = typeof params.metric === "string" ? params.metric : null;
  const active = metrics.find((m) => m.key === metricParam) ?? metrics[0] ?? null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stoneDark pb-6">
        <div>
          <Eyebrow tone="sage">03 / Control chart &amp; scatter</Eyebrow>
          <h1 className="font-serif text-4xl lg:text-5xl text-espresso tracking-tight mt-1">Stability &amp; Correlations</h1>
          <p className="text-slateWarm text-sm mt-1.5 max-w-2xl">
            Log a number each day and see what&apos;s normal for you, which days were truly unusual, and which habits move your results.
          </p>
        </div>
        {active && <MetricTabs metrics={metrics} activeKey={active.key} basePath={BASE_PATH} />}
      </div>

      {active ? (
        <>
          <ControlChartCard key={`${active.id}:${active.specLimit}`} metric={active} today={today} />
          <ScatterCard metrics={metrics} />
        </>
      ) : (
        <StarterMetrics />
      )}
    </div>
  );
}
