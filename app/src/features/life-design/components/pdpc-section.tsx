"use client";

import { useState } from "react";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/ssr/TreeStructure";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { WarningIcon } from "@phosphor-icons/react/dist/ssr/Warning";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { Button } from "@/components/ui/button";
import { Card, SectionHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { useAction } from "@/hooks/use-action";
import { cn } from "@/lib/cn";
import { Term } from "@/features/glossary/term";
import { deletePillar, deleteScenario, setObjective, toggleScenario } from "../actions";
import { coverage, planCoverage } from "../domain/pdpc";
import type { PdpcPillarDto } from "../types";
import { AddBranchDialog } from "./add-branch-dialog";
import { AddPillarDialog } from "./add-pillar-dialog";
import { GoalDialog } from "./goal-dialog";

/** New tool: the pre-mortem tree. Goal → pillars it depends on → what could go wrong → the backup move. */
export function PdpcSection({ objective, pillars }: { objective: string | null; pillars: PdpcPillarDto[] }) {
  const { run, isPending } = useAction();
  const [editingGoal, setEditingGoal] = useState(false);
  const [addingPillar, setAddingPillar] = useState(false);
  /** Set to a pillar id (or "" for "any") while the branch dialog is open. */
  const [branchFor, setBranchFor] = useState<string | null>(null);
  const [pillarToDelete, setPillarToDelete] = useState<PdpcPillarDto | null>(null);

  const overall = planCoverage(pillars);

  return (
    <Card>
      <SectionHeader
        eyebrow={<>New tool · <Term k="pdpc">Pre-mortem (PDPC)</Term></>}
        tone="terracotta"
        title="What could derail it?"
        description="Imagine the goal failed, then work out why. Decide your backup move for each obstacle now, while you're calm."
        action={
          <div className="flex items-center gap-2">
            {overall.total > 0 && (
              <span className="font-mono text-xs bg-stone px-3 py-1.5 rounded-lg border border-stoneDark">
                <span className={overall.exposed === 0 ? "text-sage font-semibold" : "text-terracotta font-semibold"}>{overall.covered}</span>/
                {overall.total} covered
              </span>
            )}
            <Button variant="dark" size="sm" onClick={() => setAddingPillar(true)} className="py-2.5!">
              <PlusIcon size={14} weight="bold" /> Pillar
            </Button>
            {pillars.length > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setBranchFor("")} className="py-2.5!">
                <WarningIcon size={14} weight="bold" /> Add a risk
              </Button>
            )}
          </div>
        }
      />

      <div className="bg-paper rounded-2xl p-4 lg:p-6 border border-stoneDark">
        {/* Level 1: the goal everything below protects. */}
        <div className="flex justify-center mb-6">
          <div className="bg-espresso text-ivory px-6 py-3 rounded-xl shadow-sm text-center max-w-md w-full relative">
            <div className="font-mono text-[10px] uppercase tracking-widest text-stoneDark">Level 1: Your goal</div>
            <div className="font-serif text-xl mt-0.5">{objective ?? "Set the goal you're protecting"}</div>
            <button
              type="button"
              onClick={() => setEditingGoal(true)}
              aria-label="Edit goal"
              className="absolute top-2 right-2 p-1.5 rounded-lg text-stoneDark hover:text-ivory hover:bg-ivory/10 transition"
            >
              <PencilSimpleIcon size={14} />
            </button>
          </div>
        </div>

        {pillars.length === 0 ? (
          <EmptyState
            icon={<TreeStructureIcon size={22} />}
            title="No pillars yet"
            description="A pillar is a habit your goal depends on. Add two or three, then list what could go wrong with each."
          >
            <Button variant="dark" size="sm" onClick={() => setAddingPillar(true)}>
              <PlusIcon size={14} weight="bold" /> Add a pillar
            </Button>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pillars.map((pillar, index) => {
              const pillarCoverage = coverage(pillar.scenarios);
              return (
                <div key={pillar.id} className="bg-ivory rounded-xl border border-stoneDark p-4 flex flex-col gap-4">
                  <div className="bg-stone/80 p-3 rounded-lg border border-stoneDark flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] uppercase text-slateWarm">Level 2: Pillar {String(index + 1).padStart(2, "0")}</div>
                      <div className="font-semibold text-sm text-espresso mt-0.5">{pillar.title}</div>
                      {pillar.subtitle && <div className="text-[11px] text-slateWarm">{pillar.subtitle}</div>}
                    </div>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setPillarToDelete(pillar)}
                      aria-label={`Delete pillar: ${pillar.title}`}
                      className="p-1 rounded-lg text-slateWarm hover:text-terracotta hover:bg-terracottaLight transition shrink-0"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>

                  <div className="space-y-3 flex-1">
                    {pillar.scenarios.length === 0 && <p className="text-[11px] text-slateWarm px-1">Nothing listed yet. What would knock this off track?</p>}
                    {pillar.scenarios.map((scenario) => (
                      <div key={scenario.id} className="rounded-xl border border-stoneDark overflow-hidden">
                        <div className="bg-ochreLight p-3 border-b border-ochre/20 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-ochre font-semibold">
                              <WarningIcon size={12} weight="fill" /> Obstacle / risk
                            </div>
                            <div className="text-xs font-medium text-espresso mt-0.5">{scenario.risk}</div>
                          </div>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => run(() => deleteScenario({ scenarioId: scenario.id }))}
                            aria-label={`Remove risk: ${scenario.risk}`}
                            className="p-1 rounded-lg text-slateWarm hover:text-terracotta hover:bg-terracottaLight transition shrink-0"
                          >
                            <XIcon size={12} weight="bold" />
                          </button>
                        </div>
                        <div className={cn("p-3", scenario.active ? "bg-sageLight/70" : "bg-paper")}>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] uppercase text-sage font-semibold">Backup plan</span>
                            <button
                              type="button"
                              disabled={isPending}
                              aria-pressed={scenario.active}
                              onClick={() => run(() => toggleScenario({ scenarioId: scenario.id }))}
                              className={cn(
                                "font-mono text-[10px] px-2 py-0.5 rounded border transition",
                                scenario.active ? "bg-sage text-ivory border-sage" : "bg-ivory text-slateWarm border-stoneDark hover:text-espresso",
                              )}
                            >
                              {scenario.active ? "✓ Active" : "Activate"}
                            </button>
                          </div>
                          <div className="text-xs text-espresso mt-1">{scenario.counter}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button type="button" onClick={() => setBranchFor(pillar.id)} className="text-[11px] font-mono text-terracotta hover:underline">
                      + Add risk
                    </button>
                    {pillarCoverage.exposed > 0 && (
                      <span className="font-mono text-[10px] text-terracotta">
                        {pillarCoverage.exposed} without a backup
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <GoalDialog
        key={`goal-${editingGoal}`}
        open={editingGoal}
        onClose={() => setEditingGoal(false)}
        eyebrow="Pre-mortem"
        title="What are you protecting?"
        label="Your goal, in one line"
        hint="The outcome the pillars below exist to protect."
        placeholder="e.g. Complete a 30-day sugar reset with 6:30 AM training"
        initial={objective}
        save={(value) => setObjective({ objective: value })}
      />
      <AddPillarDialog open={addingPillar} onClose={() => setAddingPillar(false)} />
      <AddBranchDialog
        key={`branch-${branchFor ?? "closed"}`}
        open={branchFor !== null}
        onClose={() => setBranchFor(null)}
        pillars={pillars}
        pillarId={branchFor || null}
      />
      <Modal open={pillarToDelete !== null} onClose={() => setPillarToDelete(null)} eyebrow="Pre-mortem" title="Delete this pillar?">
        {pillarToDelete && (
          <>
            <p className="text-sm text-slateWarm">
              “{pillarToDelete.title}” and its {pillarToDelete.scenarios.length} risk{pillarToDelete.scenarios.length === 1 ? "" : "s"} will be removed.
            </p>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" size="sm" onClick={() => setPillarToDelete(null)}>
                Keep it
              </Button>
              <Button
                size="sm"
                disabled={isPending}
                onClick={() =>
                  run(() => deletePillar({ pillarId: pillarToDelete.id }), {
                    successMessage: "Pillar deleted.",
                    onSuccess: () => setPillarToDelete(null),
                  })
                }
              >
                Delete pillar
              </Button>
            </div>
          </>
        )}
      </Modal>
    </Card>
  );
}
