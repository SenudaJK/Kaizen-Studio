"use client";

import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useAction } from "@/hooks/use-action";
import { Term } from "@/features/glossary/term";
import { addCause } from "../actions";
import type { CategoryInfo } from "../domain/fishbone";

/** Adds a cause to one bone, always paired with the countermeasure that would remove it. */
export function AddCauseDialog({
  problemId,
  category,
  onClose,
}: {
  problemId: string;
  /** The bone being added to; the dialog is open whenever this is set. */
  category: CategoryInfo | null;
  onClose: () => void;
}) {
  const { run, isPending } = useAction();

  return (
    <Modal open={category !== null} onClose={onClose} eyebrow="Fishbone" title={category ? `Add a cause: ${category.label}` : "Add a cause"}>
      {category && (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            run(() => addCause({ problemId, category: category.key, text: data.get("text"), fix: data.get("fix") }), {
              successMessage: "Cause and countermeasure added.",
              onSuccess: onClose,
            });
          }}
        >
          <Field label="What contributed to the slip?" hint={category.hint}>
            <TextInput name="text" required maxLength={120} autoFocus placeholder="e.g. Phone charging on the nightstand" />
          </Field>
          <Field
            label="Countermeasure"
            hint={<>A <Term k="poka-yoke">mistake-proofing</Term> change that works even on a bad day, not a promise to try harder.</>}
          >
            <TextInput name="fix" required maxLength={200} placeholder="e.g. Charge the phone in the kitchen from 10pm" />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              Add cause
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
