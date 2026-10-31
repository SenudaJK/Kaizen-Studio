"use client";

import { useMemo, useState } from "react";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { Button } from "@/components/ui/button";
import { Card, SectionHeader } from "@/components/ui/card";
import { Field, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useAction } from "@/hooks/use-action";
import { formatShortDate, type IsoDate } from "@/lib/dates";
import { Term } from "@/features/glossary/term";
import { deleteMetric, deleteReading, logReading, setSpecLimit } from "../actions";
import {
  MIN_POINTS_FOR_LIMITS,
  buildControlChart,
  round,
  specSliderRange,
  summarizeSpec,
} from "../domain/control-limits";
import type { SpcMetricDto } from "../types";
import { ControlChart } from "./control-chart";

/**
 * Basic tool: the control chart for one metric. The page remounts this (via `key`) when the saved
 * target changes, so the slider's draft value never drifts from what is stored.
 */
export function ControlChartCard({ metric, today }: { metric: SpcMetricDto; today: IsoDate }) {
  const { run, isPending } = useAction();
  const [spec, setSpec] = useState(metric.specLimit);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { points, limits } = useMemo(() => buildControlChart(metric.readings), [metric.readings]);
  // Range comes from the saved target so the slider doesn't re-centre under the thumb while dragging.
  const range = useMemo(() => specSliderRange(metric.readings.map((r) => r.value), metric.specLimit), [metric.readings, metric.specLimit]);
  const onTarget = summarizeSpec(points.map((p) => p.value), spec, metric.specDirection);
  const outliers = points.filter((p) => p.isSpecialCause);
  const unit = metric.unit;
  const withUnit = (value: number) => `${round(value)}${unit ? ` ${unit}` : ""}`;
  const directionWord = metric.specDirection === "MIN" ? "at least" : "at most";

  const commitSpec = () => {
    if (spec !== metric.specLimit) run(() => setSpecLimit({ metricId: metric.id, specLimit: spec }));
  };

  return (
    <Card>
      <SectionHeader
        eyebrow={<>Basic tool · <Term k="spc">Control chart</Term></>}
        tone="sage"
        title={`${metric.name}: is it stable?`}
        description={<>Tells everyday ups and downs from a real <Term k="special-cause">special cause</Term> worth investigating.</>}
        action={
          <div className="grid grid-cols-3 gap-2">
            <Readout label={<Term k="control-limits" align="right">Upper limit</Term>} value={limits ? withUnit(limits.ucl) : "—"} />
            <Readout label="Average" value={limits ? withUnit(limits.mean) : "—"} tone="sage" />
            <Readout label={<Term k="control-limits" align="right">Lower limit</Term>} value={limits ? withUnit(limits.lcl) : "—"} />
          </div>
        }
      />

      {points.length === 0 ? (
        <p className="text-sm text-slateWarm py-10 text-center rounded-xl border border-dashed border-stoneDark bg-paper/60">
          No readings yet. Log today&apos;s number below to start the chart.
        </p>
      ) : (
        <>
          {limits === null && (
            <p className="text-xs text-slateWarm bg-ochreLight border border-ochre/30 rounded-xl px-4 py-2.5 mb-4 w-fit max-w-full">
              {MIN_POINTS_FOR_LIMITS - points.length} more reading{MIN_POINTS_FOR_LIMITS - points.length === 1 ? "" : "s"} and the chart will show your normal range.
            </p>
          )}
          <ControlChart
            points={points}
            limits={limits}
            specLimit={spec}
            specDirection={metric.specDirection}
            unit={unit}
            metricName={metric.name}
          />
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slateWarm">
            <span className="flex items-center gap-1.5"><span className="w-4 border-b border-dashed border-slateWarm inline-block" /> Normal range (from your readings)</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-ochre inline-block" /> Your target</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-terracotta inline-block" /> Outside normal range</span>
          </div>
        </>
      )}

      {outliers.length > 0 && (
        <p className="mt-4 text-xs text-slateWarm bg-terracottaLight border border-terracotta/20 rounded-xl px-4 py-2.5">
          <span className="font-semibold text-espresso">Worth a look: </span>
          {outliers.slice(-3).map((p) => `${formatShortDate(p.date)} (${withUnit(p.value)}${p.note ? `, ${p.note}` : ""})`).join("; ")}
          {outliers.length > 3 && ` and ${outliers.length - 3} more`}. These fell outside your normal range, so something specific happened. Find out what.
        </p>
      )}

      <div className="mt-6 pt-5 border-t border-stoneDark grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-paper p-4 rounded-xl border border-stoneDark">
          <div className="flex items-center justify-between gap-3 text-xs mb-2">
            <label htmlFor={`spec-${metric.id}`} className="font-semibold text-espresso flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-ochre inline-block" />
              Your <Term k="spec-limit">target</Term>
            </label>
            <span className="font-mono font-semibold text-ochre">{directionWord} {withUnit(spec)}</span>
          </div>
          <input
            id={`spec-${metric.id}`}
            type="range"
            min={range.min}
            max={range.max}
            step={range.step}
            value={spec}
            disabled={isPending}
            onChange={(event) => setSpec(Number(event.target.value))}
            onPointerUp={commitSpec}
            onKeyUp={commitSpec}
            onBlur={commitSpec}
            className="w-full cursor-pointer accent-ochre"
          />
          <p className="text-[11px] text-slateWarm mt-1.5">
            {onTarget.ratio === null ? "Log readings to see how often you hit it." : `You hit this target on ${onTarget.met} of ${onTarget.total} days (${Math.round(onTarget.ratio * 100)}%).`}
          </p>
          <p className="text-[11px] text-slateWarm mt-1">
            The dashed range is what your days <em>do</em>; the amber line is what you <em>want</em>. If the range sits on the wrong side of your target, change the routine, not just your effort.
          </p>
        </div>

        <form
          className="bg-paper p-4 rounded-xl border border-stoneDark flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            run(
              () => logReading({ metricId: metric.id, value: data.get("value"), date: data.get("date") || undefined, note: data.get("note") }),
              {
                successMessage: "Reading saved. Your normal range is updated.",
                onSuccess: () => form.reset(),
              },
            );
          }}
        >
          <div className="text-xs font-semibold text-espresso">Log a reading</div>
          <div className="grid grid-cols-2 gap-2">
            <Field label={`Value${unit ? ` (${unit})` : ""}`}>
              <TextInput name="value" type="number" step="any" required inputMode="decimal" placeholder="e.g. 7.6" />
            </Field>
            <Field label="Day">
              <TextInput name="date" type="date" max={today} defaultValue={today} required />
            </Field>
          </div>
          <Field label="Note (optional)" hint="Why was it high or low? Future you will want to know.">
            <TextInput name="note" maxLength={80} placeholder="e.g. Late flight" />
          </Field>
          <Button type="submit" variant="dark" size="sm" disabled={isPending} className="self-start">
            Save reading
          </Button>
        </form>
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        {points.length > 0 ? (
          <details className="text-xs text-slateWarm min-w-0 flex-1">
            <summary className="cursor-pointer font-medium text-espresso w-fit">Recent readings ({points.length})</summary>
            <ul className="mt-2 space-y-1">
              {points.toReversed().slice(0, 10).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg bg-paper border border-stoneDark px-3 py-1.5">
                  <span className="font-mono">
                    {formatShortDate(p.date)} · {withUnit(p.value)}
                    {p.note && <span className="font-sans text-slateWarm"> · {p.note}</span>}
                  </span>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => run(() => deleteReading({ readingId: p.id }), { successMessage: "Reading removed." })}
                    aria-label={`Remove the ${formatShortDate(p.date)} reading`}
                    className="text-slateWarm hover:text-terracotta transition"
                  >
                    <TrashIcon size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </details>
        ) : (
          <span />
        )}
        <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(true)}>
          <TrashIcon size={14} /> Stop tracking {metric.name}
        </Button>
      </div>

      <Modal open={confirmingDelete} onClose={() => setConfirmingDelete(false)} eyebrow="Stability" title={`Stop tracking ${metric.name}?`}>
        <p className="text-sm text-slateWarm">
          This deletes the metric and all {metric.readings.length} of its readings. Any scatter diagram that uses it will disappear too.
        </p>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" size="sm" onClick={() => setConfirmingDelete(false)}>
            Keep it
          </Button>
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => run(() => deleteMetric({ metricId: metric.id }), { successMessage: "Metric deleted.", onSuccess: () => setConfirmingDelete(false) })}
          >
            Delete metric
          </Button>
        </div>
      </Modal>
    </Card>
  );
}

function Readout({ label, value, tone = "slate" }: { label: React.ReactNode; value: string; tone?: "slate" | "sage" }) {
  return (
    <div className={tone === "sage" ? "bg-sageLight px-3 py-1.5 rounded-lg border border-sage/20" : "bg-stone px-3 py-1.5 rounded-lg border border-stoneDark"}>
      <span className={`font-mono text-[10px] uppercase block ${tone === "sage" ? "text-sage" : "text-slateWarm"}`}>{label}</span>
      <span className={`font-mono text-sm font-semibold ${tone === "sage" ? "text-sage" : "text-espresso"}`}>{value}</span>
    </div>
  );
}
