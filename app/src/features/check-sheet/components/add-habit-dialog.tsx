"use client";

import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useAction } from "@/hooks/use-action";
import { addHabit } from "../actions";

export function AddHabitDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { run, isPending } = useAction();

  return (
    <Modal open={open} onClose={onClose} eyebrow="Check sheet" title="Add a habit">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          run(() => addHabit({ name: data.get("name"), target: data.get("target") }), {
            successMessage: "Habit added to your check sheet.",
            onSuccess: onClose,
          });
        }}
      >
        <Field label="What do you want to do?">
          <TextInput name="name" required maxLength={80} autoFocus placeholder="e.g. 30-minute workout" />
        </Field>
        <Field label="Your standard (optional)" hint="What counts as “done”? A clear bar means no daily negotiating.">
          <TextInput name="target" maxLength={40} placeholder="e.g. Before 8am, or 20 pages" />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            Add habit
          </Button>
        </div>
      </form>
    </Modal>
  );
}
