"use client";

import { useState } from "react";
import { ChartLineUpIcon } from "@phosphor-icons/react/dist/ssr/ChartLineUp";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAction } from "@/hooks/use-action";
import { createMetrics } from "../actions";
import { STARTER_METRICS } from "../starter-metrics";
import { AddMetricDialog } from "./add-metric-dialog";

/** First-run state: nothing is tracked yet. Offers an opt-in starter set or a custom metric. */
export function StarterMetrics() {
  const { run, isPending } = useAction();
  const [adding, setAdding] = useState(false);

  return (
    <Card>
      <EmptyState
        icon={<ChartLineUpIcon size={22} />}
        title="Pick a number to watch"
        description="Log one number a day, like hours slept. After five readings you'll see your normal range and which days were truly unusual."
      >
        <Button
          variant="dark"
          disabled={isPending}
          onClick={() => run(() => createMetrics({ metrics: STARTER_METRICS }), { successMessage: "Starter metrics added." })}
        >
          Start with {STARTER_METRICS.map((m) => m.name.toLowerCase()).join(", ")}
        </Button>
        <Button variant="secondary" onClick={() => setAdding(true)}>
          Track something else
        </Button>
      </EmptyState>
      <AddMetricDialog open={adding} onClose={() => setAdding(false)} />
    </Card>
  );
}
