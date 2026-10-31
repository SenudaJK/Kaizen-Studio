"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Icon } from "@phosphor-icons/react";
import { DeviceMobileIcon } from "@phosphor-icons/react/dist/ssr/DeviceMobile";
import { GitForkIcon } from "@phosphor-icons/react/dist/ssr/GitFork";
import { HeartbeatIcon } from "@phosphor-icons/react/dist/ssr/Heartbeat";
import { HouseLineIcon } from "@phosphor-icons/react/dist/ssr/HouseLine";
import { ListChecksIcon } from "@phosphor-icons/react/dist/ssr/ListChecks";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import { TrashIcon } from "@phosphor-icons/react/dist/ssr/Trash";
import { XIcon } from "@phosphor-icons/react/dist/ssr/X";
import { Button } from "@/components/ui/button";
import { Card, SectionHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useAction } from "@/hooks/use-action";
import { cn } from "@/lib/cn";
import { Term } from "@/features/glossary/term";
import { deleteProblem, removeCause, setPrimaryCause } from "../actions";
import { FISHBONE_CATEGORIES, groupByCategory, primaryCause, type CategoryInfo } from "../domain/fishbone";
import type { FishboneCategory, FishboneProblemDto } from "../types";
import { AddCauseDialog } from "./add-cause-dialog";
import { NewProblemDialog } from "./new-problem-dialog";

const BONE_ICONS: Record<FishboneCategory, { icon: Icon; className: string }> = {
  ENVIRONMENT: { icon: HouseLineIcon, className: "text-terracotta" },
  ENERGY: { icon: HeartbeatIcon, className: "text-terracotta" },
  ROUTINE: { icon: ListChecksIcon, className: "text-sage" },
  MINDSET: { icon: DeviceMobileIcon, className: "text-sage" },
};

