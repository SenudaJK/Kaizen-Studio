"use client";

import { useState } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { PathIcon } from "@phosphor-icons/react/dist/ssr/Path";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { Button } from "@/components/ui/button";
import { Card, SectionHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAction } from "@/hooks/use-action";
import { cn } from "@/lib/cn";
import { Term } from "@/features/glossary/term";
import { deleteNode, setArrowGoal, setNodePath, toggleNode } from "../actions";
import { formatDays, nextMilestone, summarizeNetwork } from "../domain/arrow";
import type { ArrowNodeDto } from "../types";
import { AddNodeDialog } from "./add-node-dialog";
import { GoalDialog } from "./goal-dialog";

/** New tool: the arrow diagram. Milestones in order; the critical path is the chain that sets the finish date. */
export function ArrowSection({ goal, nodes }: { goal: string | null; nodes: ArrowNodeDto[] }) {
  const { run, isPending } = useAction();
  const [adding, setAdding] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);

  const summary = summarizeNetwork(nodes);
  const next = nextMilestone(nodes);

  return (
    <Card>
      <SectionHeader
        eyebrow={<>New tool · <Term k="arrow-diagram">Arrow diagram</Term></>}
        tone="sage"
        title={goal ?? "Your path to the goal"}
        description="Line up the milestones in order. The ones that hold up the finish are your critical path: protect those first."
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditingGoal(true)} className="py-2.5!" aria-label="Edit goal">
              <PencilSimpleIcon size={14} /> Goal
            </Button>
            <Button variant="dark" size="sm" onClick={() => setAdding(true)} className="py-2.5!">
              <PlusIcon size={14} weight="bold" /> Milestone
            </Button>
          </div>
        }
      />

      {nodes.length === 0 ? (
        <EmptyState
          icon={<PathIcon size={22} />}
          title="No milestones yet"
          description="Break a multi-week goal into steps, in the order you'll do them, and mark which ones can't slip."
        >
          <Button variant="dark" size="sm" onClick={() => setAdding(true)}>
            <PlusIcon size={14} weight="bold" /> Add a milestone
          </Button>
        </EmptyState>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4 font-mono text-xs">
            <span className="bg-stone px-3 py-1.5 rounded-lg border border-stoneDark">
              <Term k="critical-path">Critical path</Term>: <strong className="text-terracotta">{formatDays(summary.criticalDays)}</strong>
            </span>
            <span className="bg-stone px-3 py-1.5 rounded-lg border border-stoneDark">
              {summary.doneCount}/{summary.nodeCount} done
            </span>
            {summary.criticalDays > 0 && (
              <span className="bg-stone px-3 py-1.5 rounded-lg border border-stoneDark">
                <strong className="text-espresso">{formatDays(summary.criticalDaysLeft)}</strong> left · {summary.percentDone}%
              </span>
            )}
            {summary.slackDays > 0 && (
              <span className="bg-stone px-3 py-1.5 rounded-lg border border-stoneDark text-slateWarm">{formatDays(summary.slackDays)} of slack</span>
            )}
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {nodes.map((node, index) => {
              const critical = node.path === "CRITICAL_PATH";
              return (
                <li key={node.id} className="relative">
                  <div
                    className={cn(
                      "h-full p-4 rounded-xl border flex flex-col transition",
                      node.done ? "bg-sageLight/70 border-sage/40" : "bg-paper border-stoneDark",
                      next?.id === node.id && "ring-2 ring-terracotta/60",
                    )}
                  >
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span
                        className={cn(
                          "w-7 h-7 rounded-full font-mono text-xs font-semibold flex items-center justify-center shrink-0",
                          node.done ? "bg-sage text-ivory" : "bg-espresso text-ivory",
                        )}
                      >
                        {node.code}
                      </span>
                      <div className="flex items-center gap-1 min-w-0">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => run(() => setNodePath({ nodeId: node.id, path: critical ? "PARALLEL_SLACK" : "CRITICAL_PATH" }))}
                          title={critical ? "Mark as having slack" : "Mark as critical path"}
                          className={cn(
                            "font-mono text-[10px] px-2 py-0.5 rounded transition truncate",
                            critical ? "bg-terracottaLight text-terracotta font-semibold" : "bg-stone text-slateWarm hover:text-espresso",
                          )}
                        >
                          {critical ? "Critical" : "Slack"}
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => run(() => deleteNode({ nodeId: node.id }))}
                          aria-label={`Remove milestone: ${node.title}`}
                          className="p-1 rounded-lg text-slateWarm hover:text-terracotta hover:bg-terracottaLight transition shrink-0"
                        >
                          <XIcon size={12} weight="bold" />
                        </button>
                      </div>
                    </div>
                    <div className="font-semibold text-xs text-espresso leading-snug my-1 flex-1">{node.title}</div>
                    <button
                      type="button"
                      disabled={isPending}
                      aria-pressed={node.done}
                      onClick={() => run(() => toggleNode({ nodeId: node.id }))}
                      className="mt-2 pt-2 border-t border-stoneDark/60 flex items-center justify-between font-mono text-[11px] w-full text-left"
                    >
                      <span className="text-slateWarm">{formatDays(node.durationDays)}</span>
                      <span className={node.done ? "text-sage font-semibold" : "text-slateWarm hover:text-espresso"}>
                        {node.done ? "✓ Done" : "Mark done"}
                      </span>
                    </button>
                  </div>
                  {index < nodes.length - 1 && (
                    <ArrowRightIcon
                      size={14}
                      aria-hidden="true"
                      className="hidden xl:block absolute top-1/2 -right-2.5 -translate-y-1/2 text-slateWarm/60 z-10 bg-ivory rounded-full"
                    />
                  )}
                </li>
              );
            })}
          </ol>

          <p className="text-xs text-slateWarm mt-4">
            {next ? (
              <>
                Next on the critical path: <strong className="text-espresso">{next.title}</strong> ({formatDays(next.durationDays)}).
              </>
            ) : summary.criticalDays > 0 ? (
              "The critical path is complete. Everything left has slack."
            ) : (
              "Mark at least one milestone as critical to see your finish line."
            )}
          </p>
        </>
      )}

      <AddNodeDialog open={adding} onClose={() => setAdding(false)} />
      <GoalDialog
        key={`goal-${editingGoal}`}
        open={editingGoal}
        onClose={() => setEditingGoal(false)}
        eyebrow="Arrow diagram"
        title="What is this path leading to?"
        label="Your goal, in one line"
        hint="The finish line the milestones build toward."
        placeholder="e.g. Half-marathon under 1:45"
        initial={goal}
        save={(value) => setArrowGoal({ goal: value })}
      />
    </Card>
  );
}
