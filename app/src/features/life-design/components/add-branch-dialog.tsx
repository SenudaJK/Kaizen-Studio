"use client";

import { Button } from "@/components/ui/button";
import { Field, Select, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useAction } from "@/hooks/use-action";
import { Term } from "@/features/glossary/term";
import { addScenario } from "../actions";
import type { PdpcPillarDto } from "../types";

/** Adds a "what could go wrong" branch to a pillar, always with the backup move that answers it. */
export function AddBranchDialog({
  open,
  onClose,
  pillars,
  pillarId,
}: {
  open: boolean;
  onClose: () => void;
  pillars: PdpcPillarDto[];
  /** Pillar preselected when opened from a pillar's own button. */
  pillarId: string | null;
}) {
  const { run, isPending } = useAction();

  return (
    <Modal open={open} onClose={onClose} eyebrow="Pre-mortem" title="What could go wrong?">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          run(() => addScenario({ pillarId: data.get("pillarId"), risk: data.get("risk"), counter: data.get("counter") }), {
            successMessage: "Risk and backup plan added.",
            onSuccess: onClose,
          });
        }}
      >
        <Field label="Pillar">
          <Select name="pillarId" required defaultValue={pillarId ?? pillars[0]?.id}>
            {pillars.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Obstacle" hint="Be specific: a real situation, not a vague worry.">
          <TextInput name="risk" required maxLength={140} autoFocus placeholder="e.g. Unexpected late client call at 9 PM" />
        </Field>
        <Field label="Backup plan" hint={<>Your pre-decided <Term k="pdpc">countermeasure</Term>, so you don&apos;t have to think in the moment.</>}>
          <TextInput name="counter" required maxLength={200} placeholder="e.g. Switch to 10-min breathwork + magnesium" />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            Add to the tree
          </Button>
        </div>
      </form>
    </Modal>
  );
}
