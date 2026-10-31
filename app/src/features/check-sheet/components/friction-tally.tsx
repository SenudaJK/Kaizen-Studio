"use client";

import { useOptimistic } from "react";
import { MinusIcon } from "@phosphor-icons/react/dist/ssr/Minus";
import { WindIcon } from "@phosphor-icons/react/dist/ssr/Wind";
import { Card, Eyebrow } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAction } from "@/hooks/use-action";
import { cn } from "@/lib/cn";
import { Term } from "@/features/glossary/term";
import { logFriction, undoFriction } from "../actions";
import type { FrictionTriggerDto } from "../types";
import { AddTriggerForm } from "./add-trigger-form";
import { TallyMarks } from "./tally-marks";

type Change = { id: string; delta: 1 | -1 };

/** Basic Tool: the defect tally. Every slip gets counted against what caused it. */
export function FrictionTally({
  triggers,
  canEdit,
  className,
}: {
  triggers: FrictionTriggerDto[];
  canEdit: boolean;
  className?: string;
}) {
  const { run, isPending } = useAction();
  const [optimistic, applyChange] = useOptimistic(triggers, (state, { id, delta }: Change) =>
    state.map((t) => (t.id === id ? { ...t, weekCount: Math.max(0, t.weekCount + delta) } : t)),
  );

  const change = (trigger: FrictionTriggerDto, delta: 1 | -1) =>
    run(
      async () => {
        applyChange({ id: trigger.id, delta });
        return delta === 1 ? logFriction({ triggerId: trigger.id }) : undoFriction({ triggerId: trigger.id });
      },
      delta === 1 ? { successMessage: `+1 on “${trigger.name}”. Your root-cause chart just got sharper.` } : {},
    );

  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between mb-1">
        <Eyebrow>
          Defect tally · <Term k="muda">Muda</Term>
        </Eyebrow>
        <span className="font-mono text-[11px] text-slateWarm">Feeds the 80/20 chart</span>
      </div>
      <h2 className="font-serif text-2xl text-espresso">Habit blockers &amp; friction</h2>
      <p className="text-xs text-slateWarm mt-1 mb-4">
        Whenever a habit slips, tally what got in the way. Counting without judgment shows which few{" "}
        <Term k="vital-few">vital causes</Term> deserve your energy.
      </p>

      {optimistic.length === 0 ? (
        <EmptyState
          icon={<WindIcon size={22} />}
          title="What gets in your way?"
          description="Pick the blockers you recognize. You can add your own too."
        >
          <div className="w-full text-left">
            <AddTriggerForm showSuggestions />
          </div>
        </EmptyState>
      ) : (
        <>
          <ul className="space-y-2.5">
            {optimistic.map((trigger) => (
              <li
                key={trigger.id}
                className="p-3 rounded-xl bg-paper border border-stoneDark flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-espresso truncate">{trigger.name}</div>
                  <div className="mt-1 flex items-center flex-wrap">
                    <TallyMarks count={trigger.weekCount} />
                    {trigger.weekCount > 0 && (
                      <span className="font-mono text-[11px] text-slateWarm ml-1">({trigger.weekCount})</span>
                    )}
                  </div>
                </div>
                {canEdit && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={trigger.weekCount === 0 || isPending}
                      onClick={() => change(trigger, -1)}
                      aria-label={`Remove one tally from ${trigger.name}`}
                      className="w-7 h-7 rounded-lg border border-stoneDark bg-ivory hover:bg-stone text-slateWarm flex items-center justify-center transition disabled:opacity-40"
                    >
                      <MinusIcon size={12} weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => change(trigger, 1)}
                      aria-label={`Add one tally to ${trigger.name}`}
                      className="px-2.5 h-7 rounded-lg bg-terracottaLight hover:bg-terracotta hover:text-ivory text-terracotta border border-terracotta/30 text-xs font-mono font-semibold transition active:scale-95"
                    >
                      +1
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {canEdit && (
            <div className="mt-5 pt-4 border-t border-stoneDark">
              <AddTriggerForm />
            </div>
          )}
        </>
      )}
    </Card>
  );
}
