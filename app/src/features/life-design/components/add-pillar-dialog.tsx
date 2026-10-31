"use client";

import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useAction } from "@/hooks/use-action";
import { addPillar } from "../actions";

/** A pillar is one habit or routine the goal depends on. */
export function AddPillarDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { run, isPending } = useAction();

  return (
    <Modal open={open} onClose={onClose} eyebrow="Pre-mortem" title="Add a pillar">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          run(() => addPillar({ title: data.get("title"), subtitle: data.get("subtitle") ?? "" }), {
            successMessage: "Pillar added. Now name what could go wrong.",
            onSuccess: onClose,
          });
        }}
      >
        <Field label="What does your goal depend on?" hint="One habit or routine that has to hold for the goal to work.">
          <TextInput name="title" required maxLength={80} autoFocus placeholder="e.g. 6:30 AM fasted training" />
        </Field>
        <Field label="Detail (optional)">
          <TextInput name="subtitle" maxLength={100} placeholder="e.g. 4x strength + 2x zone 2 runs" />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            Add pillar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
