"use client";

import { useOptimistic, useState } from "react";
import { MoonStarsIcon } from "@phosphor-icons/react/dist/ssr/MoonStars";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { SunHorizonIcon } from "@phosphor-icons/react/dist/ssr/SunHorizon";
import { Button } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useAction } from "@/hooks/use-action";
import { Term } from "@/features/glossary/term";
import { applyStarterRoutine, removeFlowStep, toggleFlowStep } from "../actions";
import { formatMinutes, routineProgress } from "../domain/routine";
import { ROUTINE_LABELS } from "../starter-templates";
import type { FlowRoutineDto, FlowRoutineType } from "../types";
import { AddStepDialog } from "./add-step-dialog";
import { FlowStepCard } from "./flow-step-card";

type Routines = Record<FlowRoutineType, FlowRoutineDto>;
type Change = { stepId: string; done: boolean };

function applyChange(routines: Routines, { stepId, done }: Change): Routines {
  const patch = (routine: FlowRoutineDto): FlowRoutineDto => ({
    ...routine,
    steps: routine.steps.map((step) => (step.id === stepId ? { ...step, doneToday: done } : step)),
  });
  return { MORNING: patch(routines.MORNING), EVENING: patch(routines.EVENING) };
}

const ROUTINE_ICONS = {
  MORNING: <SunHorizonIcon size={14} weight="fill" className="text-ochre" />,
  EVENING: <MoonStarsIcon size={14} weight="fill" className="text-sage" />,
};

/** Basic Tool: the Flow Chart. Morning and evening routines as an ordered chain you tick off. */
export function DailyFlow({ routines, initialRoutine }: { routines: Routines; initialRoutine: FlowRoutineType }) {
  const { run, isPending } = useAction();
  const [optimistic, applyOptimistic] = useOptimistic(routines, applyChange);
  const [active, setActive] = useState<FlowRoutineType>(initialRoutine);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);

  const routine = optimistic[active];
  const progress = routineProgress(routine.steps);
  const labels = ROUTINE_LABELS[active];

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
        <div>
          <Eyebrow tone="sage">
            Basic Tool · <Term k="flow-chart">Flow Chart</Term>
          </Eyebrow>
          <h2 className="font-serif text-2xl text-espresso mt-0.5">Your daily routine</h2>
          <p className="text-xs text-slateWarm mt-1 max-w-md">
            The same steps in the same order mean fewer decisions. Follow the chain and tick each step as you go.
          </p>
        </div>
        <SegmentedControl
          label="Routine"
          value={active}
          onChange={(next) => {
            setActive(next);
            setEditing(false);
          }}
          options={(["MORNING", "EVENING"] as const).map((type) => ({
            value: type,
            label: (
              <>
                {ROUTINE_ICONS[type]}
                {ROUTINE_LABELS[type].title}
                {optimistic[type].steps.length > 0 && (
                  <span className="text-slateWarm font-normal">
                    ({formatMinutes(routineProgress(optimistic[type].steps).totalMinutes)})
                  </span>
                )}
              </>
            ),
          }))}
        />
      </div>

      {routine.steps.length === 0 ? (
        <EmptyState
          icon={ROUTINE_ICONS[active]}
          title={`Design your ${labels.short.toLowerCase()} routine`}
          description="List the steps in order. Start from our suggestion and make it yours, or build it from scratch."
        >
          <Button
            size="sm"
            disabled={isPending}
            onClick={() =>
              run(() => applyStarterRoutine({ routine: active }), { successMessage: "Starter routine added. Edit it freely." })
            }
          >
            <SparkleIcon size={14} weight="fill" /> Use a starter routine
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
            <PlusIcon size={14} weight="bold" /> Build my own
          </Button>
        </EmptyState>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-mono text-slateWarm">
                {progress.doneCount}/{progress.total} steps
                {!progress.isComplete && ` · ${formatMinutes(progress.remainingMinutes)} to go`}
              </span>
              <span className="font-mono text-[11px] text-sage font-medium">
                {progress.isComplete ? "Standard flow complete" : `Step ${progress.doneCount + 1} is active`}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={`${labels.title} progress`}
              aria-valuenow={progress.doneCount}
              aria-valuemin={0}
              aria-valuemax={progress.total}
              className="h-1.5 rounded-full bg-stone overflow-hidden"
            >
              <div
                className="h-full rounded-full bg-sage transition-all duration-500 ease-out"
                style={{ width: `${(progress.doneCount / progress.total) * 100}%` }}
              />
            </div>
          </div>

          {progress.isComplete && (
            <div className="animate-pop mb-4 flex items-center gap-3 rounded-xl bg-sageLight border border-sage/30 px-4 py-3">
              <SparkleIcon size={20} weight="fill" className="text-sage shrink-0" />
              <p className="text-sm text-espresso">
                <span className="font-semibold">{labels.title} complete.</span>{" "}
                <span className="text-slateWarm">
                  {formatMinutes(progress.totalMinutes)} of standard work, done. That&apos;s the habit working.
                </span>
              </p>
            </div>
          )}

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {routine.steps.map((step, index) => (
              <FlowStepCard
                key={step.id}
                step={step}
                position={index + 1}
                isNext={step.id === progress.nextStep?.id}
                isLast={index === routine.steps.length - 1}
                editing={editing}
                onToggle={() =>
                  run(async () => {
                    applyOptimistic({ stepId: step.id, done: !step.doneToday });
                    return toggleFlowStep({ stepId: step.id, done: !step.doneToday });
                  })
                }
                onRemove={() => run(() => removeFlowStep({ stepId: step.id }), { successMessage: `Removed “${step.name}”.` })}
              />
            ))}
          </ol>

          <div className="mt-4 pt-3 border-t border-stone flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slateWarm">Tap a step to mark it done. Tap again to undo. Routines reset each day.</p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
                <PlusIcon size={14} weight="bold" /> Add step
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing((v) => !v)} aria-pressed={editing}>
                <PencilSimpleIcon size={14} /> {editing ? "Done editing" : "Edit"}
              </Button>
            </div>
          </div>
        </>
      )}

      <AddStepDialog routine={active} open={adding} onClose={() => setAdding(false)} />
    </Card>
  );
}
