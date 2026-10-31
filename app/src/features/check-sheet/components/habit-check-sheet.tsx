"use client";

import { useOptimistic, useState } from "react";
import { ListChecksIcon } from "@phosphor-icons/react/dist/ssr/ListChecks";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { Button } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAction } from "@/hooks/use-action";
import { cn } from "@/lib/cn";
import { formatDayOfMonth, formatLongDate, formatWeekdayShort, type IsoDate } from "@/lib/dates";
import { Term } from "@/features/glossary/term";
import { archiveHabit, setHabitStatus } from "../actions";
import { habitYield, yieldRatio } from "../domain/yield";
import type { HabitDto } from "../types";
import { AddHabitDialog } from "./add-habit-dialog";
import { HabitCell, type CellState } from "./habit-cell";
import { SlipPrompt } from "./slip-prompt";
import { WeekSwitcher } from "./week-switcher";

type Change = { habitId: string; date: IsoDate; state: CellState };

function applyChange(habits: HabitDto[], { habitId, date, state }: Change): HabitDto[] {
  return habits.map((habit) => {
    if (habit.id !== habitId) return habit;
    const statuses = { ...habit.statuses };
    if (state === "PENDING") delete statuses[date];
    else statuses[date] = state;
    return { ...habit, statuses };
  });
}

/** Basic Tool: the Check Sheet. A week-at-a-glance grid; each cell is one habit on one day. */
export function HabitCheckSheet({
  habits,
  triggers,
  days,
  today,
  weekStart,
  isCurrentWeek,
  className,
}: {
  className?: string;
  habits: HabitDto[];
  triggers: Array<{ id: string; name: string }>;
  days: IsoDate[];
  today: IsoDate;
  weekStart: IsoDate;
  isCurrentWeek: boolean;
}) {
  const { run } = useAction();
  const [optimistic, applyOptimistic] = useOptimistic(habits, applyChange);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [slippedHabit, setSlippedHabit] = useState<string | null>(null);

  const change = (habit: HabitDto, date: IsoDate, state: CellState) => {
    if (state === "SLIP") setSlippedHabit(habit.name);
    run(async () => {
      applyOptimistic({ habitId: habit.id, date, state });
      return setHabitStatus({ habitId: habit.id, date, status: state });
    });
  };

  return (
    <Card className={cn("flex flex-col justify-between", className)}>
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <Eyebrow tone="sage">
              Basic Tool · <Term k="check-sheet">Check Sheet</Term>
            </Eyebrow>
            <h2 className="font-serif text-2xl text-espresso mt-0.5">Weekly habit check sheet</h2>
          </div>
          <WeekSwitcher weekStart={weekStart} isCurrentWeek={isCurrentWeek} />
        </div>

        {optimistic.length === 0 ? (
          <EmptyState
            icon={<ListChecksIcon size={22} />}
            title="Your check sheet is empty"
            description="Add the habits you want to measure. Start with just two or three; consistency beats ambition."
          >
            <Button size="sm" onClick={() => setAdding(true)}>
              <PlusIcon size={14} weight="bold" /> Add your first habit
            </Button>
          </EmptyState>
        ) : (
          <>
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stoneDark text-[11px] font-mono uppercase text-slateWarm">
                    <th scope="col" className="py-2.5 pr-3 font-medium">
                      Habit
                    </th>
                    {days.map((day) => (
                      <th key={day} scope="col" className="py-2 px-0.5 text-center font-medium">
                        <div className={cn("leading-tight", day === today && "text-terracotta")}>
                          {formatWeekdayShort(day)}
                          <div className={cn("text-[10px]", day === today ? "font-semibold" : "text-slateWarm/70")}>
                            {formatDayOfMonth(day)}
                          </div>
                        </div>
                      </th>
                    ))}
                    <th scope="col" className="py-2.5 pl-2 text-right font-medium">
                      <Term k="yield" align="right">
                        Yield
                      </Term>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone text-sm">
                  {optimistic.map((habit) => (
                    <HabitRow
                      key={habit.id}
                      habit={habit}
                      days={days}
                      today={today}
                      editing={editing}
                      onChange={(date, state) => change(habit, date, state)}
                      onRemove={() =>
                        run(() => archiveHabit({ habitId: habit.id }), {
                          successMessage: `Removed “${habit.name}”.`,
                        })
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
                <PlusIcon size={14} weight="bold" /> Add habit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing((v) => !v)} aria-pressed={editing}>
                <PencilSimpleIcon size={14} /> {editing ? "Done editing" : "Edit"}
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-stoneDark flex flex-wrap items-center justify-between gap-2 text-xs text-slateWarm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-sage inline-block" /> Done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-terracottaLight border border-terracotta inline-block" /> Slipped
          </span>
        </div>
        <span className="font-mono text-[11px]">Click a day to cycle: done → slipped → clear</span>
      </div>

      <AddHabitDialog open={adding} onClose={() => setAdding(false)} />
      <SlipPrompt habitName={slippedHabit} triggers={triggers} onClose={() => setSlippedHabit(null)} />
    </Card>
  );
}

function HabitRow({
  habit,
  days,
  today,
  editing,
  onChange,
  onRemove,
}: {
  habit: HabitDto;
  days: IsoDate[];
  today: IsoDate;
  editing: boolean;
  onChange: (date: IsoDate, state: CellState) => void;
  onRemove: () => void;
}) {
  const ratio = yieldRatio(habitYield(habit, days, today));

  return (
    <tr className="hover:bg-stone/40 transition">
      <th scope="row" className="py-3 pr-3 font-normal">
        <div className="flex items-center gap-2">
          {editing && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${habit.name}`}
              className="p-1 rounded-md text-terracotta hover:bg-terracottaLight transition shrink-0"
            >
              <TrashIcon size={14} />
            </button>
          )}
          <div className="min-w-0">
            <div className="font-medium text-xs text-espresso">{habit.name}</div>
            {habit.target && <div className="font-mono text-[10px] text-slateWarm">Standard: {habit.target}</div>}
          </div>
        </div>
      </th>
      {days.map((day) => (
        <td key={day} className="py-2.5 px-0.5 text-center">
          <HabitCell
            state={habit.statuses[day] ?? "PENDING"}
            locked={day > today || day < habit.startsOn}
            label={`${habit.name}, ${formatLongDate(day)}`}
            onChange={(next) => onChange(day, next)}
          />
        </td>
      ))}
      <td
        className={cn(
          "py-3 pl-2 text-right font-mono text-xs font-semibold",
          ratio === null ? "text-slateWarm/50" : ratio >= 0.85 ? "text-sage" : "text-terracotta",
        )}
      >
        {ratio === null ? "—" : `${Math.round(ratio * 100)}%`}
      </td>
    </tr>
  );
}