/** Basic Tool: the fishbone. Causes sit on four fixed bones; one is chosen as the primary root cause. */
export function FishboneSection({
  problems,
  activeKey,
  basePath,
  rangeQuery,
}: {
  problems: FishboneProblemDto[];
  /** Problem key from the URL; falls back to the first problem when missing or stale. */
  activeKey: string | null;
  basePath: string;
  /** Carries the Pareto window through problem switches, e.g. "&range=month". */
  rangeQuery: string;
}) {
  const router = useRouter();
  const { run, isPending } = useAction();
  const [adding, setAdding] = useState<CategoryInfo | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const problem = problems.find((p) => p.key === activeKey) ?? problems[0] ?? null;
  const bones = problem ? groupByCategory(problem.causes) : null;
  const primary = problem ? primaryCause(problem.causes) : null;

  const renderBone = (info: CategoryInfo, index: number) => {
    const { icon: BoneIcon, className } = BONE_ICONS[info.key];
    const causes = bones?.[info.key] ?? [];
    return (
      <div key={info.key} className="bg-ivory p-4 rounded-xl border border-stoneDark shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-espresso flex items-center gap-1.5">
            <BoneIcon size={16} weight="fill" className={className} />
            {index + 1}. {info.label}
          </h3>
          <button
            type="button"
            onClick={() => setAdding(info)}
            className="text-[11px] font-mono text-terracotta hover:underline shrink-0"
          >
            + Add cause
          </button>
        </div>
        {causes.length === 0 ? (
          <p className="text-[11px] text-slateWarm px-1 py-2">{info.hint}</p>
        ) : (
          <ul className="space-y-1.5">
            {causes.map((cause) => (
              <li key={cause.id} className="flex items-stretch gap-1">
                <button
                  type="button"
                  disabled={isPending}
                  aria-pressed={cause.isPrimary}
                  onClick={() => !cause.isPrimary && run(() => setPrimaryCause({ causeId: cause.id }), { successMessage: "Primary root cause updated." })}
                  className={cn(
                    "flex-1 min-w-0 text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition border",
                    cause.isPrimary
                      ? "bg-terracottaLight border-terracotta text-espresso font-semibold"
                      : "bg-paper hover:bg-stone/70 border-stoneDark text-espresso",
                  )}
                >
                  <span className="leading-snug">{cause.text}</span>
                  <span className={cn("font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0", cause.isPrimary ? "bg-terracotta text-ivory" : "text-slateWarm")}>
                    {cause.isPrimary ? "PRIMARY" : "Make primary"}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => run(() => removeCause({ causeId: cause.id }))}
                  aria-label={`Remove cause: ${cause.text}`}
                  className="w-7 shrink-0 rounded-lg text-slateWarm hover:text-terracotta hover:bg-terracottaLight flex items-center justify-center transition"
                >
                  <XIcon size={12} weight="bold" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <Card id="fishbone" className="scroll-mt-6">
      <SectionHeader
        eyebrow={<>Basic tool · <Term k="fishbone">Fishbone diagram</Term></>}
        tone="sage"
        title="Why it keeps happening"
        description="Look past willpower. Sort what contributed into four areas, then pick the one cause to fix first."
        action={
          <div className="flex items-center gap-2">
            {problems.length > 0 && problem && (
              <>
                <label className="flex items-center gap-2">
                  <span className="sr-only">Slip to diagnose</span>
                  <Select
                    value={problem.key}
                    onChange={(event) => router.push(`${basePath}?problem=${encodeURIComponent(event.target.value)}${rangeQuery}#fishbone`, { scroll: false })}
                    className="py-2! text-xs font-semibold max-w-52"
                  >
                    {problems.map((p) => (
                      <option key={p.id} value={p.key}>
                        {p.title}
                      </option>
                    ))}
                  </Select>
                </label>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setConfirmingDelete(true)}
                  aria-label={`Delete diagnosis: ${problem.title}`}
                  className="w-9 h-9 rounded-xl border border-stoneDark bg-ivory hover:bg-terracottaLight text-slateWarm hover:text-terracotta flex items-center justify-center transition"
                >
                  <TrashIcon size={16} />
                </button>
              </>
            )}
            <Button variant="dark" size="sm" onClick={() => setCreating(true)} className="py-2.5!">
              <PlusIcon size={14} weight="bold" /> New
            </Button>
          </div>
        }
      />

      {!problem || !bones ? (
        <EmptyState
          icon={<GitForkIcon size={22} />}
          title="No diagnosis yet"
          description="Use Diagnose on a blocker in the chart above, or start from any slip you want to understand."
        >
          <Button variant="dark" size="sm" onClick={() => setCreating(true)}>
            <PlusIcon size={14} weight="bold" /> Start a diagnosis
          </Button>
        </EmptyState>
      ) : (
        <div className="bg-paper rounded-2xl p-4 lg:p-6 border border-stoneDark">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">{FISHBONE_CATEGORIES.slice(0, 2).map(renderBone)}</div>

          {/* Spine and head: the effect every bone points at. */}
          <div className="my-5 flex items-center" aria-hidden="true">
            <div className="flex-1 h-1 bg-espresso rounded-l-full" />
            <div className="w-0 h-0 border-y-10 border-y-transparent border-l-16 border-l-espresso" />
          </div>
          <div className="mb-5 flex justify-end">
            <div className="bg-terracotta text-ivory px-5 py-3.5 rounded-2xl shadow-md max-w-xs w-full md:w-auto border-2 border-espresso/10">
              <div className="font-mono text-[10px] uppercase tracking-widest opacity-80">The slip</div>
              <div className="font-serif text-xl leading-tight mt-0.5">{problem.title}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">{FISHBONE_CATEGORIES.slice(2).map((info, i) => renderBone(info, i + 2))}</div>

          <div className="mt-6 bg-sageLight border border-sage/30 rounded-xl p-4 flex items-start gap-3">
            <ShieldCheckIcon size={22} weight="fill" className="text-sage mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="font-mono text-[11px] uppercase tracking-wider text-sage font-semibold">
                <Term k="poka-yoke">Mistake-proofing</Term> countermeasure
              </div>
              {primary ? (
                <>
                  <div className="text-sm font-semibold text-espresso mt-0.5">Primary root cause: {primary.text}</div>
                  <div className="text-xs text-slateWarm mt-0.5">Countermeasure: {primary.fix}</div>
                </>
              ) : (
                <div className="text-xs text-slateWarm mt-0.5">
                  Add a cause, then select the one that matters most. Its countermeasure shows up here.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {problem && <AddCauseDialog problemId={problem.id} category={adding} onClose={() => setAdding(null)} />}
      {problem && (
        <Modal open={confirmingDelete} onClose={() => setConfirmingDelete(false)} eyebrow="Fishbone" title="Delete this diagnosis?">
          <p className="text-sm text-slateWarm">
            “{problem.title}” and its {problem.causes.length} cause{problem.causes.length === 1 ? "" : "s"} will be removed. Your tallied blockers are kept.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setConfirmingDelete(false)}>
              Keep it
            </Button>
            <Button
              size="sm"
              disabled={isPending}
              onClick={() =>
                run(() => deleteProblem({ problemId: problem.id }), {
                  successMessage: "Diagnosis deleted.",
                  onSuccess: () => setConfirmingDelete(false),
                })
              }
            >
              Delete diagnosis
            </Button>
          </div>
        </Modal>
      )}
      <NewProblemDialog open={creating} onClose={() => setCreating(false)} />
    </Card>
  );
}
