"use client";

import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useAction } from "@/hooks/use-action";
import { createProblem } from "../actions";

/** Starts a fishbone for any slip, including ones that aren't a tallied blocker yet. */
export function NewProblemDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { run, isPending } = useAction();

  return (
    <Modal open={open} onClose={onClose} eyebrow="Fishbone" title="What do you want to dig into?">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          run(() => createProblem({ title: data.get("title") }), {
            successMessage: "Diagnosis started. Add the causes you can think of.",
            onSuccess: onClose,
          });
        }}
      >
        <Field label="The slip, in one line" hint="Describe what went wrong, not who is to blame.">
          <TextInput name="title" required maxLength={80} autoFocus placeholder="e.g. Missed the 6:30am workout" />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            Start diagnosis
          </Button>
        </div>
      </form>
    </Modal>
  );
}
