"use client";

import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { cn } from "@/lib/cn";
import { formatMinutes } from "../domain/routine";
import { STEP_KINDS } from "../domain/step-kinds";
import type { FlowStepDto } from "../types";

/**
 * One step in the routine chain. The first unfinished step is highlighted as "up next",
 * so you never have to decide what to do; just do the lit-up thing.
 */
export function FlowStepCard({
  step,
  position,
  isNext,
  isLast,
  editing,
  onToggle,
  onRemove,
}: {
  step: FlowStepDto;
  /** 1-based position in the routine. */
  position: number;
  isNext: boolean;
  isLast: boolean;
  editing: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const kind = STEP_KINDS[step.kind];

  return (
    <li className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={step.doneToday}
        aria-label={`Step ${position}: ${step.name}, ${formatMinutes(step.durationMin)}. ${step.doneToday ? "Done." : "Not done."}`}
        className={cn(
          "w-full h-full text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between active:scale-[0.98]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta",
          step.doneToday && "bg-sageLight/70 border-sage/30",
          !step.doneToday && !isNext && "bg-paper hover:bg-stone/70 border-stoneDark",
          isNext && "bg-ivory border-terracotta/50 ring-2 ring-terracotta/15 hover:bg-terracottaLight/40",
        )}
      >
        <div className="mb-2">
          <span
            title={`${kind.lssTerm}: ${kind.description}`}
            className={cn(
              "inline-block whitespace-nowrap font-mono text-[10px] uppercase px-2 py-0.5 rounded",
              step.doneToday ? "bg-sage text-ivory" : "bg-stoneDark/70 text-slateWarm",
            )}
          >
            {String(position).padStart(2, "0")} · {kind.label}
          </span>
        </div>
        <div className="font-medium text-xs leading-snug text-espresso pr-4">{step.name}</div>
        <div className="mt-2.5 flex items-center justify-between">
          <span
            className={cn(
              "text-[11px] font-mono",
              step.doneToday ? "text-sage font-semibold" : isNext ? "text-terracotta font-semibold" : "text-slateWarm",
            )}
          >
            {step.doneToday ? "✓ Done" : isNext ? "→ Up next" : "○ To do"}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-slateWarm whitespace-nowrap">
            {formatMinutes(step.durationMin)}
            {!isLast && <ArrowRightIcon size={12} weight="bold" className="text-slateWarm/50 hidden lg:inline" />}
          </span>
        </div>
      </button>

      {editing && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove step: ${step.name}`}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ivory border border-terracotta/40 text-terracotta flex items-center justify-center shadow-sm hover:bg-terracottaLight transition"
        >
          <TrashIcon size={12} />
        </button>
      )}
    </li>
  );
}
