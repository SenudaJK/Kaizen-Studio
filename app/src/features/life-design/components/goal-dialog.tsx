"use client";

import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useAction } from "@/hooks/use-action";
import type { ActionResult } from "@/lib/action-result";

/** Edits a one-line goal (the top of the pre-mortem tree, or the end of the arrow network). */
export function GoalDialog({
  open,
  onClose,
  eyebrow,
  title,
  label,
  hint,
  placeholder,
  initial,
  save,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  label: string;
  hint: string;
  placeholder: string;
  initial: string | null;
  save: (value: string) => Promise<ActionResult>;
}) {
  const { run, isPending } = useAction();

  return (
    <Modal open={open} onClose={onClose} eyebrow={eyebrow} title={title}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const value = String(new FormData(event.currentTarget).get("goal") ?? "");
          run(() => save(value), { successMessage: "Goal saved.", onSuccess: onClose });
        }}
      >
        <Field label={label} hint={hint}>
          <TextInput name="goal" maxLength={120} autoFocus defaultValue={initial ?? ""} placeholder={placeholder} />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            Save goal
          </Button>
        </div>
      </form>
    </Modal>
  );
}
