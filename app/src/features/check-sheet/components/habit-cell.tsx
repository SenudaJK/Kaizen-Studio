"use client";

import { CheckIcon } from "@phosphor-icons/react/dist/ssr/Check";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { cn } from "@/lib/cn";
import type { LoggedStatus } from "../types";

export type CellState = LoggedStatus | "PENDING";

const NEXT: Record<CellState, CellState> = { PENDING: "DONE", DONE: "SLIP", SLIP: "PENDING" };
export const nextCellState = (state: CellState): CellState => NEXT[state];

const STATE_LABEL: Record<CellState, string> = { PENDING: "not logged", DONE: "done", SLIP: "slipped" };

/**
 * One day of one habit. Click cycles: not logged → done → slipped → not logged.
 * `locked` cells (future days, or days before the habit existed) can't be changed.
 */
export function HabitCell({
  state,
  locked,
  label,
  onChange,
}: {
  state: CellState;
  locked: boolean;
  /** e.g. "Mobility, Tuesday" — for screen readers. */
  label: string;
  onChange: (next: CellState) => void;
}) {
  if (locked) {
    return (
      <span aria-label={`${label}: not available`} className="inline-flex w-8 h-8 items-center justify-center text-stoneDark">
        ·
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onChange(nextCellState(state))}
      aria-label={`${label}: ${STATE_LABEL[state]}. Press to change.`}
      className={cn(
        "w-8 h-8 rounded-lg border inline-flex items-center justify-center transition active:scale-90",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta",
        state === "DONE" && "bg-sage text-ivory border-sage animate-pop",
        state === "SLIP" && "bg-terracottaLight text-terracotta border-terracotta/50 animate-pop",
        state === "PENDING" && "bg-paper border-stoneDark text-transparent hover:border-sage hover:text-sage/40",
      )}
    >
      {state === "SLIP" ? <XIcon size={14} weight="bold" /> : <CheckIcon size={14} weight="bold" />}
    </button>
  );
}
